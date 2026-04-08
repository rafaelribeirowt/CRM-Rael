import { v4 as uuid } from "uuid";

export interface PipelineStageProps {
  id: string;
  pipelineId: string;
  name: string;
  color: string;
  position: number;
  isWon: boolean;
  isLost: boolean;
  createdAt: Date;
}

export class PipelineStage {
  constructor(public readonly props: PipelineStageProps) {}

  get id() { return this.props.id; }
  get pipelineId() { return this.props.pipelineId; }
  get name() { return this.props.name; }
  get color() { return this.props.color; }
  get position() { return this.props.position; }
  get isWon() { return this.props.isWon; }
  get isLost() { return this.props.isLost; }
  get createdAt() { return this.props.createdAt; }

  static create(input: {
    pipelineId: string;
    name: string;
    color?: string;
    position: number;
    isWon?: boolean;
    isLost?: boolean;
  }): PipelineStage {
    return new PipelineStage({
      id: uuid(),
      pipelineId: input.pipelineId,
      name: input.name,
      color: input.color ?? "#6366f1",
      position: input.position,
      isWon: input.isWon ?? false,
      isLost: input.isLost ?? false,
      createdAt: new Date(),
    });
  }

  toJSON() {
    return { ...this.props };
  }
}
