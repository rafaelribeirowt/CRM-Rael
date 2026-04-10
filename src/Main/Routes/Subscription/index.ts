import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { authMiddleware } from "../../../Presentation/Middlewares/auth";
import { AuthenticatedRequest } from "../../../Presentation/Contracts/HttpRequest";
import {
  createAsaasSubscription,
  cancelSubscription,
  changePlan,
  getSubscriptionStatus,
} from "../../Dependencies/Subscription/composition";

export const subscriptionRouter = Router();
subscriptionRouter.use(authMiddleware);

subscriptionRouter.get("/status", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await getSubscriptionStatus.execute({ tenantId: req.tenantId! });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

const subscribeSchema = z.object({
  planSlug: z.string(),
  billingType: z.enum(["BOLETO", "CREDIT_CARD", "PIX"]),
  email: z.string().email(),
  name: z.string(),
  cpfCnpj: z.string().optional(),
});

subscriptionRouter.post("/subscribe", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = subscribeSchema.parse(req.body);
    const result = await createAsaasSubscription.execute({
      tenantId: req.tenantId!,
      ...data,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

const changePlanSchema = z.object({
  newPlanSlug: z.string(),
  billingType: z.enum(["BOLETO", "CREDIT_CARD", "PIX"]).optional(),
});

subscriptionRouter.post("/change-plan", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = changePlanSchema.parse(req.body);
    const result = await changePlan.execute({ tenantId: req.tenantId!, ...data });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

subscriptionRouter.post("/cancel", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await cancelSubscription.execute({ tenantId: req.tenantId! });
    res.json(result);
  } catch (error) {
    next(error);
  }
});
