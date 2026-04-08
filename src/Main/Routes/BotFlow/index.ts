import { Router } from "express";
import { authMiddleware } from "../../../Presentation/Middlewares/auth";
import {
  createBotFlowController,
  updateBotFlowController,
  deleteBotFlowController,
  listBotFlowsController,
  getBotFlowByIdController,
  toggleBotFlowController,
  addBotStepController,
  updateBotStepController,
  deleteBotStepController,
  reorderBotStepsController,
  setStepConditionsController,
  cancelBotSessionController,
  listBotSessionsController,
  getBotSessionLogsController,
  saveCanvasController,
} from "../../Dependencies/BotFlow/composition";

export const botFlowRouter = Router();

botFlowRouter.use(authMiddleware);

// Flow CRUD
botFlowRouter.get("/", listBotFlowsController.handle);
botFlowRouter.post("/", createBotFlowController.handle);
botFlowRouter.get("/sessions", listBotSessionsController.handle);
botFlowRouter.get("/:flowId", getBotFlowByIdController.handle);
botFlowRouter.put("/:flowId", updateBotFlowController.handle);
botFlowRouter.delete("/:flowId", deleteBotFlowController.handle);
botFlowRouter.patch("/:flowId/toggle", toggleBotFlowController.handle);
botFlowRouter.put("/:flowId/canvas", saveCanvasController.handle);

// Steps
botFlowRouter.post("/:flowId/steps", addBotStepController.handle);
botFlowRouter.put("/:flowId/steps/:stepId", updateBotStepController.handle);
botFlowRouter.delete("/:flowId/steps/:stepId", deleteBotStepController.handle);
botFlowRouter.patch("/:flowId/steps/reorder", reorderBotStepsController.handle);
botFlowRouter.put("/:flowId/steps/:stepId/conditions", setStepConditionsController.handle);

// Sessions
botFlowRouter.delete("/sessions/:sessionId", cancelBotSessionController.handle);
botFlowRouter.get("/sessions/:sessionId/logs", getBotSessionLogsController.handle);
