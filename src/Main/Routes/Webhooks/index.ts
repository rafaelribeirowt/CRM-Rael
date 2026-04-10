import { Router } from "express";
import { asaasWebhookController } from "../../Dependencies/Subscription/composition";

export const webhookRouter = Router();

// No auth middleware — validated by webhook token
webhookRouter.post("/asaas", asaasWebhookController.handle);
