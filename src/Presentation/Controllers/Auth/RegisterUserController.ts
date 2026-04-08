import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { RegisterUser } from "../../../Application/Modules/Auth/UseCases/RegisterUser";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export class RegisterUserController {
  constructor(private readonly registerUser: RegisterUser) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = registerSchema.parse(req.body);
      const user = await this.registerUser.execute(data);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };
}
