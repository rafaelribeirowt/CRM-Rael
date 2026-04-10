import { AppError } from "../../../Contracts/Errors/AppError";
import { ITenantRepository } from "../../../Contracts/Repositories/ITenantRepository";
import { Tenant } from "../../../../Domain/Subscription/Models/Tenant";

export class ToggleTenant {
  constructor(private readonly tenantRepo: ITenantRepository) {}

  async execute(tenantId: string) {
    const tenant = await this.tenantRepo.findById(tenantId);
    if (!tenant) throw new AppError("Tenant not found", 404, "TENANT_NOT_FOUND");

    const updated = new Tenant({
      ...tenant.props,
      isActive: !tenant.isActive,
      updatedAt: new Date(),
    });
    await this.tenantRepo.save(updated);

    return updated.toJSON();
  }
}
