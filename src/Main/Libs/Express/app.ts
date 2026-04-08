import express from "express";
import cors from "cors";
import path from "path";
import { env } from "../../../Shared/Env";
import { errorHandler } from "../../../Presentation/Middlewares/errorHandler";
import { requestIdMiddleware } from "../../../Presentation/Middlewares/requestId";
import { router } from "../../Routes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestIdMiddleware);

  app.use("/uploads", express.static(path.resolve(env.MEDIA_UPLOAD_DIR)));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api", router);

  app.use(errorHandler);

  return app;
}
