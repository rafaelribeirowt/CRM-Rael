import { Router } from "express";
import { authMiddleware } from "../../../Presentation/Middlewares/auth";
import {
  registerUserController,
  loginUserController,
  getCurrentUserController,
} from "../../Dependencies/Auth/composition";

export const authRouter = Router();

authRouter.post("/register", registerUserController.handle);
authRouter.post("/login", loginUserController.handle);
authRouter.get("/me", authMiddleware, getCurrentUserController.handle);
