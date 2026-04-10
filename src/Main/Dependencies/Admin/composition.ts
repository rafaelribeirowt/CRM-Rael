import { DrizzleTenantRepository } from "../../../Infrastructure/Database/Repositories/DrizzleTenantRepository";
import { DrizzleSubscriptionRepository } from "../../../Infrastructure/Database/Repositories/DrizzleSubscriptionRepository";
import { DrizzlePlanRepository } from "../../../Infrastructure/Database/Repositories/DrizzlePlanRepository";
import { DrizzleUserRepository } from "../../../Infrastructure/Database/Repositories/DrizzleUserRepository";
import { DrizzleLeadRepository } from "../../../Infrastructure/Database/Repositories/DrizzleLeadRepository";
import { DrizzleWhatsAppSessionRepository } from "../../../Infrastructure/Database/Repositories/DrizzleWhatsAppSessionRepository";
import { DrizzlePaymentHistoryRepository } from "../../../Infrastructure/Database/Repositories/DrizzlePaymentHistoryRepository";
import { ListTenants } from "../../../Application/Modules/Admin/UseCases/ListTenants";
import { GetTenantDetails } from "../../../Application/Modules/Admin/UseCases/GetTenantDetails";
import { ToggleTenant } from "../../../Application/Modules/Admin/UseCases/ToggleTenant";
import { GetPlatformStats } from "../../../Application/Modules/Admin/UseCases/GetPlatformStats";
import { ListTenantsController } from "../../../Presentation/Controllers/Admin/ListTenantsController";
import { GetTenantDetailsController } from "../../../Presentation/Controllers/Admin/GetTenantDetailsController";
import { ToggleTenantController } from "../../../Presentation/Controllers/Admin/ToggleTenantController";
import { GetPlatformStatsController } from "../../../Presentation/Controllers/Admin/GetPlatformStatsController";

const tenantRepository = new DrizzleTenantRepository();
const subscriptionRepository = new DrizzleSubscriptionRepository();
const planRepository = new DrizzlePlanRepository();
const userRepository = new DrizzleUserRepository();
const leadRepository = new DrizzleLeadRepository();
const sessionRepository = new DrizzleWhatsAppSessionRepository();
const paymentHistoryRepository = new DrizzlePaymentHistoryRepository();

const listTenants = new ListTenants(tenantRepository, subscriptionRepository, planRepository);
const getTenantDetails = new GetTenantDetails(tenantRepository, subscriptionRepository, planRepository, userRepository, leadRepository, sessionRepository);
const toggleTenant = new ToggleTenant(tenantRepository);
const getPlatformStats = new GetPlatformStats(tenantRepository, subscriptionRepository, paymentHistoryRepository);

export const listTenantsController = new ListTenantsController(listTenants);
export const getTenantDetailsController = new GetTenantDetailsController(getTenantDetails);
export const toggleTenantController = new ToggleTenantController(toggleTenant);
export const getPlatformStatsController = new GetPlatformStatsController(getPlatformStats);
