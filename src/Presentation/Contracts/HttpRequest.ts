import { Request } from "express";

export type AuthenticatedRequest = Request & {
  userId?: string;
  tenantId?: string;
  apiKeyId?: string;
  requestId?: string;
};
