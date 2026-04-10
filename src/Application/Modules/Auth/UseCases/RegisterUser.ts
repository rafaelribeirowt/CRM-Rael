import { User } from "../../../../Domain/Auth/Models/User";
import { Tenant } from "../../../../Domain/Subscription/Models/Tenant";
import { Subscription } from "../../../../Domain/Subscription/Models/Subscription";
import { IHasher } from "../../../Contracts/Criptography/IHasher";
import { IEncrypter } from "../../../Contracts/Criptography/IEncrypter";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IUserRepository } from "../../../Contracts/Repositories/IUserRepository";
import { ITenantRepository } from "../../../Contracts/Repositories/ITenantRepository";
import { IPlanRepository } from "../../../Contracts/Repositories/IPlanRepository";
import { ISubscriptionRepository } from "../../../Contracts/Repositories/ISubscriptionRepository";

interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

export class RegisterUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hasher: IHasher,
    private readonly encrypter: IEncrypter,
    private readonly tenantRepository: ITenantRepository,
    private readonly planRepository: IPlanRepository,
    private readonly subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(input: RegisterUserInput) {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError("Email already in use", 409, "EMAIL_IN_USE");
    }

    // Create tenant
    const slug = input.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existingTenant = await this.tenantRepository.findBySlug(slug);
    if (existingTenant) {
      throw new AppError("Company name already taken", 409, "SLUG_IN_USE");
    }

    const tenant = Tenant.create({ name: input.companyName, slug });
    await this.tenantRepository.save(tenant);

    // Create subscription with Free plan
    const freePlan = await this.planRepository.findBySlug("free");
    if (!freePlan) {
      throw new AppError("Free plan not found", 500, "PLAN_NOT_FOUND");
    }

    const subscription = Subscription.create({
      tenantId: tenant.id,
      planId: freePlan.id,
    });
    await this.subscriptionRepository.save(subscription);

    // Create admin user for this tenant
    const passwordHash = await this.hasher.hash(input.password);
    const user = User.create({
      tenantId: tenant.id,
      name: input.name,
      email: input.email,
      passwordHash,
      role: "admin",
    });
    await this.userRepository.save(user);

    // Generate token
    const token = await this.encrypter.encrypt({
      sub: user.id,
      role: user.role,
      tenantId: user.tenantId,
    });

    return {
      token,
      user: user.toJSON(),
      tenant: tenant.toJSON(),
    };
  }
}
