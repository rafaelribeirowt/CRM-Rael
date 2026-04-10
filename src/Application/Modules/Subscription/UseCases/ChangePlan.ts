import { AppError } from "../../../Contracts/Errors/AppError";
import { IPaymentGateway } from "../../../Contracts/Payment/IPaymentGateway";
import { IPlanRepository } from "../../../Contracts/Repositories/IPlanRepository";
import { ISubscriptionRepository } from "../../../Contracts/Repositories/ISubscriptionRepository";

interface Input {
  tenantId: string;
  newPlanSlug: string;
  billingType?: "BOLETO" | "CREDIT_CARD" | "PIX";
}

export class ChangePlan {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly planRepo: IPlanRepository,
    private readonly paymentGateway: IPaymentGateway
  ) {}

  async execute(input: Input) {
    const subscription = await this.subscriptionRepo.findByTenantId(input.tenantId);
    if (!subscription) throw new AppError("No subscription found", 404, "NO_SUBSCRIPTION");

    const newPlan = await this.planRepo.findBySlug(input.newPlanSlug);
    if (!newPlan) throw new AppError("Plan not found", 404, "PLAN_NOT_FOUND");

    // Cancel old Asaas subscription if exists
    if (subscription.asaasSubscriptionId) {
      await this.paymentGateway.cancelSubscription(subscription.asaasSubscriptionId);
    }

    // Create new Asaas subscription if paid plan
    if (Number(newPlan.price) > 0 && subscription.asaasCustomerId) {
      const asaasSub = await this.paymentGateway.createSubscription({
        customerId: subscription.asaasCustomerId,
        billingType: input.billingType || "PIX",
        value: Number(newPlan.price),
        cycle: "MONTHLY",
        description: `Plano ${newPlan.name}`,
      });
      subscription.props.asaasSubscriptionId = asaasSub.id;
    } else {
      subscription.props.asaasSubscriptionId = null;
    }

    subscription.props.planId = newPlan.id;
    subscription.props.status = "active";
    subscription.props.updatedAt = new Date();
    await this.subscriptionRepo.save(subscription);

    return { subscription: subscription.toJSON(), plan: newPlan.toJSON() };
  }
}
