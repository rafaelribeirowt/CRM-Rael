import { Response, NextFunction } from "express";
import { InitializeSession } from "../../../Application/Modules/WhatsApp/UseCases/InitializeSession";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class InitializeSessionController {
  constructor(private readonly initializeSession: InitializeSession) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.initializeSession.execute(req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
