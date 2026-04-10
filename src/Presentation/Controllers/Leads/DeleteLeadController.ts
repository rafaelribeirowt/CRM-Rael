import { Response, NextFunction } from "express";
import { DeleteLead } from "../../../Application/Modules/Leads/UseCases/DeleteLead";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class DeleteLeadController {
  constructor(private readonly deleteLead: DeleteLead) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.deleteLead.execute({ id: req.params.id, tenantId: req.tenantId! });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
