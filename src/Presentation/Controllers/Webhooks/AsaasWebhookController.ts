import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { ISubscriptionRepository } from "../../../Application/Contracts/Repositories/ISubscriptionRepository";
import { IPaymentHistoryRepository } from "../../../Application/Contracts/Repositories/IPaymentHistoryRepository";
import { env } from "../../../Shared/Env";

export class AsaasWebhookController {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly paymentHistoryRepo: IPaymentHistoryRepository
  ) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.query.token || req.headers["asaas-webhook-token"];
      if (env.ASAAS_WEBHOOK_TOKEN && token !== env.ASAAS_WEBHOOK_TOKEN) {
        throw new AppError("Invalid webhook token", 401, "INVALID_TOKEN");
      }

      const { event, payment } = req.body;

      if (!payment?.subscription) {
        res.status(200).json({ received: true });
        return;
      }

      // Find subscription by Asaas ID
      const subs = await this.subscriptionRepo.findAll();
      const subscription = subs.find(
        (s) => s.asaasSubscriptionId === payment.subscription
      );

      if (!subscription) {
        res.status(200).json({ received: true, message: "subscription not found" });
        return;
      }

      switch (event) {
        case "PAYMENT_CONFIRMED":
        case "PAYMENT_RECEIVED":
          subscription.props.status = "active";
          subscription.props.updatedAt = new Date();
          await this.subscriptionRepo.save(subscription);
          await this.paymentHistoryRepo.save({
            id: uuid(),
            tenantId: subscription.tenantId,
            subscriptionId: subscription.id,
            asaasPaymentId: payment.id,
            amount: String(payment.value),
            status: "paid",
            paymentMethod: payment.billingType,
            paidAt: new Date(),
            createdAt: new Date(),
          });
          break;

        case "PAYMENT_OVERDUE":
          subscription.props.status = "past_due";
          subscription.props.updatedAt = new Date();
          await this.subscriptionRepo.save(subscription);
          break;

        case "PAYMENT_REFUNDED":
          await this.paymentHistoryRepo.save({
            id: uuid(),
            tenantId: subscription.tenantId,
            subscriptionId: subscription.id,
            asaasPaymentId: payment.id,
            amount: String(payment.value),
            status: "refunded",
            paymentMethod: payment.billingType,
            paidAt: null,
            createdAt: new Date(),
          });
          break;

        case "SUBSCRIPTION_DELETED":
          subscription.props.status = "cancelled";
          subscription.props.updatedAt = new Date();
          await this.subscriptionRepo.save(subscription);
          break;
      }

      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  };
}
