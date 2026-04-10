export interface PlanProps {
  id: string;
  name: string;
  slug: string;
  price: string;
  maxWhatsappSessions: number;
  maxLeads: number;
  maxUsers: number;
  features: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Plan {
  constructor(public readonly props: PlanProps) {}

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get slug() { return this.props.slug; }
  get price() { return this.props.price; }
  get maxWhatsappSessions() { return this.props.maxWhatsappSessions; }
  get maxLeads() { return this.props.maxLeads; }
  get maxUsers() { return this.props.maxUsers; }
  get features() { return this.props.features; }
  get isActive() { return this.props.isActive; }

  isUnlimited(field: "maxLeads" | "maxUsers" | "maxWhatsappSessions"): boolean {
    return this.props[field] === -1;
  }

  toJSON() {
    return { ...this.props };
  }
}
