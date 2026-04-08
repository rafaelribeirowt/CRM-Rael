import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";
import { IContactRepository } from "../../../Application/Contracts/Repositories/IContactRepository";
import { IWhatsAppSessionRepository } from "../../../Application/Contracts/Repositories/IWhatsAppSessionRepository";
import { IWhatsAppGateway } from "../../../Application/Contracts/WhatsApp/IWhatsAppGateway";
import { Contact } from "../../../Domain/WhatsApp/Models/Contact";

export class RefreshAllProfilePicsController {
  constructor(
    private readonly contactRepository: IContactRepository,
    private readonly sessionRepository: IWhatsAppSessionRepository,
    private readonly gateway: IWhatsAppGateway
  ) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const session = await this.sessionRepository.findByUserId(req.userId!);
      if (!session || this.gateway.getStatus(session.id) !== "connected") {
        return res.json({ updated: 0, message: "WhatsApp not connected" });
      }

      const contacts = await this.contactRepository.findAll();
      let updated = 0;

      for (const contact of contacts) {
        try {
          const picUrl = await this.gateway.getProfilePicUrl(session.id, contact.whatsappId);
          if (picUrl && picUrl !== contact.profilePicUrl) {
            const updatedContact = new Contact({
              ...contact.props,
              profilePicUrl: picUrl,
              updatedAt: new Date(),
            });
            await this.contactRepository.save(updatedContact);
            updated++;
          }
        } catch {
          // Some contacts may have privacy settings blocking profile pic
        }
      }

      res.json({ updated, total: contacts.length });
    } catch (error) {
      next(error);
    }
  };
}
