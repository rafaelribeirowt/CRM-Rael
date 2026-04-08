import { Response, NextFunction } from "express";
import { z } from "zod";
import { MoveLead } from "../../../Application/Modules/Leads/UseCases/MoveLead";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const schema = z.object({
  stageId: z.string().min(1),
  position: z.number().int().min(0),
});

export class MoveLeadController {
  constructor(private readonly moveLead: MoveLead) {}

  handle = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.moveLead.execute({
        leadId: req.params.id,
        stageId: data.stageId,
        position: data.position,
        userId: req.userId,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
