import { v4 as uuid } from "uuid";

export interface LeadProps {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
  tags: string[] | null;
  notes: string | null;
  assignedTo: string | null;
  stageId: string;
  pipelineId: string;
  source: string;
  position: number;
  value: string;
  lostReason: string | null;
  wonAt: Date | null;
  lostAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Lead {
  constructor(public readonly props: LeadProps) {}

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get phone() { return this.props.phone; }
  get email() { return this.props.email; }
  get company() { return this.props.company; }
  get tags() { return this.props.tags; }
  get notes() { return this.props.notes; }
  get assignedTo() { return this.props.assignedTo; }
  get stageId() { return this.props.stageId; }
  get pipelineId() { return this.props.pipelineId; }
  get source() { return this.props.source; }
  get position() { return this.props.position; }
  get value() { return this.props.value; }
  get lostReason() { return this.props.lostReason; }
  get wonAt() { return this.props.wonAt; }
  get lostAt() { return this.props.lostAt; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  static create(input: {
    name: string;
    phone: string;
    email?: string;
    company?: string;
    tags?: string[];
    notes?: string;
    assignedTo?: string;
    stageId: string;
    pipelineId: string;
    source?: string;
    position?: number;
    value?: string;
  }): Lead {
    return new Lead({
      id: uuid(),
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      company: input.company ?? null,
      tags: input.tags ?? null,
      notes: input.notes ?? null,
      assignedTo: input.assignedTo ?? null,
      stageId: input.stageId,
      pipelineId: input.pipelineId,
      source: input.source ?? "manual",
      position: input.position ?? 0,
      value: input.value ?? "0",
      lostReason: null,
      wonAt: null,
      lostAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toJSON() {
    return { ...this.props };
  }
}
