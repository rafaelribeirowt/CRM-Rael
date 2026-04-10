import { Response, NextFunction } from "express";
import { DeleteContact } from "../../../Application/Modules/WhatsApp/UseCases/DeleteContact";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class DeleteContactController {
  constructor(private readonly deleteContact: DeleteContact) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.deleteContact.execute({
        contactId: req.params.contactId,
        tenantId: req.tenantId!,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
