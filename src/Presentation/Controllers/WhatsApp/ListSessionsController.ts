import { Response, NextFunction } from "express";
import { ListSessions } from "../../../Application/Modules/WhatsApp/UseCases/ListSessions";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class ListSessionsController {
  constructor(private readonly listSessions: ListSessions) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.listSessions.execute({
        tenantId: req.tenantId!,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
