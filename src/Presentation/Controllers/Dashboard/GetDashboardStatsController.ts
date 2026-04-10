import { Response, NextFunction } from "express";
import { GetDashboardStats } from "../../../Application/Modules/Dashboard/UseCases/GetDashboardStats";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class GetDashboardStatsController {
  constructor(private readonly getDashboardStats: GetDashboardStats) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await this.getDashboardStats.execute(req.tenantId!);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };
}
