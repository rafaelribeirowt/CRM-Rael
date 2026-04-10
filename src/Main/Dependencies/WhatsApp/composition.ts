import { BaileysGateway } from "../../../Infrastructure/WhatsApp/BaileysGateway";
import { DrizzleWhatsAppSessionRepository } from "../../../Infrastructure/Database/Repositories/DrizzleWhatsAppSessionRepository";
import { DrizzleContactRepository } from "../../../Infrastructure/Database/Repositories/DrizzleContactRepository";
import { DrizzleMessageRepository } from "../../../Infrastructure/Database/Repositories/DrizzleMessageRepository";
import { DrizzleLeadRepository } from "../../../Infrastructure/Database/Repositories/DrizzleLeadRepository";
import { DrizzlePipelineRepository } from "../../../Infrastructure/Database/Repositories/DrizzlePipelineRepository";
import { DrizzlePipelineStageRepository } from "../../../Infrastructure/Database/Repositories/DrizzlePipelineStageRepository";
import { DrizzleActivityRepository } from "../../../Infrastructure/Database/Repositories/DrizzleActivityRepository";
import { DrizzleSubscriptionRepository } from "../../../Infrastructure/Database/Repositories/DrizzleSubscriptionRepository";
import { DrizzlePlanRepository } from "../../../Infrastructure/Database/Repositories/DrizzlePlanRepository";
import { DrizzleUserRepository } from "../../../Infrastructure/Database/Repositories/DrizzleUserRepository";
import { LimitEnforcer } from "../../../Application/Services/LimitEnforcer";
import { InitializeSession } from "../../../Application/Modules/WhatsApp/UseCases/InitializeSession";
import { GetSessionStatus } from "../../../Application/Modules/WhatsApp/UseCases/GetSessionStatus";
import { DisconnectSession } from "../../../Application/Modules/WhatsApp/UseCases/DisconnectSession";
import { SendMessage } from "../../../Application/Modules/WhatsApp/UseCases/SendMessage";
import { SendMediaMessage } from "../../../Application/Modules/WhatsApp/UseCases/SendMediaMessage";
import { EditMessage } from "../../../Application/Modules/WhatsApp/UseCases/EditMessage";
import { DeleteMessage } from "../../../Application/Modules/WhatsApp/UseCases/DeleteMessage";
import { ListMessages } from "../../../Application/Modules/WhatsApp/UseCases/ListMessages";
import { ListContacts } from "../../../Application/Modules/WhatsApp/UseCases/ListContacts";
import { ConvertContactToLead } from "../../../Application/Modules/WhatsApp/UseCases/ConvertContactToLead";
import { DeleteContact } from "../../../Application/Modules/WhatsApp/UseCases/DeleteContact";
import { UpdateContactName } from "../../../Application/Modules/WhatsApp/UseCases/UpdateContactName";
import { InitializeSessionController } from "../../../Presentation/Controllers/WhatsApp/InitializeSessionController";
import { GetSessionStatusController } from "../../../Presentation/Controllers/WhatsApp/GetSessionStatusController";
import { DisconnectSessionController } from "../../../Presentation/Controllers/WhatsApp/DisconnectSessionController";
import { SendMessageController } from "../../../Presentation/Controllers/WhatsApp/SendMessageController";
import { ListMessagesController } from "../../../Presentation/Controllers/WhatsApp/ListMessagesController";
import { ListContactsController } from "../../../Presentation/Controllers/WhatsApp/ListContactsController";
import { ConvertContactToLeadController } from "../../../Presentation/Controllers/WhatsApp/ConvertContactToLeadController";
import { DeleteContactController } from "../../../Presentation/Controllers/WhatsApp/DeleteContactController";
import { SendMediaMessageController } from "../../../Presentation/Controllers/WhatsApp/SendMediaMessageController";
import { EditMessageController } from "../../../Presentation/Controllers/WhatsApp/EditMessageController";
import { DeleteMessageController } from "../../../Presentation/Controllers/WhatsApp/DeleteMessageController";
import { RefreshProfilePicController } from "../../../Presentation/Controllers/WhatsApp/RefreshProfilePicController";
import { RefreshAllProfilePicsController } from "../../../Presentation/Controllers/WhatsApp/RefreshAllProfilePicsController";
import { UpdateContactNameController } from "../../../Presentation/Controllers/WhatsApp/UpdateContactNameController";
import { ListSessions } from "../../../Application/Modules/WhatsApp/UseCases/ListSessions";
import { DeleteSession } from "../../../Application/Modules/WhatsApp/UseCases/DeleteSession";
import { ListSessionsController } from "../../../Presentation/Controllers/WhatsApp/ListSessionsController";
import { DeleteSessionController } from "../../../Presentation/Controllers/WhatsApp/DeleteSessionController";
import { ToggleContactFlag } from "../../../Application/Modules/WhatsApp/UseCases/ToggleContactFlag";
import { ListIgnoredContacts } from "../../../Application/Modules/WhatsApp/UseCases/ListIgnoredContacts";
import { ToggleContactFlagController } from "../../../Presentation/Controllers/WhatsApp/ToggleContactFlagController";
import { ListIgnoredContactsController } from "../../../Presentation/Controllers/WhatsApp/ListIgnoredContactsController";
import { Contact } from "../../../Domain/WhatsApp/Models/Contact";
import { Message } from "../../../Domain/WhatsApp/Models/Message";
import { Lead } from "../../../Domain/Leads/Models/Lead";
import { Activity } from "../../../Domain/Activities/Models/Activity";
import { saveMedia } from "../../../Infrastructure/Storage/MediaStorage";
import type { IncomingMessage } from "../../../Application/Contracts/WhatsApp/IWhatsAppGateway";
import { eq } from "drizzle-orm";
import { db } from "../../../Infrastructure/Database/Drizzle/client";
import { whatsappSessions } from "../../../Infrastructure/Database/Schemas/whatsappSessions";

// Repositories
const sessionRepository = new DrizzleWhatsAppSessionRepository();
const contactRepository = new DrizzleContactRepository();
const messageRepository = new DrizzleMessageRepository();
const leadRepository = new DrizzleLeadRepository();
const pipelineRepository = new DrizzlePipelineRepository();
const stageRepository = new DrizzlePipelineStageRepository();
const activityRepository = new DrizzleActivityRepository();

// Additional repositories for limit enforcement
const subscriptionRepository = new DrizzleSubscriptionRepository();
const planRepository = new DrizzlePlanRepository();
const userRepository = new DrizzleUserRepository();
const limitEnforcer = new LimitEnforcer(subscriptionRepository, planRepository, leadRepository, userRepository, sessionRepository);

// Gateway (singleton)
export const baileysGateway = new BaileysGateway();

// Use cases
const initializeSession = new InitializeSession(sessionRepository, baileysGateway, limitEnforcer);
const getSessionStatus = new GetSessionStatus(sessionRepository, baileysGateway);
const disconnectSession = new DisconnectSession(sessionRepository, baileysGateway);
const listSessions = new ListSessions(sessionRepository, baileysGateway);
const deleteSession = new DeleteSession(sessionRepository, baileysGateway);
const sendMessage = new SendMessage(sessionRepository, contactRepository, messageRepository, baileysGateway);
const sendMediaMessage = new SendMediaMessage(sessionRepository, contactRepository, messageRepository, baileysGateway);
const editMessage = new EditMessage(sessionRepository, contactRepository, messageRepository, baileysGateway);
const deleteMessage = new DeleteMessage(sessionRepository, contactRepository, messageRepository, baileysGateway);
const listMessages = new ListMessages(messageRepository);
const listContacts = new ListContacts(contactRepository, messageRepository);
const convertContactToLead = new ConvertContactToLead(contactRepository, leadRepository, stageRepository, activityRepository);
const deleteContact = new DeleteContact(contactRepository);
const updateContactName = new UpdateContactName(contactRepository);
const toggleContactFlag = new ToggleContactFlag(contactRepository);
const listIgnoredContacts = new ListIgnoredContacts(contactRepository);

// Controllers
export const initializeSessionController = new InitializeSessionController(initializeSession);
export const getSessionStatusController = new GetSessionStatusController(getSessionStatus);
export const disconnectSessionController = new DisconnectSessionController(disconnectSession);
export const listSessionsController = new ListSessionsController(listSessions);
export const deleteSessionController = new DeleteSessionController(deleteSession);
export const sendMessageController = new SendMessageController(sendMessage);
export const listMessagesController = new ListMessagesController(listMessages);
export const listContactsController = new ListContactsController(listContacts);
export const convertContactToLeadController = new ConvertContactToLeadController(convertContactToLead);
export const deleteContactController = new DeleteContactController(deleteContact);
export const sendMediaMessageController = new SendMediaMessageController(sendMediaMessage);
export const editMessageController = new EditMessageController(editMessage);
export const deleteMessageController = new DeleteMessageController(deleteMessage);
export const updateContactNameController = new UpdateContactNameController(updateContactName);
export const refreshProfilePicController = new RefreshProfilePicController(contactRepository, sessionRepository, baileysGateway);
export const refreshAllProfilePicsController = new RefreshAllProfilePicsController(contactRepository, sessionRepository, baileysGateway);
export const toggleContactFlagController = new ToggleContactFlagController(toggleContactFlag);
export const listIgnoredContactsController = new ListIgnoredContactsController(listIgnoredContacts);

// Helper: look up tenantId from a WhatsApp session ID
async function getTenantIdFromSessionId(sessionId: string): Promise<string | null> {
  const rows = await db
    .select({ tenantId: whatsappSessions.tenantId })
    .from(whatsappSessions)
    .where(eq(whatsappSessions.id, sessionId))
    .limit(1);
  return rows[0]?.tenantId ?? null;
}

// Setup message handler - auto-creates contacts and leads from incoming WhatsApp messages
let ioGetter: (() => import("socket.io").Server) | null = null;
let botEngineRef: import("../../../Application/Modules/BotFlow/Engine/BotEngine").BotEngine | null = null;

export function setBotEngine(engine: import("../../../Application/Modules/BotFlow/Engine/BotEngine").BotEngine) {
  botEngineRef = engine;
}

export function setupWhatsAppHandlers(getIO: () => import("socket.io").Server) {
  ioGetter = getIO;

  // Handle incoming messages
  baileysGateway.onMessage(async (sessionId: string, msg: IncomingMessage) => {
    try {
      // Derive tenantId from sessionId
      const tenantId = await getTenantIdFromSessionId(sessionId);
      if (!tenantId) {
        console.error(`[WhatsApp] No tenant found for session ${sessionId}`);
        return;
      }

      const phone = msg.remoteJid.replace("@s.whatsapp.net", "");
      console.log(`[WhatsApp] Message received from ${phone}: "${msg.content}"`);

      // Find or create contact
      let contact = await contactRepository.findByWhatsAppId(msg.remoteJid, tenantId);
      let isNewContact = false;

      // Skip ignored contacts
      if (contact?.isIgnored) {
        console.log(`[WhatsApp] Ignoring message from ignored contact ${phone}`);
        return;
      }

      if (!contact) {
        isNewContact = true;

        // Try to fetch profile picture
        let profilePicUrl: string | undefined;
        try {
          profilePicUrl = (await baileysGateway.getProfilePicUrl(sessionId, msg.remoteJid)) ?? undefined;
        } catch {}

        // Save contact first (without leadId)
        contact = Contact.create({
          whatsappId: msg.remoteJid,
          phone,
          pushName: msg.pushName,
          name: msg.pushName,
          profilePicUrl,
        });
        await contactRepository.save(contact, tenantId);
        console.log(`[WhatsApp] Contact created: ${contact.id}`);
      }

      // Auto-create lead for new contacts
      if (isNewContact) {
        try {
          let lead = await leadRepository.findByPhone(phone, tenantId);
          if (!lead) {
            const defaultPipeline = await pipelineRepository.findDefault(tenantId);
            console.log(`[WhatsApp] Default pipeline: ${defaultPipeline?.id ?? "NOT FOUND"}`);

            if (defaultPipeline) {
              const firstStage = await stageRepository.findFirstByPipelineId(defaultPipeline.id, tenantId);
              console.log(`[WhatsApp] First stage: ${firstStage?.id ?? "NOT FOUND"}`);

              if (firstStage) {
                lead = Lead.create({
                  name: msg.pushName || phone,
                  phone,
                  stageId: firstStage.id,
                  pipelineId: defaultPipeline.id,
                  source: "whatsapp",
                });
                await leadRepository.save(lead, tenantId);
                console.log(`[WhatsApp] Lead created: ${lead.id} - ${lead.name}`);

                const activity = Activity.create({
                  leadId: lead.id,
                  type: "created",
                  description: `Lead auto-criado via WhatsApp`,
                });
                await activityRepository.save(activity, tenantId);

                if (ioGetter) {
                  ioGetter().emit("lead:created", lead.toJSON());
                }
              }
            }
          }

          // Update contact with lead reference
          if (lead) {
            const updatedContact = new Contact({
              ...contact.props,
              leadId: lead.id,
            });
            await contactRepository.save(updatedContact, tenantId);
            contact = updatedContact;
            console.log(`[WhatsApp] Contact linked to lead: ${lead.id}`);
          }
        } catch (leadErr) {
          console.error("[WhatsApp] Error creating lead:", leadErr);
        }
      }

      // Save media file if present
      let mediaUrl: string | undefined;
      if (msg.mediaBuffer && msg.mediaMimeType) {
        try {
          mediaUrl = saveMedia(msg.mediaBuffer, msg.mediaMimeType, msg.mediaFileName);
          console.log(`[WhatsApp] Media saved: ${mediaUrl}`);
        } catch (err) {
          console.error("[WhatsApp] Error saving media:", err);
        }
      }

      // Save message
      const message = Message.create({
        contactId: contact.id,
        whatsappMsgId: msg.messageId,
        direction: msg.isFromMe ? "outbound" : "inbound",
        content: msg.content ?? undefined,
        mediaType: msg.mediaType || "text",
        mediaUrl,
        mediaMimeType: msg.mediaMimeType ?? undefined,
        isFromMe: msg.isFromMe,
        timestamp: msg.timestamp,
      });
      await messageRepository.save(message, tenantId);
      console.log(`[WhatsApp] Message saved: ${message.id}`);

      // Emit to socket
      if (ioGetter) {
        ioGetter()
          .to(`conversation:${contact.id}`)
          .emit("message:received", {
            message: message.toJSON(),
            contact: contact.toJSON(),
          });

        ioGetter().emit("message:received:global", {
          message: message.toJSON(),
          contact: contact.toJSON(),
        });
      }

      // Bot engine - process inbound messages
      if (!msg.isFromMe && botEngineRef) {
        try {
          const result = await botEngineRef.handleIncomingMessage(
            contact.id,
            msg.content,
            tenantId,
            contact.leadId,
            {
              mediaType: msg.mediaType,
              mediaBuffer: msg.mediaBuffer,
              mediaMimeType: msg.mediaMimeType,
              mediaUrl,
            }
          );
          if (result.handled) {
            console.log(`[WhatsApp] Bot handled message from ${phone}`);
          }
        } catch (botErr) {
          console.error("[WhatsApp] Bot engine error:", botErr);
        }
      }
    } catch (err) {
      console.error("[WhatsApp] Error handling message:", err);
    }
  });

  // Handle history sync - save old messages in bulk
  baileysGateway.onHistorySync(async (sessionId: string, msgs: IncomingMessage[]) => {
    // Derive tenantId from sessionId
    const tenantId = await getTenantIdFromSessionId(sessionId);
    if (!tenantId) {
      console.error(`[WhatsApp] No tenant found for session ${sessionId} during history sync`);
      return;
    }

    console.log(`[WhatsApp] Processing history sync: ${msgs.length} messages`);
    let savedCount = 0;

    for (const msg of msgs) {
      try {
        const phone = msg.remoteJid.replace("@s.whatsapp.net", "");

        // Find or create contact (only contact, no lead - user chooses manually)
        let contact = await contactRepository.findByWhatsAppId(msg.remoteJid, tenantId);
        if (!contact) {
          contact = Contact.create({
            whatsappId: msg.remoteJid,
            phone,
            pushName: msg.pushName,
            name: msg.pushName,
          });
          await contactRepository.save(contact, tenantId);
        }

        // Save message (skip duplicates via onConflictDoNothing on whatsapp_msg_id)
        const message = Message.create({
          contactId: contact.id,
          whatsappMsgId: msg.messageId,
          direction: msg.isFromMe ? "outbound" : "inbound",
          content: msg.content ?? undefined,
          mediaType: "text",
          isFromMe: msg.isFromMe,
          timestamp: msg.timestamp,
        });
        await messageRepository.save(message, tenantId);
        savedCount++;
      } catch {
        // Skip duplicates and errors silently
      }
    }

    console.log(`[WhatsApp] History sync complete: ${savedCount}/${msgs.length} messages saved`);
  });

  // Handle connection updates
  baileysGateway.onConnectionUpdate(async (sessionId, status, qr, phoneNumber) => {
    try {
      await sessionRepository.updateStatus(sessionId, status, phoneNumber);

      if (ioGetter) {
        if (status === "qr_pending" && qr) {
          ioGetter().emit("whatsapp:qr", { qr });
        } else if (status === "connected") {
          ioGetter().emit("whatsapp:connected", { sessionId, phoneNumber });
        } else if (status === "disconnected") {
          ioGetter().emit("whatsapp:disconnected", { sessionId });
        }
      }
    } catch (err) {
      console.error("[WhatsApp] Error handling connection update:", err);
    }
  });
}

// Reconnect existing sessions on startup (across ALL tenants)
export async function reconnectSessions() {
  const sessions = await sessionRepository.findConnected();
  for (const session of sessions) {
    console.log(`[WhatsApp] Reconnecting session: ${session.id}`);
    await baileysGateway.initialize(session.id);
  }
}
