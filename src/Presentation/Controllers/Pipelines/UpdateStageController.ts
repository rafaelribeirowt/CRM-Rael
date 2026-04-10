import { Response, NextFunction } from "express";
import { z } from "zod";
import { UpdateStage } from "../../../Application/Modules/Pipelines/UseCases/UpdateStage";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const schema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
  isWon: z.boolean().optional(),
  isLost: z.boolean().optional(),
});

export class UpdateStageController {
  constructor(private readonly updateStage: UpdateStage) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.updateStage.execute({
        stageId: req.params.stageId,
        tenantId: req.tenantId!,
        ...data,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
