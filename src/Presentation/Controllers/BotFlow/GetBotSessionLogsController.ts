import { Request, Response, NextFunction } from "express";
import { IBotLogRepository } from "../../../Application/Contracts/Repositories/IBotLogRepository";

export class GetBotSessionLogsController {
  constructor(private readonly logRepository: IBotLogRepository) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logs = await this.logRepository.findBySessionId(
        req.params.sessionId
      );
      res.json(logs.map((l) => l.toJSON()));
    } catch (error) {
      next(error);
    }
  };
}
