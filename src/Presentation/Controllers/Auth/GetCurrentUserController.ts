import { Response, NextFunction } from "express";
import { GetCurrentUser } from "../../../Application/Modules/Auth/UseCases/GetCurrentUser";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class GetCurrentUserController {
  constructor(private readonly getCurrentUser: GetCurrentUser) {}

  handle = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await this.getCurrentUser.execute(req.userId!);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };
}
