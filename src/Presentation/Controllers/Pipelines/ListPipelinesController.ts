import { Response, NextFunction } from "express";
import { ListPipelines } from "../../../Application/Modules/Pipelines/UseCases/ListPipelines";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class ListPipelinesController {
  constructor(private readonly listPipelines: ListPipelines) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const pipelines = await this.listPipelines.execute(req.tenantId!);
      res.json(pipelines);
    } catch (error) {
      next(error);
    }
  };
}
