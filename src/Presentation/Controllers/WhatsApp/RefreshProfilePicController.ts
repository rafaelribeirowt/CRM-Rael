import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";
import { IContactRepository } from "../../../Application/Contracts/Repositories/IContactRepository";
import { IWhatsAppSessionRepository } from "../../../Application/Contracts/Repositories/IWhatsAppSessionRepository";
import { IWhatsAppGateway } from "../../../Application/Contracts/WhatsApp/IWhatsAppGateway";
import { Contact } from "../../../Domain/WhatsApp/Models/Contact";
import { AppError } from "../../../Application/Contracts/Errors/AppError";

export class RefreshProfilePicController {
  constructor(
    private readonly contactRepository: IContactRepository,
    private readonly sessionRepository: IWhatsAppSessionRepository,
    private readonly gateway: IWhatsAppGateway
  ) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const contact = await this.contactRepository.findById(req.params.contactId);
      if (!contact) {
        throw new AppError("Contact not found", 404, "CONTACT_NOT_FOUND");
      }

      const session = await this.sessionRepository.findByUserId(req.userId!);
      if (!session || this.gateway.getStatus(session.id) !== "connected") {
        throw new AppError("WhatsApp not connected", 400, "NOT_CONNECTED");
      }

      const picUrl = await this.gateway.getProfilePicUrl(session.id, contact.whatsappId);

      const updated = new Contact({
        ...contact.props,
        profilePicUrl: picUrl,
        updatedAt: new Date(),
      });
      await this.contactRepository.save(updated);

      res.json({ profilePicUrl: picUrl });
    } catch (error) {
      next(error);
    }
  };
}
