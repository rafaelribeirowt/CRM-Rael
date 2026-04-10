import { Response, NextFunction } from "express";
import { GetPlatformStats } from "../../../Application/Modules/Admin/UseCases/GetPlatformStats";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class GetPlatformStatsController {
  constructor(private readonly getPlatformStats: GetPlatformStats) {}

  handle = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.getPlatformStats.execute();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
