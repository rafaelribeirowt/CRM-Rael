import { Response, NextFunction } from "express";
import { GetPipelineWithStages } from "../../../Application/Modules/Pipelines/UseCases/GetPipelineWithStages";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class GetPipelineWithStagesController {
  constructor(
    private readonly getPipelineWithStages: GetPipelineWithStages
  ) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.getPipelineWithStages.execute({
        pipelineId: req.params.id,
        tenantId: req.tenantId!,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
