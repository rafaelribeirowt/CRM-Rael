import { Response, NextFunction } from "express";
import { ListContacts } from "../../../Application/Modules/WhatsApp/UseCases/ListContacts";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class ListContactsController {
  constructor(private readonly listContacts: ListContacts) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.listContacts.execute(req.tenantId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
