import { Response, NextFunction } from "express";
import { ListMessages } from "../../../Application/Modules/WhatsApp/UseCases/ListMessages";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class ListMessagesController {
  constructor(private readonly listMessages: ListMessages) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.listMessages.execute({
        contactId: req.params.contactId,
        pagination: {
          page: req.query.page ? Number(req.query.page) : undefined,
          limit: req.query.limit ? Number(req.query.limit) : undefined,
        },
        tenantId: req.tenantId!,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
