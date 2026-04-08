import { Router } from "express";
import { authMiddleware } from "../../../Presentation/Middlewares/auth";
import { AISettingsController } from "../../../Presentation/Controllers/Settings/AISettingsController";

const aiSettingsController = new AISettingsController();

export const settingsRouter = Router();

settingsRouter.use(authMiddleware);

settingsRouter.get("/ai", aiSettingsController.getSettings);
settingsRouter.put("/ai", aiSettingsController.saveSettings);
