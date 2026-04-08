import { Request, Response, NextFunction } from "express";
import { GetLeadById } from "../../../Application/Modules/Leads/UseCases/GetLeadById";

export class GetLeadByIdController {
  constructor(private readonly getLeadById: GetLeadById) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.getLeadById.execute(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
