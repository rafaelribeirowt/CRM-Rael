import { Response, NextFunction } from "express";
import { z } from "zod";
import { ReorderStages } from "../../../Application/Modules/Pipelines/UseCases/ReorderStages";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const schema = z.object({
  stageIds: z.array(z.string()).min(1),
});

export class ReorderStagesController {
  constructor(private readonly reorderStages: ReorderStages) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.reorderStages.execute({
        pipelineId: req.params.id,
        stageIds: data.stageIds,
        tenantId: req.tenantId!,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
