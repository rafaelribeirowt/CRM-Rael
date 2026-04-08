import { Response, NextFunction } from "express";
import { z } from "zod";
import { CreateLead } from "../../../Application/Modules/Leads/UseCases/CreateLead";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  company: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  stageId: z.string().min(1),
  pipelineId: z.string().min(1),
  source: z.string().optional(),
  value: z.string().optional(),
});

export class CreateLeadController {
  constructor(private readonly createLead: CreateLead) {}

  handle = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.createLead.execute({
        ...data,
        userId: req.userId,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
