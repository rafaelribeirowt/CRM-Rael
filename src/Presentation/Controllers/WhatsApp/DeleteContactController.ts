import { Request, Response, NextFunction } from "express";
import { DeleteContact } from "../../../Application/Modules/WhatsApp/UseCases/DeleteContact";

export class DeleteContactController {
  constructor(private readonly deleteContact: DeleteContact) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.deleteContact.execute(req.params.contactId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
