import { v4 as uuid } from "uuid";

export interface BotFlowProps {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  triggerType: string;
  triggerConfig: string | null;
  pipelineId: string | null;
  stageId: string | null;
  firstStepId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class BotFlow {
  constructor(public readonly props: BotFlowProps) {}

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get description() { return this.props.description; }
  get isActive() { return this.props.isActive; }
  get triggerType() { return this.props.triggerType; }
  get triggerConfig() { return this.props.triggerConfig; }
  get pipelineId() { return this.props.pipelineId; }
  get stageId() { return this.props.stageId; }
  get firstStepId() { return this.props.firstStepId; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  getParsedTriggerConfig(): { keywords?: string[]; stageId?: string } {
    if (!this.triggerConfig) return {};
    try { return JSON.parse(this.triggerConfig); } catch { return {}; }
  }

  static create(input: {
    name: string;
    description?: string;
    triggerType: string;
    triggerConfig?: string;
    pipelineId?: string;
    stageId?: string;
  }): BotFlow {
    return new BotFlow({
      id: uuid(),
      name: input.name,
      description: input.description ?? null,
      isActive: false,
      triggerType: input.triggerType,
      triggerConfig: input.triggerConfig ?? null,
      pipelineId: input.pipelineId ?? null,
      stageId: input.stageId ?? null,
      firstStepId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toJSON() { return { ...this.props }; }
}
