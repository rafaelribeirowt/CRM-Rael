import { AppError } from "../../../Contracts/Errors/AppError";
import { ITenantRepository } from "../../../Contracts/Repositories/ITenantRepository";
import { ISubscriptionRepository } from "../../../Contracts/Repositories/ISubscriptionRepository";
import { IPlanRepository } from "../../../Contracts/Repositories/IPlanRepository";
import { IUserRepository } from "../../../Contracts/Repositories/IUserRepository";
import { ILeadRepository } from "../../../Contracts/Repositories/ILeadRepository";
import { IWhatsAppSessionRepository } from "../../../Contracts/Repositories/IWhatsAppSessionRepository";

export class GetTenantDetails {
  constructor(
    private readonly tenantRepo: ITenantRepository,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly planRepo: IPlanRepository,
    private readonly userRepo: IUserRepository,
    private readonly leadRepo: ILeadRepository,
    private readonly sessionRepo: IWhatsAppSessionRepository
  ) {}

  async execute(tenantId: string) {
    const tenant = await this.tenantRepo.findById(tenantId);
    if (!tenant) throw new AppError("Tenant not found", 404, "TENANT_NOT_FOUND");

    const subscription = await this.subscriptionRepo.findByTenantId(tenantId);
    const plan = subscription ? await this.planRepo.findById(subscription.planId) : null;
    const userCount = await this.userRepo.countByTenantId(tenantId);
    const leadCount = await this.leadRepo.countByTenantId(tenantId);
    const sessionCount = await this.sessionRepo.countByTenantId(tenantId);

    return {
      ...tenant.toJSON(),
      subscription: subscription?.toJSON() ?? null,
      plan: plan?.toJSON() ?? null,
      usage: { users: userCount, leads: leadCount, whatsappSessions: sessionCount },
    };
  }
}
