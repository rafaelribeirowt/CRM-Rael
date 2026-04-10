import { Response, NextFunction } from "express";
import { IBotSessionRepository } from "../../../Application/Contracts/Repositories/IBotSessionRepository";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class ListBotSessionsController {
  constructor(private readonly sessionRepository: IBotSessionRepository) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.tenantId!;
      const contactId = req.query.contactId as string | undefined;

      const sessions = contactId
        ? await this.sessionRepository.findByContactId(contactId, tenantId)
        : await this.sessionRepository.findAllSessions(tenantId);

      res.json(sessions.map((s) => s.toJSON()));
    } catch (error) {
      next(error);
    }
  };
}
