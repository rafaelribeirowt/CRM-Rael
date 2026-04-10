import { Response, NextFunction } from "express";
import { z } from "zod";
import { SaveCanvas } from "../../../Application/Modules/BotFlow/UseCases/SaveCanvas";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const schema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      position: z.number(),
      config: z.record(z.unknown()),
      positionX: z.number(),
      positionY: z.number(),
    })
  ),
  edges: z.array(
    z.object({
      source: z.string(),
      target: z.string(),
      sourceHandle: z.string().optional(),
    })
  ),
  conditions: z
    .array(
      z.object({
        stepId: z.string(),
        label: z.string(),
        operator: z.string(),
        value: z.string().nullable().optional(),
        nextStepId: z.string().nullable().optional(),
        action: z.record(z.unknown()).nullable().optional(),
        position: z.number(),
      })
    )
    .optional()
    .default([]),
});

export class SaveCanvasController {
  constructor(private readonly saveCanvas: SaveCanvas) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.saveCanvas.execute({
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
