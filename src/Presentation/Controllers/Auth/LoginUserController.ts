import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { LoginUser } from "../../../Application/Modules/Auth/UseCases/LoginUser";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class LoginUserController {
  constructor(private readonly loginUser: LoginUser) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = loginSchema.parse(req.body);
      const result = await this.loginUser.execute(data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
