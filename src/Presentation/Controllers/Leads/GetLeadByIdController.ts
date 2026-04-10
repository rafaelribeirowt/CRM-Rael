import { Response, NextFunction } from "express";
import { GetLeadById } from "../../../Application/Modules/Leads/UseCases/GetLeadById";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class GetLeadByIdController {
  constructor(private readonly getLeadById: GetLeadById) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.getLeadById.execute({ id: req.params.id, tenantId: req.tenantId! });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
