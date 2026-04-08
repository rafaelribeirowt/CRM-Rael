import { DrizzlePipelineRepository } from "../../../Infrastructure/Database/Repositories/DrizzlePipelineRepository";
import { DrizzlePipelineStageRepository } from "../../../Infrastructure/Database/Repositories/DrizzlePipelineStageRepository";
import { DrizzleLeadRepository } from "../../../Infrastructure/Database/Repositories/DrizzleLeadRepository";
import { CreatePipeline } from "../../../Application/Modules/Pipelines/UseCases/CreatePipeline";
import { ListPipelines } from "../../../Application/Modules/Pipelines/UseCases/ListPipelines";
import { GetPipelineWithStages } from "../../../Application/Modules/Pipelines/UseCases/GetPipelineWithStages";
import { CreateStage } from "../../../Application/Modules/Pipelines/UseCases/CreateStage";
import { UpdateStage } from "../../../Application/Modules/Pipelines/UseCases/UpdateStage";
import { DeleteStage } from "../../../Application/Modules/Pipelines/UseCases/DeleteStage";
import { ReorderStages } from "../../../Application/Modules/Pipelines/UseCases/ReorderStages";
import { CreatePipelineController } from "../../../Presentation/Controllers/Pipelines/CreatePipelineController";
import { ListPipelinesController } from "../../../Presentation/Controllers/Pipelines/ListPipelinesController";
import { GetPipelineWithStagesController } from "../../../Presentation/Controllers/Pipelines/GetPipelineWithStagesController";
import { CreateStageController } from "../../../Presentation/Controllers/Pipelines/CreateStageController";
import { UpdateStageController } from "../../../Presentation/Controllers/Pipelines/UpdateStageController";
import { DeleteStageController } from "../../../Presentation/Controllers/Pipelines/DeleteStageController";
import { ReorderStagesController } from "../../../Presentation/Controllers/Pipelines/ReorderStagesController";

export const pipelineRepository = new DrizzlePipelineRepository();
export const pipelineStageRepository = new DrizzlePipelineStageRepository();
const leadRepository = new DrizzleLeadRepository();

const createPipeline = new CreatePipeline(pipelineRepository, pipelineStageRepository);
const listPipelines = new ListPipelines(pipelineRepository);
const getPipelineWithStages = new GetPipelineWithStages(pipelineRepository, pipelineStageRepository, leadRepository);
const createStage = new CreateStage(pipelineRepository, pipelineStageRepository);
const updateStage = new UpdateStage(pipelineStageRepository);
const deleteStage = new DeleteStage(pipelineStageRepository);
const reorderStages = new ReorderStages(pipelineRepository, pipelineStageRepository);

export const createPipelineController = new CreatePipelineController(createPipeline);
export const listPipelinesController = new ListPipelinesController(listPipelines);
export const getPipelineWithStagesController = new GetPipelineWithStagesController(getPipelineWithStages);
export const createStageController = new CreateStageController(createStage);
export const updateStageController = new UpdateStageController(updateStage);
export const deleteStageController = new DeleteStageController(deleteStage);
export const reorderStagesController = new ReorderStagesController(reorderStages);
