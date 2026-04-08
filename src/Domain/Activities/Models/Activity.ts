import { v4 as uuid } from "uuid";

export interface ActivityProps {
  id: string;
  leadId: string;
  userId: string | null;
  type: string;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export class Activity {
  constructor(public readonly props: ActivityProps) {}

  get id() { return this.props.id; }
  get leadId() { return this.props.leadId; }
  get userId() { return this.props.userId; }
  get type() { return this.props.type; }
  get description() { return this.props.description; }
  get metadata() { return this.props.metadata; }
  get createdAt() { return this.props.createdAt; }

  static create(input: {
    leadId: string;
    userId?: string;
    type: string;
    description: string;
    metadata?: Record<string, unknown>;
  }): Activity {
    return new Activity({
      id: uuid(),
      leadId: input.leadId,
      userId: input.userId ?? null,
      type: input.type,
      description: input.description,
      metadata: input.metadata ?? null,
      createdAt: new Date(),
    });
  }

  toJSON() {
    return { ...this.props };
  }
}
