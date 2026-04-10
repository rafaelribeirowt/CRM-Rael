import { Response, NextFunction } from "express";
import { z } from "zod";
import { ConvertContactToLead } from "../../../Application/Modules/WhatsApp/UseCases/ConvertContactToLead";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const schema = z.object({
  contactId: z.string().min(1),
  pipelineId: z.string().min(1),
  stageId: z.string().min(1),
  name: z.string().optional(),
});

export class ConvertContactToLeadController {
  constructor(private readonly convertContactToLead: ConvertContactToLead) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.convertContactToLead.execute({
        ...data,
        userId: req.userId,
        tenantId: req.tenantId!,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
