import { v4 as uuid } from "uuid";
import type { StepType } from "../Types/StepConfig";

export interface BotStepProps {
  id: string;
  flowId: string;
  type: string;
  position: number;
  config: string;
  nextStepId: string | null;
  positionX: number;
  positionY: number;
  createdAt: Date;
}

export class BotStep {
  constructor(public readonly props: BotStepProps) {}

  get id() { return this.props.id; }
  get flowId() { return this.props.flowId; }
  get type() { return this.props.type as StepType; }
  get position() { return this.props.position; }
  get config() { return this.props.config; }
  get nextStepId() { return this.props.nextStepId; }
  get positionX() { return this.props.positionX; }
  get positionY() { return this.props.positionY; }
  get createdAt() { return this.props.createdAt; }

  getParsedConfig<T>(): T {
    return JSON.parse(this.config) as T;
  }

  static create(input: {
    flowId: string;
    type: StepType;
    position: number;
    config: object;
    nextStepId?: string;
    positionX?: number;
    positionY?: number;
  }): BotStep {
    return new BotStep({
      id: uuid(),
      flowId: input.flowId,
      type: input.type,
      position: input.position,
      config: JSON.stringify(input.config),
      nextStepId: input.nextStepId ?? null,
      positionX: input.positionX ?? 0,
      positionY: input.positionY ?? 0,
      createdAt: new Date(),
    });
  }

  toJSON() { return { ...this.props, parsedConfig: this.getParsedConfig() }; }
}
