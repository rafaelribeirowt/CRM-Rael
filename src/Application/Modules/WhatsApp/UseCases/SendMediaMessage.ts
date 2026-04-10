import { Message } from "../../../../Domain/WhatsApp/Models/Message";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IWhatsAppSessionRepository } from "../../../Contracts/Repositories/IWhatsAppSessionRepository";
import { IContactRepository } from "../../../Contracts/Repositories/IContactRepository";
import { IMessageRepository } from "../../../Contracts/Repositories/IMessageRepository";
import { IWhatsAppGateway } from "../../../Contracts/WhatsApp/IWhatsAppGateway";
import { saveMedia } from "../../../../Infrastructure/Storage/MediaStorage";
import { convertToOgg } from "../../../../Infrastructure/Storage/AudioConverter";

interface SendMediaMessageInput {
  userId: string;
  contactId: string;
  caption?: string;
  tenantId: string;
  file: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
  };
}

export class SendMediaMessage {
  constructor(
    private readonly sessionRepository: IWhatsAppSessionRepository,
    private readonly contactRepository: IContactRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly gateway: IWhatsAppGateway
  ) {}

  async execute(input: SendMediaMessageInput) {
    const session = await this.sessionRepository.findByUserId(input.userId, input.tenantId);
    if (!session || this.gateway.getStatus(session.id) !== "connected") {
      throw new AppError("WhatsApp not connected", 400, "NOT_CONNECTED");
    }

    const contact = await this.contactRepository.findById(input.contactId, input.tenantId);
    if (!contact) {
      throw new AppError("Contact not found", 404, "CONTACT_NOT_FOUND");
    }

    let fileBuffer = input.file.buffer;
    let fileMimeType = input.file.mimetype;

    // Convert audio to ogg/opus for WhatsApp compatibility
    if (fileMimeType.startsWith("audio/") && !fileMimeType.includes("ogg")) {
      try {
        fileBuffer = await convertToOgg(fileBuffer);
        fileMimeType = "audio/ogg; codecs=opus";
      } catch (err) {
        console.error("[WhatsApp] Audio conversion failed, sending as-is:", err);
      }
    }

    // Save media file locally
    const mediaUrl = saveMedia(fileBuffer, fileMimeType, input.file.originalname);

    // Determine media type
    let mediaType: string = "document";
    if (fileMimeType.startsWith("image/")) mediaType = "image";
    else if (fileMimeType.startsWith("video/")) mediaType = "video";
    else if (fileMimeType.startsWith("audio/")) mediaType = "audio";

    // Send via WhatsApp
    const whatsappMsgId = await this.gateway.sendMediaMessage(
      session.id,
      contact.whatsappId,
      fileBuffer,
      fileMimeType,
      input.caption,
      input.file.originalname
    );

    // Save message in DB
    const message = Message.create({
      contactId: contact.id,
      whatsappMsgId,
      direction: "outbound",
      content: input.caption || undefined,
      mediaType,
      mediaUrl,
      mediaMimeType: input.file.mimetype,
      isFromMe: true,
      sentBy: input.userId,
    });

    await this.messageRepository.save(message, input.tenantId);

    return message.toJSON();
  }
}
