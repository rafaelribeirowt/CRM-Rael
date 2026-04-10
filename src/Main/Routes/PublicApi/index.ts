import { Router, Response, NextFunction } from "express";
import multer from "multer";
import { z } from "zod";
import { apiKeyAuthMiddleware } from "../../../Presentation/Middlewares/apiKeyAuth";
import { AuthenticatedRequest } from "../../../Presentation/Contracts/HttpRequest";
import {
  sendMessageByPhone,
  listContacts,
  listMessages,
  listSessions,
  getSessionStatus,
} from "../../Dependencies/PublicApi/composition";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 },
});

export const publicApiRouter = Router();
publicApiRouter.use(apiKeyAuthMiddleware);

// Send text message
const sendMessageSchema = z.object({
  phone: z.string().min(10),
  message: z.string().min(1),
  sessionId: z.string().uuid().optional(),
});

publicApiRouter.post("/messages/send", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = sendMessageSchema.parse(req.body);
    const result = await sendMessageByPhone.execute({
      tenantId: req.tenantId!,
      phone: data.phone,
      message: data.message,
      sessionId: data.sessionId,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// List messages for a contact
publicApiRouter.get("/messages/:contactId", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await listMessages.execute({
      contactId: req.params.contactId,
      pagination: { page: 1, limit: 50 },
      tenantId: req.tenantId!,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// List contacts
publicApiRouter.get("/contacts", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await listContacts.execute(req.tenantId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// List sessions
publicApiRouter.get("/sessions", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await listSessions.execute({ tenantId: req.tenantId! });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get session status
publicApiRouter.get("/sessions/:sessionId/status", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await getSessionStatus.execute({
      sessionId: req.params.sessionId,
      tenantId: req.tenantId!,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});
