import { Router } from "express";
import { authMiddleware } from "../../../Presentation/Middlewares/auth";
import {
  createPipelineController,
  listPipelinesController,
  getPipelineWithStagesController,
  createStageController,
  updateStageController,
  deleteStageController,
  reorderStagesController,
} from "../../Dependencies/Pipelines/composition";

export const pipelinesRouter = Router();

pipelinesRouter.use(authMiddleware);

pipelinesRouter.get("/", listPipelinesController.handle);
pipelinesRouter.post("/", createPipelineController.handle);
pipelinesRouter.get("/:id", getPipelineWithStagesController.handle);
pipelinesRouter.post("/:id/stages", createStageController.handle);
pipelinesRouter.put("/:id/stages/:stageId", updateStageController.handle);
pipelinesRouter.delete("/:id/stages/:stageId", deleteStageController.handle);
pipelinesRouter.patch("/:id/stages/reorder", reorderStagesController.handle);
