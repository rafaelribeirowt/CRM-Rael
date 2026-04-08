import { Router } from "express";
import { authMiddleware } from "../../../Presentation/Middlewares/auth";
import {
  createLeadController,
  updateLeadController,
  getLeadByIdController,
  listLeadsController,
  moveLeadController,
  deleteLeadController,
} from "../../Dependencies/Leads/composition";

export const leadsRouter = Router();

leadsRouter.use(authMiddleware);

leadsRouter.get("/", listLeadsController.handle);
leadsRouter.post("/", createLeadController.handle);
leadsRouter.get("/:id", getLeadByIdController.handle);
leadsRouter.put("/:id", updateLeadController.handle);
leadsRouter.delete("/:id", deleteLeadController.handle);
leadsRouter.patch("/:id/move", moveLeadController.handle);
