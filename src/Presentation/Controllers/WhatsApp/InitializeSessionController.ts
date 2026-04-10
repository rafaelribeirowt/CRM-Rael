import { Response, NextFunction } from "express";
import { z } from "zod";
import { InitializeSession } from "../../../Application/Modules/WhatsApp/UseCases/InitializeSession";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const createSessionSchema = z.object({
  sessionName: z.string().min(1).optional(),
});

export class InitializeSessionController {
  constructor(private readonly initializeSession: InitializeSession) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = createSessionSchema.parse(req.body);
      const result = await this.initializeSession.execute({
        userId: req.userId!,
        tenantId: req.tenantId!,
        sessionName: data.sessionName,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
