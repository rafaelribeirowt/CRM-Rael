import { AppError } from "../Contracts/Errors/AppError";
import { ISubscriptionRepository } from "../Contracts/Repositories/ISubscriptionRepository";
import { IPlanRepository } from "../Contracts/Repositories/IPlanRepository";
import { ILeadRepository } from "../Contracts/Repositories/ILeadRepository";
import { IUserRepository } from "../Contracts/Repositories/IUserRepository";
import { IWhatsAppSessionRepository } from "../Contracts/Repositories/IWhatsAppSessionRepository";

export class LimitEnforcer {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly planRepository: IPlanRepository,
    private readonly leadRepository: ILeadRepository,
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: IWhatsAppSessionRepository
  ) {}

  private async getPlan(tenantId: string) {
    const subscription = await this.subscriptionRepository.findByTenantId(tenantId);
    if (!subscription || !subscription.isActive) {
      throw new AppError("No active subscription found", 403, "NO_ACTIVE_SUBSCRIPTION");
    }

    const plan = await this.planRepository.findById(subscription.planId);
    if (!plan) {
      throw new AppError("Plan not found", 500, "PLAN_NOT_FOUND");
    }

    return plan;
  }

  async canCreateLead(tenantId: string): Promise<void> {
    const plan = await this.getPlan(tenantId);

    if (plan.isUnlimited("maxLeads")) return;

    const currentCount = await this.leadRepository.countByTenantId(tenantId);
    if (currentCount >= plan.maxLeads) {
      throw new AppError(
        `Lead limit reached. Your plan allows up to ${plan.maxLeads} leads.`,
        403,
        "PLAN_LIMIT"
      );
    }
  }

  async canCreateUser(tenantId: string): Promise<void> {
    const plan = await this.getPlan(tenantId);

    if (plan.isUnlimited("maxUsers")) return;

    const currentCount = await this.userRepository.countByTenantId(tenantId);
    if (currentCount >= plan.maxUsers) {
      throw new AppError(
        `User limit reached. Your plan allows up to ${plan.maxUsers} users.`,
        403,
        "PLAN_LIMIT"
      );
    }
  }

  async canCreateWhatsAppSession(tenantId: string): Promise<void> {
    const plan = await this.getPlan(tenantId);

    if (plan.isUnlimited("maxWhatsappSessions")) return;

    const currentCount = await this.sessionRepository.countByTenantId(tenantId);
    if (currentCount >= plan.maxWhatsappSessions) {
      throw new AppError(
        `WhatsApp session limit reached. Your plan allows up to ${plan.maxWhatsappSessions} sessions.`,
        403,
        "PLAN_LIMIT"
      );
    }
  }
}
