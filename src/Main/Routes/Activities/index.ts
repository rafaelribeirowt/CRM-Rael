import { Router } from "express";
import { authMiddleware } from "../../../Presentation/Middlewares/auth";
import { listActivitiesByLeadController } from "../../Dependencies/Activities/composition";

export const activitiesRouter = Router();

activitiesRouter.use(authMiddleware);

activitiesRouter.get("/", listActivitiesByLeadController.handle);
