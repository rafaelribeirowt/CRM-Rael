import { v4 as uuid } from "uuid";

export interface PipelineProps {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdBy: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Pipeline {
  constructor(public readonly props: PipelineProps) {}

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get description() { return this.props.description; }
  get isDefault() { return this.props.isDefault; }
  get createdBy() { return this.props.createdBy; }
  get position() { return this.props.position; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  static create(input: {
    name: string;
    description?: string;
    createdBy?: string;
    isDefault?: boolean;
    position?: number;
  }): Pipeline {
    return new Pipeline({
      id: uuid(),
      name: input.name,
      description: input.description ?? null,
      isDefault: input.isDefault ?? false,
      createdBy: input.createdBy ?? null,
      position: input.position ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toJSON() {
    return { ...this.props };
  }
}
