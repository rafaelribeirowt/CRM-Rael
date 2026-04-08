import { Router } from "express";
import { authMiddleware } from "../../../Presentation/Middlewares/auth";
import { getDashboardStatsController } from "../../Dependencies/Dashboard/composition";

export const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);

dashboardRouter.get("/stats", getDashboardStatsController.handle);
