import { AppError } from "../../../Contracts/Errors/AppError";
import { IWhatsAppSessionRepository } from "../../../Contracts/Repositories/IWhatsAppSessionRepository";
import { IContactRepository } from "../../../Contracts/Repositories/IContactRepository";
import { IMessageRepository } from "../../../Contracts/Repositories/IMessageRepository";
import { IWhatsAppGateway } from "../../../Contracts/WhatsApp/IWhatsAppGateway";

export class DeleteMessage {
  constructor(
    private readonly sessionRepository: IWhatsAppSessionRepository,
    private readonly contactRepository: IContactRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly gateway: IWhatsAppGateway
  ) {}

  async execute(input: { userId: string; messageId: string }) {
    const session = await this.sessionRepository.findByUserId(input.userId);
    if (!session || this.gateway.getStatus(session.id) !== "connected") {
      throw new AppError("WhatsApp not connected", 400, "NOT_CONNECTED");
    }

    const message = await this.messageRepository.findById(input.messageId);
    if (!message) {
      throw new AppError("Message not found", 404, "MESSAGE_NOT_FOUND");
    }
    if (!message.isFromMe) {
      throw new AppError("Can only delete your own messages", 400, "NOT_OWN_MESSAGE");
    }
    if (!message.whatsappMsgId) {
      throw new AppError("Message has no WhatsApp ID", 400, "NO_WA_ID");
    }

    const contact = await this.contactRepository.findById(message.contactId);
    if (!contact) {
      throw new AppError("Contact not found", 404, "CONTACT_NOT_FOUND");
    }

    // Delete for everyone on WhatsApp
    await this.gateway.deleteMessage(
      session.id,
      contact.whatsappId,
      message.whatsappMsgId
    );

    // Remove from DB
    await this.messageRepository.delete(input.messageId);

    return { success: true };
  }
}
