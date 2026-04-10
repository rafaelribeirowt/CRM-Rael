import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { authMiddleware } from "../../../Presentation/Middlewares/auth";
import { AuthenticatedRequest } from "../../../Presentation/Contracts/HttpRequest";
import { createApiKey, listApiKeys, revokeApiKey } from "../../Dependencies/ApiKeys/composition";

export const apiKeysRouter = Router();
apiKeysRouter.use(authMiddleware);

const createSchema = z.object({
  name: z.string().min(1).max(100),
});

apiKeysRouter.post("/", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = createSchema.parse(req.body);
    const result = await createApiKey.execute({
      tenantId: req.tenantId!,
      name: data.name,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

apiKeysRouter.get("/", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await listApiKeys.execute(req.tenantId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

apiKeysRouter.delete("/:id", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await revokeApiKey.execute({
      id: req.params.id,
      tenantId: req.tenantId!,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});
