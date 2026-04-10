import { Response, NextFunction } from "express";
import { DeleteStage } from "../../../Application/Modules/Pipelines/UseCases/DeleteStage";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class DeleteStageController {
  constructor(private readonly deleteStage: DeleteStage) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.deleteStage.execute({ stageId: req.params.stageId, tenantId: req.tenantId! });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
