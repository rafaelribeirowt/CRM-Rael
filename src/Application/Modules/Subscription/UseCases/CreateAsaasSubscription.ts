import { AppError } from "../../../Contracts/Errors/AppError";
import { IPaymentGateway } from "../../../Contracts/Payment/IPaymentGateway";
import { IPlanRepository } from "../../../Contracts/Repositories/IPlanRepository";
import { ISubscriptionRepository } from "../../../Contracts/Repositories/ISubscriptionRepository";
import { ITenantRepository } from "../../../Contracts/Repositories/ITenantRepository";
import { Subscription } from "../../../../Domain/Subscription/Models/Subscription";

interface Input {
  tenantId: string;
  planSlug: string;
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX";
  email: string;
  name: string;
  cpfCnpj?: string;
}

export class CreateAsaasSubscription {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly planRepo: IPlanRepository,
    private readonly tenantRepo: ITenantRepository,
    private readonly paymentGateway: IPaymentGateway
  ) {}

  async execute(input: Input) {
    const plan = await this.planRepo.findBySlug(input.planSlug);
    if (!plan) throw new AppError("Plan not found", 404, "PLAN_NOT_FOUND");

    const tenant = await this.tenantRepo.findById(input.tenantId);
    if (!tenant) throw new AppError("Tenant not found", 404, "TENANT_NOT_FOUND");

    // Create customer in Asaas
    const customer = await this.paymentGateway.createCustomer({
      name: input.name,
      email: input.email,
      cpfCnpj: input.cpfCnpj,
    });

    // Create subscription in Asaas
    const asaasSub = await this.paymentGateway.createSubscription({
      customerId: customer.id,
      billingType: input.billingType,
      value: Number(plan.price),
      cycle: "MONTHLY",
      description: `Plano ${plan.name} - ${tenant.name}`,
    });

    // Save to DB
    const subscription = Subscription.create({
      tenantId: input.tenantId,
      planId: plan.id,
    });
    subscription.props.asaasSubscriptionId = asaasSub.id;
    subscription.props.asaasCustomerId = customer.id;
    await this.subscriptionRepo.save(subscription);

    return subscription.toJSON();
  }
}
