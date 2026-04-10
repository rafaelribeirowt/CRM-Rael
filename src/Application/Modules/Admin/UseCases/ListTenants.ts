import { ITenantRepository } from "../../../Contracts/Repositories/ITenantRepository";
import { ISubscriptionRepository } from "../../../Contracts/Repositories/ISubscriptionRepository";
import { IPlanRepository } from "../../../Contracts/Repositories/IPlanRepository";

export class ListTenants {
  constructor(
    private readonly tenantRepo: ITenantRepository,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly planRepo: IPlanRepository
  ) {}

  async execute() {
    const tenants = await this.tenantRepo.findAll();
    const result = await Promise.all(
      tenants.map(async (tenant) => {
        const subscription = await this.subscriptionRepo.findByTenantId(tenant.id);
        const plan = subscription
          ? await this.planRepo.findById(subscription.planId)
          : null;
        return {
          ...tenant.toJSON(),
          subscription: subscription?.toJSON() ?? null,
          plan: plan?.toJSON() ?? null,
        };
      })
    );
    return result;
  }
}
