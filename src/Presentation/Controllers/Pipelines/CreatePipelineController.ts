import { Response, NextFunction } from "express";
import { z } from "zod";
import { CreatePipeline } from "../../../Application/Modules/Pipelines/UseCases/CreatePipeline";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  stages: z
    .array(
      z.object({
        name: z.string().min(1),
        color: z.string().optional(),
        isWon: z.boolean().optional(),
        isLost: z.boolean().optional(),
      })
    )
    .optional(),
});

export class CreatePipelineController {
  constructor(private readonly createPipeline: CreatePipeline) {}

  handle = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.createPipeline.execute({
        ...data,
        createdBy: req.userId!,
        tenantId: req.tenantId!,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
