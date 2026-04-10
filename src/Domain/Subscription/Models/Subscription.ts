import { v4 as uuid } from "uuid";

export interface SubscriptionProps {
  id: string;
  tenantId: string;
  planId: string;
  status: string;
  asaasSubscriptionId: string | null;
  asaasCustomerId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Subscription {
  constructor(public readonly props: SubscriptionProps) {}

  get id() { return this.props.id; }
  get tenantId() { return this.props.tenantId; }
  get planId() { return this.props.planId; }
  get status() { return this.props.status; }
  get asaasSubscriptionId() { return this.props.asaasSubscriptionId; }
  get asaasCustomerId() { return this.props.asaasCustomerId; }
  get currentPeriodStart() { return this.props.currentPeriodStart; }
  get currentPeriodEnd() { return this.props.currentPeriodEnd; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  get isActive(): boolean {
    return this.props.status === "active" || this.props.status === "trialing";
  }

  static create(input: { tenantId: string; planId: string }): Subscription {
    return new Subscription({
      id: uuid(),
      tenantId: input.tenantId,
      planId: input.planId,
      status: "active",
      asaasSubscriptionId: null,
      asaasCustomerId: null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toJSON() {
    return { ...this.props };
  }
}
