import { GetDashboardStats } from "../../../Application/Modules/Dashboard/UseCases/GetDashboardStats";
import { GetDashboardStatsController } from "../../../Presentation/Controllers/Dashboard/GetDashboardStatsController";

const getDashboardStats = new GetDashboardStats();

export const getDashboardStatsController = new GetDashboardStatsController(
  getDashboardStats
);
