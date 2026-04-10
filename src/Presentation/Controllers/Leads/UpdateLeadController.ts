import { Response, NextFunction } from "express";
import { z } from "zod";
import { UpdateLead } from "../../../Application/Modules/Leads/UseCases/UpdateLead";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const schema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().nullable().optional(),
  company: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
  value: z.string().optional(),
});

export class UpdateLeadController {
  constructor(private readonly updateLead: UpdateLead) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.updateLead.execute({
        id: req.params.id,
        tenantId: req.tenantId!,
        ...data,
        email: data.email ?? undefined,
        company: data.company ?? undefined,
        notes: data.notes ?? undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
