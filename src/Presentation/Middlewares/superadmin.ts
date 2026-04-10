import { NextFunction, Response } from "express";
import { AppError } from "../../Application/Contracts/Errors/AppError";
import { JwtEncrypter } from "../../Infrastructure/Cryptography/JwtEncrypter";
import { AuthenticatedRequest } from "../Contracts/HttpRequest";

const encrypter = new JwtEncrypter();

export async function superadminMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Token not provided", 401, "UNAUTHORIZED");
    }

    const token = authHeader.split(" ")[1];
    const payload = await encrypter.decrypt(token);

    if (payload.role !== "superadmin") {
      throw new AppError("Access denied", 403, "FORBIDDEN");
    }

    req.userId = payload.sub as string;
    req.tenantId = payload.tenantId as string;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("Access denied", 403, "FORBIDDEN"));
    }
  }
}
