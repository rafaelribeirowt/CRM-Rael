import { Request, Response, NextFunction } from "express";
import { GetDashboardStats } from "../../../Application/Modules/Dashboard/UseCases/GetDashboardStats";

export class GetDashboardStatsController {
  constructor(private readonly getDashboardStats: GetDashboardStats) {}

  handle = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.getDashboardStats.execute();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };
}
