import { AppError } from "../../../Contracts/Errors/AppError";
import { IPlanRepository } from "../../../Contracts/Repositories/IPlanRepository";
import { ISubscriptionRepository } from "../../../Contracts/Repositories/ISubscriptionRepository";

export class GetSubscriptionStatus {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly planRepo: IPlanRepository
  ) {}

  async execute(input: { tenantId: string }) {
    const subscription = await this.subscriptionRepo.findByTenantId(input.tenantId);
    if (!subscription) throw new AppError("No subscription found", 404, "NO_SUBSCRIPTION");

    const plan = await this.planRepo.findById(subscription.planId);

    return {
      subscription: subscription.toJSON(),
      plan: plan?.toJSON() ?? null,
    };
  }
}
