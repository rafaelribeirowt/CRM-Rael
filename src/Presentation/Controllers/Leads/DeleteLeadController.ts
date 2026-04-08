import { Request, Response, NextFunction } from "express";
import { DeleteLead } from "../../../Application/Modules/Leads/UseCases/DeleteLead";

export class DeleteLeadController {
  constructor(private readonly deleteLead: DeleteLead) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.deleteLead.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
