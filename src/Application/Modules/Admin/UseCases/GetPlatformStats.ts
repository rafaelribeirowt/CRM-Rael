import { ITenantRepository } from "../../../Contracts/Repositories/ITenantRepository";
import { ISubscriptionRepository } from "../../../Contracts/Repositories/ISubscriptionRepository";
import { IPaymentHistoryRepository } from "../../../Contracts/Repositories/IPaymentHistoryRepository";

export class GetPlatformStats {
  constructor(
    private readonly tenantRepo: ITenantRepository,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly paymentHistoryRepo: IPaymentHistoryRepository
  ) {}

  async execute() {
    const tenants = await this.tenantRepo.findAll();
    const subscriptions = await this.subscriptionRepo.findAll();
    const activeSubs = subscriptions.filter((s) => s.isActive);

    // Sum revenue from all tenants' payment history
    let totalRevenue = 0;
    for (const tenant of tenants) {
      const payments = await this.paymentHistoryRepo.findByTenantId(tenant.id);
      totalRevenue += payments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + Number(p.amount), 0);
    }

    return {
      totalTenants: tenants.length,
      activeTenants: tenants.filter((t) => t.isActive).length,
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubs.length,
      totalRevenue,
    };
  }
}
