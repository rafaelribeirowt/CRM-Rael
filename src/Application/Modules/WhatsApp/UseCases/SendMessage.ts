import { Message } from "../../../../Domain/WhatsApp/Models/Message";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IWhatsAppSessionRepository } from "../../../Contracts/Repositories/IWhatsAppSessionRepository";
import { IContactRepository } from "../../../Contracts/Repositories/IContactRepository";
import { IMessageRepository } from "../../../Contracts/Repositories/IMessageRepository";
import { IWhatsAppGateway } from "../../../Contracts/WhatsApp/IWhatsAppGateway";

interface SendMessageInput {
  userId: string;
  contactId: string;
  content: string;
  tenantId: string;
}

export class SendMessage {
  constructor(
    private readonly sessionRepository: IWhatsAppSessionRepository,
    private readonly contactRepository: IContactRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly gateway: IWhatsAppGateway
  ) {}

  async execute(input: SendMessageInput) {
    const session = await this.sessionRepository.findByUserId(input.userId, input.tenantId);
    if (!session || this.gateway.getStatus(session.id) !== "connected") {
      throw new AppError("WhatsApp not connected", 400, "NOT_CONNECTED");
    }

    const contact = await this.contactRepository.findById(input.contactId, input.tenantId);
    if (!contact) {
      throw new AppError("Contact not found", 404, "CONTACT_NOT_FOUND");
    }

    const whatsappMsgId = await this.gateway.sendTextMessage(
      session.id,
      contact.whatsappId,
      input.content
    );

    const message = Message.create({
      contactId: contact.id,
      whatsappMsgId,
      direction: "outbound",
      content: input.content,
      mediaType: "text",
      isFromMe: true,
      sentBy: input.userId,
    });

    await this.messageRepository.save(message, input.tenantId);

    return message.toJSON();
  }
}
