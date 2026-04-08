import { Request, Response, NextFunction } from "express";
import { ListPipelines } from "../../../Application/Modules/Pipelines/UseCases/ListPipelines";

export class ListPipelinesController {
  constructor(private readonly listPipelines: ListPipelines) {}

  handle = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const pipelines = await this.listPipelines.execute();
      res.json(pipelines);
    } catch (error) {
      next(error);
    }
  };
}
