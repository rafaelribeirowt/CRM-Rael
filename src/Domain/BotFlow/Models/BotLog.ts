import { v4 as uuid } from "uuid";

export interface BotLogProps {
  id: string;
  sessionId: string;
  stepId: string | null;
  event: string;
  details: Record<string, unknown> | null;
  createdAt: Date;
}

export class BotLog {
  constructor(public readonly props: BotLogProps) {}

  get id() { return this.props.id; }
  get sessionId() { return this.props.sessionId; }
  get stepId() { return this.props.stepId; }
  get event() { return this.props.event; }
  get details() { return this.props.details; }
  get createdAt() { return this.props.createdAt; }

  static create(input: {
    sessionId: string;
    stepId?: string;
    event: string;
    details?: Record<string, unknown>;
  }): BotLog {
    return new BotLog({
      id: uuid(),
      sessionId: input.sessionId,
      stepId: input.stepId ?? null,
      event: input.event,
      details: input.details ?? null,
      createdAt: new Date(),
    });
  }

  toJSON() { return { ...this.props }; }
}
