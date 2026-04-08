import { Request, Response, NextFunction } from "express";
import { DeleteStage } from "../../../Application/Modules/Pipelines/UseCases/DeleteStage";

export class DeleteStageController {
  constructor(private readonly deleteStage: DeleteStage) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.deleteStage.execute(req.params.stageId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
