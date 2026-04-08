import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { CreateBotFlow } from "../../../Application/Modules/BotFlow/UseCases/CreateBotFlow";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  triggerType: z.string().min(1),
  triggerConfig: z.string().optional(),
  pipelineId: z.string().optional(),
  stageId: z.string().optional(),
});

export class CreateBotFlowController {
  constructor(private readonly createBotFlow: CreateBotFlow) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.createBotFlow.execute(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
