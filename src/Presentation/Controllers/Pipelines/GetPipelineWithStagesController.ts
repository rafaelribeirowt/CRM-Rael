import { Request, Response, NextFunction } from "express";
import { GetPipelineWithStages } from "../../../Application/Modules/Pipelines/UseCases/GetPipelineWithStages";

export class GetPipelineWithStagesController {
  constructor(
    private readonly getPipelineWithStages: GetPipelineWithStages
  ) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.getPipelineWithStages.execute(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
