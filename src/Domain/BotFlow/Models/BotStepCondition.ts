import { v4 as uuid } from "uuid";
import type { ActionConfig } from "../Types/StepConfig";

export interface BotStepConditionProps {
  id: string;
  stepId: string;
  label: string;
  operator: string;
  value: string | null;
  nextStepId: string | null;
  action: ActionConfig | null;
  position: number;
  createdAt: Date;
}

export class BotStepCondition {
  constructor(public readonly props: BotStepConditionProps) {}

  get id() { return this.props.id; }
  get stepId() { return this.props.stepId; }
  get label() { return this.props.label; }
  get operator() { return this.props.operator; }
  get value() { return this.props.value; }
  get nextStepId() { return this.props.nextStepId; }
  get action() { return this.props.action; }
  get position() { return this.props.position; }
  get createdAt() { return this.props.createdAt; }

  static create(input: {
    stepId: string;
    label: string;
    operator: string;
    value?: string;
    nextStepId?: string;
    action?: ActionConfig;
    position?: number;
  }): BotStepCondition {
    return new BotStepCondition({
      id: uuid(),
      stepId: input.stepId,
      label: input.label,
      operator: input.operator,
      value: input.value ?? null,
      nextStepId: input.nextStepId ?? null,
      action: input.action ?? null,
      position: input.position ?? 0,
      createdAt: new Date(),
    });
  }

  toJSON() { return { ...this.props }; }
}
