import { NextFunction, Response } from "express";
import { AppError } from "../../Application/Contracts/Errors/AppError";
import { ApiKey } from "../../Domain/ApiKey/Models/ApiKey";
import { DrizzleApiKeyRepository } from "../../Infrastructure/Database/Repositories/DrizzleApiKeyRepository";
import { AuthenticatedRequest } from "../Contracts/HttpRequest";

const apiKeyRepository = new DrizzleApiKeyRepository();

export async function apiKeyAuthMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Accept X-API-Key header or Bearer token
    let rawKey = req.headers["x-api-key"] as string | undefined;

    if (!rawKey) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        if (token.startsWith("crm_")) {
          rawKey = token;
        }
      }
    }

    if (!rawKey) {
      throw new AppError("API key not provided", 401, "API_KEY_REQUIRED");
    }

    const keyHash = ApiKey.hashKey(rawKey);
    const apiKey = await apiKeyRepository.findByKeyHash(keyHash);

    if (!apiKey) {
      throw new AppError("Invalid API key", 401, "INVALID_API_KEY");
    }

    if (!apiKey.isActive) {
      throw new AppError("API key has been revoked", 401, "API_KEY_REVOKED");
    }

    req.tenantId = apiKey.tenantId;
    req.apiKeyId = apiKey.id;

    // Update last used (fire and forget)
    apiKeyRepository.updateLastUsedAt(apiKey.id).catch(() => {});

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("Invalid API key", 401, "INVALID_API_KEY"));
    }
  }
}
