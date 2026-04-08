import { Request, Response, NextFunction } from "express";
import { ListMessages } from "../../../Application/Modules/WhatsApp/UseCases/ListMessages";

export class ListMessagesController {
  constructor(private readonly listMessages: ListMessages) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.listMessages.execute(req.params.contactId, {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
