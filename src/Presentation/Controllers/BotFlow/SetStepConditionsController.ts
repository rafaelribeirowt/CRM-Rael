import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { SetStepConditions } from "../../../Application/Modules/BotFlow/UseCases/SetStepConditions";

const actionSchema = z.object({
  actionType: z.string(),
  stageId: z.string().optional(),
  userId: z.string().optional(),
  tag: z.string().optional(),
  fieldName: z.string().optional(),
  fieldValue: z.string().optional(),
}).optional().nullable();

const schema = z.object({
  conditions: z.array(
    z.object({
      label: z.string(),
      operator: z.string(),
      value: z.string().nullable().optional(),
      nextStepId: z.string().nullable().optional(),
      action: actionSchema,
    })
  ),
});

export class SetStepConditionsController {
  constructor(private readonly setStepConditions: SetStepConditions) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.setStepConditions.execute({
        flowId: req.params.flowId,
        stepId: req.params.stepId,
        conditions: data.conditions,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
