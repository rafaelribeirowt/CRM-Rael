import { AppError } from "../../../Contracts/Errors/AppError";
import { IPaymentGateway } from "../../../Contracts/Payment/IPaymentGateway";
import { ISubscriptionRepository } from "../../../Contracts/Repositories/ISubscriptionRepository";

export class CancelSubscription {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly paymentGateway: IPaymentGateway
  ) {}

  async execute(input: { tenantId: string }) {
    const subscription = await this.subscriptionRepo.findByTenantId(input.tenantId);
    if (!subscription) throw new AppError("No subscription found", 404, "NO_SUBSCRIPTION");

    if (subscription.asaasSubscriptionId) {
      await this.paymentGateway.cancelSubscription(subscription.asaasSubscriptionId);
    }

    subscription.props.status = "cancelled";
    subscription.props.updatedAt = new Date();
    await this.subscriptionRepo.save(subscription);

    return { success: true };
  }
}
