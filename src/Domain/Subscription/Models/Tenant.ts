import { v4 as uuid } from "uuid";

export interface TenantProps {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Tenant {
  constructor(public readonly props: TenantProps) {}

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get slug() { return this.props.slug; }
  get logoUrl() { return this.props.logoUrl; }
  get isActive() { return this.props.isActive; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  static create(input: { name: string; slug: string }): Tenant {
    return new Tenant({
      id: uuid(),
      name: input.name,
      slug: input.slug,
      logoUrl: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      logoUrl: this.logoUrl,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
