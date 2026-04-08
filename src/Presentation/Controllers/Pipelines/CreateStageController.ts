import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { CreateStage } from "../../../Application/Modules/Pipelines/UseCases/CreateStage";

const schema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
  isWon: z.boolean().optional(),
  isLost: z.boolean().optional(),
});

export class CreateStageController {
  constructor(private readonly createStage: CreateStage) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.createStage.execute({
        ...data,
        pipelineId: req.params.id,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
