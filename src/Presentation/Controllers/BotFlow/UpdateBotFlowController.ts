import { Response, NextFunction } from "express";
import { z } from "zod";
import { UpdateBotFlow } from "../../../Application/Modules/BotFlow/UseCases/UpdateBotFlow";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const schema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  triggerType: z.string().optional(),
  triggerConfig: z.string().optional(),
  pipelineId: z.string().optional(),
  stageId: z.string().optional(),
});

export class UpdateBotFlowController {
  constructor(private readonly updateBotFlow: UpdateBotFlow) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.updateBotFlow.execute({
        flowId: req.params.flowId,
        ...data,
        tenantId: req.tenantId!,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
