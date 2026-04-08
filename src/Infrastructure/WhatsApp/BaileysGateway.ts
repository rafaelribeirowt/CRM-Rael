import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  proto,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  downloadMediaMessage,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import {
  IWhatsAppGateway,
  IncomingMessage,
} from "../../Application/Contracts/WhatsApp/IWhatsAppGateway";
import { env } from "../../Shared/Env";

const logger = pino({ level: "silent" });

type MessageCallback = (
  sessionId: string,
  message: IncomingMessage
) => Promise<void>;
type HistorySyncCallback = (
  sessionId: string,
  messages: IncomingMessage[]
) => Promise<void>;
type ConnectionCallback = (
  sessionId: string,
  status: "connected" | "disconnected" | "qr_pending",
  qr?: string,
  phoneNumber?: string
) => Promise<void>;

const MAX_RETRIES = 3;

export class BaileysGateway implements IWhatsAppGateway {
  private sockets = new Map<string, WASocket>();
  private qrCodes = new Map<string, string>();
  private statuses = new Map<
    string,
    "disconnected" | "qr_pending" | "connected"
  >();
  private retryCount = new Map<string, number>();
  private messageCallbacks: MessageCallback[] = [];
  private historySyncCallbacks: HistorySyncCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];

  async initialize(sessionId: string): Promise<void> {
    if (this.sockets.has(sessionId)) {
      return;
    }

    const authDir = path.resolve(env.WHATSAPP_AUTH_DIR, sessionId);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const { version } = await fetchLatestBaileysVersion();

    console.log(`[WhatsApp] Using WA version: ${version.join(".")}`);

    const sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      logger,
      printQRInTerminal: true,
      generateHighQualityLinkPreview: false,
      browser: ["CRM Rael", "Chrome", "1.0.0"],
    });

    this.sockets.set(sessionId, sock);
    this.statuses.set(sessionId, "disconnected");

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log(`[WhatsApp] QR code generated for session ${sessionId}`);
        this.qrCodes.set(sessionId, qr);
        this.statuses.set(sessionId, "qr_pending");
        for (const cb of this.connectionCallbacks) {
          await cb(sessionId, "qr_pending", qr);
        }
      }

      if (connection === "open") {
        console.log(`[WhatsApp] Session ${sessionId} connected!`);
        this.qrCodes.delete(sessionId);
        this.statuses.set(sessionId, "connected");
        this.retryCount.set(sessionId, 0);
        const phoneNumber = sock.user?.id?.split(":")[0] ?? null;
        for (const cb of this.connectionCallbacks) {
          await cb(
            sessionId,
            "connected",
            undefined,
            phoneNumber ?? undefined
          );
        }
      }

      if (connection === "close") {
        this.sockets.delete(sessionId);
        this.qrCodes.delete(sessionId);
        this.statuses.set(sessionId, "disconnected");

        const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const retries = this.retryCount.get(sessionId) ?? 0;

        console.log(`[WhatsApp] Session ${sessionId} closed. Reason: ${reason}`);

        if (reason === DisconnectReason.loggedOut) {
          this.retryCount.delete(sessionId);
          if (fs.existsSync(authDir)) {
            fs.rmSync(authDir, { recursive: true, force: true });
          }
        } else if (retries < MAX_RETRIES) {
          this.retryCount.set(sessionId, retries + 1);
          const delay = Math.min(5000 * (retries + 1), 30000);
          console.log(
            `[WhatsApp] Reconnecting session ${sessionId} (attempt ${retries + 1}/${MAX_RETRIES}) in ${delay / 1000}s`
          );
          setTimeout(() => this.initialize(sessionId), delay);
        } else {
          console.log(
            `[WhatsApp] Max retries reached for session ${sessionId}, stopping.`
          );
          this.retryCount.delete(sessionId);
        }

        for (const cb of this.connectionCallbacks) {
          await cb(sessionId, "disconnected");
        }
      }
    });

    sock.ev.on("messages.upsert", async ({ messages: msgs, type }) => {
      if (type !== "notify") return;

      for (const msg of msgs) {
        if (!msg.message) continue;

        const remoteJid = msg.key.remoteJid;
        if (!remoteJid || remoteJid === "status@broadcast") continue;
        if (remoteJid.endsWith("@g.us")) continue;

        const incoming = await this.parseMessage(msg);

        for (const cb of this.messageCallbacks) {
          await cb(sessionId, incoming);
        }
      }
    });

    // History sync - receive old messages when first connecting
    sock.ev.on("messaging-history.set", async ({ messages: msgs, isLatest }) => {
      console.log(`[WhatsApp] History sync: ${msgs.length} messages (isLatest: ${isLatest})`);

      const parsed: IncomingMessage[] = [];

      for (const msg of msgs) {
        if (!msg.message) continue;

        const remoteJid = msg.key.remoteJid;
        if (!remoteJid || remoteJid === "status@broadcast") continue;
        if (remoteJid.endsWith("@g.us")) continue;

        const content = this.extractMessageContent(msg);
        const isFromMe = msg.key.fromMe ?? false;

        parsed.push({
          remoteJid,
          messageId: msg.key.id ?? "",
          pushName: msg.pushName ?? undefined,
          content,
          isFromMe,
          timestamp: new Date(
            (msg.messageTimestamp as number) * 1000 || Date.now()
          ),
        });
      }

      if (parsed.length > 0) {
        for (const cb of this.historySyncCallbacks) {
          await cb(sessionId, parsed);
        }
      }
    });
  }

  getQRCode(sessionId: string): string | null {
    return this.qrCodes.get(sessionId) ?? null;
  }

  async disconnect(sessionId: string): Promise<void> {
    const sock = this.sockets.get(sessionId);
    if (sock) {
      await sock.logout();
      this.sockets.delete(sessionId);
      this.qrCodes.delete(sessionId);
      this.statuses.set(sessionId, "disconnected");
    }
  }

  getStatus(
    sessionId: string
  ): "disconnected" | "qr_pending" | "connected" {
    return this.statuses.get(sessionId) ?? "disconnected";
  }

  async sendTextMessage(
    sessionId: string,
    to: string,
    text: string
  ): Promise<string> {
    const sock = this.sockets.get(sessionId);
    if (!sock) throw new Error("Session not connected");

    const jid = to.includes("@") ? to : `${to}@s.whatsapp.net`;
    const result = await sock.sendMessage(jid, { text });
    return result?.key?.id ?? "";
  }

  async sendMediaMessage(
    sessionId: string,
    to: string,
    mediaBuffer: Buffer,
    mimeType: string,
    caption?: string,
    fileName?: string
  ): Promise<string> {
    const sock = this.sockets.get(sessionId);
    if (!sock) throw new Error("Session not connected");

    const jid = to.includes("@") ? to : `${to}@s.whatsapp.net`;
    let msg: any;

    if (mimeType.startsWith("image/")) {
      msg = { image: mediaBuffer, caption, mimetype: mimeType };
    } else if (mimeType.startsWith("video/")) {
      msg = { video: mediaBuffer, caption, mimetype: mimeType };
    } else if (mimeType.startsWith("audio/")) {
      msg = { audio: mediaBuffer, mimetype: "audio/ogg; codecs=opus", ptt: true };
    } else {
      msg = {
        document: mediaBuffer,
        mimetype: mimeType,
        fileName: fileName || "file",
        caption,
      };
    }

    const result = await sock.sendMessage(jid, msg);
    return result?.key?.id ?? "";
  }

  async getProfilePicUrl(sessionId: string, jid: string): Promise<string | null> {
    const sock = this.sockets.get(sessionId);
    if (!sock) return null;

    try {
      const url = await sock.profilePictureUrl(jid, "image");
      return url ?? null;
    } catch {
      return null;
    }
  }

  async editMessage(
    sessionId: string,
    to: string,
    messageId: string,
    newText: string
  ): Promise<void> {
    const sock = this.sockets.get(sessionId);
    if (!sock) throw new Error("Session not connected");

    const jid = to.includes("@") ? to : `${to}@s.whatsapp.net`;
    await sock.sendMessage(jid, {
      text: newText,
      edit: { remoteJid: jid, id: messageId, fromMe: true },
    } as any);
  }

  async deleteMessage(
    sessionId: string,
    to: string,
    messageId: string
  ): Promise<void> {
    const sock = this.sockets.get(sessionId);
    if (!sock) throw new Error("Session not connected");

    const jid = to.includes("@") ? to : `${to}@s.whatsapp.net`;
    await sock.sendMessage(jid, {
      delete: { remoteJid: jid, id: messageId, fromMe: true },
    });
  }

  onMessage(callback: MessageCallback): void {
    this.messageCallbacks.push(callback);
  }

  onHistorySync(callback: HistorySyncCallback): void {
    this.historySyncCallbacks.push(callback);
  }

  onConnectionUpdate(callback: ConnectionCallback): void {
    this.connectionCallbacks.push(callback);
  }

  private async parseMessage(
    msg: proto.IWebMessageInfo
  ): Promise<IncomingMessage> {
    const m = msg.message!;
    const remoteJid = msg.key.remoteJid!;
    const isFromMe = msg.key.fromMe ?? false;

    const base: IncomingMessage = {
      remoteJid,
      messageId: msg.key.id ?? "",
      pushName: msg.pushName ?? undefined,
      content: null,
      isFromMe,
      timestamp: new Date(
        (msg.messageTimestamp as number) * 1000 || Date.now()
      ),
      mediaType: "text",
    };

    // Text messages
    if (m.conversation) {
      base.content = m.conversation;
      return base;
    }
    if (m.extendedTextMessage?.text) {
      base.content = m.extendedTextMessage.text;
      return base;
    }

    // Media messages
    const mediaMap: {
      key: keyof proto.IMessage;
      type: "image" | "audio" | "video" | "document" | "sticker";
    }[] = [
      { key: "imageMessage", type: "image" },
      { key: "videoMessage", type: "video" },
      { key: "audioMessage", type: "audio" },
      { key: "documentMessage", type: "document" },
      { key: "stickerMessage", type: "sticker" },
    ];

    for (const { key, type } of mediaMap) {
      const mediaMsg = m[key] as any;
      if (mediaMsg) {
        base.mediaType = type;
        base.mediaMimeType = mediaMsg.mimetype ?? undefined;
        base.mediaFileName = mediaMsg.fileName ?? undefined;
        base.content = mediaMsg.caption ?? null;

        // Try to download media
        try {
          const buffer = await downloadMediaMessage(
            msg,
            "buffer",
            {}
          );
          if (buffer) {
            base.mediaBuffer = buffer as Buffer;
          }
        } catch (err) {
          console.error(`[WhatsApp] Failed to download ${type} media:`, err);
        }
        return base;
      }
    }

    // Other types
    if (m.contactMessage) {
      base.content = "[Contato]";
      return base;
    }
    if (m.locationMessage) {
      base.content = "[Localizacao]";
      return base;
    }

    return base;
  }

  private getExtFromMime(mime: string): string {
    const map: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "video/mp4": "mp4",
      "audio/ogg; codecs=opus": "ogg",
      "audio/ogg": "ogg",
      "audio/mpeg": "mp3",
      "audio/mp4": "m4a",
      "application/pdf": "pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    };
    return map[mime] || mime.split("/")[1] || "bin";
  }
}
