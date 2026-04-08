import { Request, Response, NextFunction } from "express";
import { ListContacts } from "../../../Application/Modules/WhatsApp/UseCases/ListContacts";

export class ListContactsController {
  constructor(private readonly listContacts: ListContacts) {}

  handle = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.listContacts.execute();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
