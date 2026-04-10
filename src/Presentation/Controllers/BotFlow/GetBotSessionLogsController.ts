import { Response, NextFunction } from "express";
import { IBotLogRepository } from "../../../Application/Contracts/Repositories/IBotLogRepository";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class GetBotSessionLogsController {
  constructor(private readonly logRepository: IBotLogRepository) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const logs = await this.logRepository.findBySessionId(
        req.params.sessionId,
        req.tenantId!
      );
      res.json(logs.map((l) => l.toJSON()));
    } catch (error) {
      next(error);
    }
  };
}
