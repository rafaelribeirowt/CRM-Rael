import { v4 as uuid } from "uuid";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IWhatsAppSessionRepository } from "../../../Contracts/Repositories/IWhatsAppSessionRepository";
import { IContactRepository } from "../../../Contracts/Repositories/IContactRepository";
import { IMessageRepository } from "../../../Contracts/Repositories/IMessageRepository";
import { IWhatsAppGateway } from "../../../Contracts/WhatsApp/IWhatsAppGateway";
import { Contact } from "../../../../Domain/WhatsApp/Models/Contact";
import { Message } from "../../../../Domain/WhatsApp/Models/Message";

interface Input {
  tenantId: string;
  phone: string;
  message: string;
  sessionId?: string;
}

export class SendMessageByPhone {
  constructor(
    private readonly sessionRepo: IWhatsAppSessionRepository,
    private readonly contactRepo: IContactRepository,
    private readonly messageRepo: IMessageRepository,
    private readonly gateway: IWhatsAppGateway
  ) {}

  async execute(input: Input) {
    // Find a connected session
    let sessionId = input.sessionId;

    if (sessionId) {
      const session = await this.sessionRepo.findById(sessionId, input.tenantId);
      if (!session) throw new AppError("Session not found", 404, "SESSION_NOT_FOUND");
      if (this.gateway.getStatus(sessionId) !== "connected") {
        throw new AppError("Session is not connected", 400, "SESSION_NOT_CONNECTED");
      }
    } else {
      // Use first connected session for this tenant
      const sessions = await this.sessionRepo.findAllByTenantId(input.tenantId);
      const connected = sessions.find(
        (s) => this.gateway.getStatus(s.id) === "connected"
      );
      if (!connected) {
        throw new AppError("No connected WhatsApp session", 400, "NO_CONNECTED_SESSION");
      }
      sessionId = connected.id;
    }

    // Normalize phone to WhatsApp JID
    const phone = input.phone.replace(/\D/g, "");
    const whatsappId = `${phone}@s.whatsapp.net`;

    // Find or create contact
    let contact = await this.contactRepo.findByWhatsAppId(whatsappId, input.tenantId);
    if (!contact) {
      contact = Contact.create({
        whatsappId,
        phone,
        name: phone,
      });
      await this.contactRepo.save(contact, input.tenantId);
    }

    // Send message
    const whatsappMsgId = await this.gateway.sendTextMessage(
      sessionId,
      whatsappId,
      input.message
    );

    // Save message
    const message = Message.create({
      contactId: contact.id,
      whatsappMsgId,
      direction: "outbound",
      content: input.message,
      timestamp: new Date(),
      isFromMe: true,
    });
    await this.messageRepo.save(message, input.tenantId);

    return {
      messageId: message.id,
      whatsappMsgId,
      contactId: contact.id,
      phone,
      status: "sent",
    };
  }
}
