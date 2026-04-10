import { DrizzleSubscriptionRepository } from "../../../Infrastructure/Database/Repositories/DrizzleSubscriptionRepository";
import { DrizzlePlanRepository } from "../../../Infrastructure/Database/Repositories/DrizzlePlanRepository";
import { DrizzleTenantRepository } from "../../../Infrastructure/Database/Repositories/DrizzleTenantRepository";
import { DrizzlePaymentHistoryRepository } from "../../../Infrastructure/Database/Repositories/DrizzlePaymentHistoryRepository";
import { AsaasGateway } from "../../../Infrastructure/Payment/AsaasGateway";
import { CreateAsaasSubscription } from "../../../Application/Modules/Subscription/UseCases/CreateAsaasSubscription";
import { CancelSubscription } from "../../../Application/Modules/Subscription/UseCases/CancelSubscription";
import { ChangePlan } from "../../../Application/Modules/Subscription/UseCases/ChangePlan";
import { GetSubscriptionStatus } from "../../../Application/Modules/Subscription/UseCases/GetSubscriptionStatus";
import { AsaasWebhookController } from "../../../Presentation/Controllers/Webhooks/AsaasWebhookController";

const subscriptionRepository = new DrizzleSubscriptionRepository();
const planRepository = new DrizzlePlanRepository();
const tenantRepository = new DrizzleTenantRepository();
const paymentHistoryRepository = new DrizzlePaymentHistoryRepository();
const asaasGateway = new AsaasGateway();

export const createAsaasSubscription = new CreateAsaasSubscription(
  subscriptionRepository,
  planRepository,
  tenantRepository,
  asaasGateway
);
export const cancelSubscription = new CancelSubscription(subscriptionRepository, asaasGateway);
export const changePlan = new ChangePlan(subscriptionRepository, planRepository, asaasGateway);
export const getSubscriptionStatus = new GetSubscriptionStatus(subscriptionRepository, planRepository);
export const asaasWebhookController = new AsaasWebhookController(subscriptionRepository, paymentHistoryRepository);
