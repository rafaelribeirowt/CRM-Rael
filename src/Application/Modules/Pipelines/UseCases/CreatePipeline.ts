import { Pipeline } from "../../../../Domain/Pipelines/Models/Pipeline";
import { PipelineStage } from "../../../../Domain/Pipelines/Models/PipelineStage";
import { IPipelineRepository } from "../../../Contracts/Repositories/IPipelineRepository";
import { IPipelineStageRepository } from "../../../Contracts/Repositories/IPipelineStageRepository";

interface CreatePipelineInput {
  name: string;
  description?: string;
  createdBy: string;
  stages?: { name: string; color?: string; isWon?: boolean; isLost?: boolean }[];
}

const DEFAULT_STAGES = [
  { name: "Novo Lead", color: "#6366f1" },
  { name: "Contato Feito", color: "#3b82f6" },
  { name: "Proposta Enviada", color: "#f59e0b" },
  { name: "Negociacao", color: "#f97316" },
  { name: "Fechado Ganho", color: "#22c55e", isWon: true },
  { name: "Fechado Perdido", color: "#ef4444", isLost: true },
];

export class CreatePipeline {
  constructor(
    private readonly pipelineRepository: IPipelineRepository,
    private readonly stageRepository: IPipelineStageRepository
  ) {}

  async execute(input: CreatePipelineInput) {
    const existing = await this.pipelineRepository.findAll();
    const isDefault = existing.length === 0;

    const pipeline = Pipeline.create({
      name: input.name,
      description: input.description,
      createdBy: input.createdBy,
      isDefault,
      position: existing.length,
    });

    await this.pipelineRepository.save(pipeline);

    const stageDefs = input.stages?.length ? input.stages : DEFAULT_STAGES;
    const stages = stageDefs.map((s, i) =>
      PipelineStage.create({
        pipelineId: pipeline.id,
        name: s.name,
        color: s.color,
        position: i,
        isWon: s.isWon,
        isLost: s.isLost,
      })
    );

    for (const stage of stages) {
      await this.stageRepository.save(stage);
    }

    return {
      ...pipeline.toJSON(),
      stages: stages.map((s) => s.toJSON()),
    };
  }
}
