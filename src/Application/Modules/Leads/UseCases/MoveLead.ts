import { Activity } from "../../../../Domain/Activities/Models/Activity";
import { AppError } from "../../../Contracts/Errors/AppError";
import { ILeadRepository } from "../../../Contracts/Repositories/ILeadRepository";
import { IPipelineStageRepository } from "../../../Contracts/Repositories/IPipelineStageRepository";
import { IActivityRepository } from "../../../Contracts/Repositories/IActivityRepository";

interface MoveLeadInput {
  leadId: string;
  stageId: string;
  position: number;
  userId?: string;
}

export class MoveLead {
  constructor(
    private readonly leadRepository: ILeadRepository,
    private readonly stageRepository: IPipelineStageRepository,
    private readonly activityRepository: IActivityRepository
  ) {}

  async execute(input: MoveLeadInput) {
    const lead = await this.leadRepository.findById(input.leadId);
    if (!lead) {
      throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
    }

    const newStage = await this.stageRepository.findById(input.stageId);
    if (!newStage) {
      throw new AppError("Stage not found", 404, "STAGE_NOT_FOUND");
    }

    const oldStageId = lead.stageId;
    const oldPipelineId = lead.pipelineId;
    const changingPipeline = newStage.pipelineId !== oldPipelineId;

    await this.leadRepository.updatePosition(
      input.leadId,
      input.stageId,
      input.position,
      changingPipeline ? newStage.pipelineId : undefined
    );

    if (oldStageId !== input.stageId) {
      const description = changingPipeline
        ? `Lead movido para pipeline "${newStage.pipelineId}" - etapa "${newStage.name}"`
        : `Lead movido para "${newStage.name}"`;

      const activity = Activity.create({
        leadId: input.leadId,
        userId: input.userId,
        type: "stage_change",
        description,
        metadata: {
          fromStageId: oldStageId,
          toStageId: input.stageId,
          fromPipelineId: oldPipelineId,
          toPipelineId: newStage.pipelineId,
        },
      });
      await this.activityRepository.save(activity);
    }

    return { success: true };
  }
}
