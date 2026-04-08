export interface IncomingMessage {
  remoteJid: string;
  messageId: string;
  pushName?: string;
  content: string | null;
  isFromMe: boolean;
  timestamp: Date;
  mediaType?: "text" | "image" | "audio" | "video" | "document" | "sticker";
  mediaBuffer?: Buffer;
  mediaMimeType?: string;
  mediaFileName?: string;
}

export interface IWhatsAppGateway {
  initialize(sessionId: string): Promise<void>;
  getQRCode(sessionId: string): string | null;
  disconnect(sessionId: string): Promise<void>;
  getStatus(sessionId: string): "disconnected" | "qr_pending" | "connected";
  sendTextMessage(sessionId: string, to: string, text: string): Promise<string>;
  sendMediaMessage(
    sessionId: string,
    to: string,
    mediaBuffer: Buffer,
    mimeType: string,
    caption?: string,
    fileName?: string
  ): Promise<string>;
  getProfilePicUrl(sessionId: string, jid: string): Promise<string | null>;
  editMessage(
    sessionId: string,
    to: string,
    messageId: string,
    newText: string
  ): Promise<void>;
  deleteMessage(
    sessionId: string,
    to: string,
    messageId: string
  ): Promise<void>;
  onMessage(
    callback: (sessionId: string, message: IncomingMessage) => Promise<void>
  ): void;
  onHistorySync(
    callback: (sessionId: string, messages: IncomingMessage[]) => Promise<void>
  ): void;
  onConnectionUpdate(
    callback: (
      sessionId: string,
      status: "connected" | "disconnected" | "qr_pending",
      qr?: string,
      phoneNumber?: string
    ) => Promise<void>
  ): void;
}
