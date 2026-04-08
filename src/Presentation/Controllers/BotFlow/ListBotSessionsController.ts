import { Request, Response, NextFunction } from "express";
import { IBotSessionRepository } from "../../../Application/Contracts/Repositories/IBotSessionRepository";

export class ListBotSessionsController {
  constructor(private readonly sessionRepository: IBotSessionRepository) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.query.contactId as string | undefined;

      const sessions = contactId
        ? await this.sessionRepository.findByContactId(contactId)
        : await this.sessionRepository.findAllSessions();

      res.json(sessions.map((s) => s.toJSON()));
    } catch (error) {
      next(error);
    }
  };
}
