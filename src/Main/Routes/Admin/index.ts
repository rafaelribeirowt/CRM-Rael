import { Router } from "express";
import { authMiddleware } from "../../../Presentation/Middlewares/auth";
import { superadminMiddleware } from "../../../Presentation/Middlewares/superadmin";
import {
  listTenantsController,
  getTenantDetailsController,
  toggleTenantController,
  getPlatformStatsController,
} from "../../Dependencies/Admin/composition";

export const adminRouter = Router();

adminRouter.use(authMiddleware);
adminRouter.use(superadminMiddleware);

adminRouter.get("/tenants", listTenantsController.handle);
adminRouter.get("/tenants/:id", getTenantDetailsController.handle);
adminRouter.patch("/tenants/:id", toggleTenantController.handle);
adminRouter.get("/stats", getPlatformStatsController.handle);
