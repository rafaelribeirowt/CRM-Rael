import { Response, NextFunction } from "express";
import { GetSessionStatus } from "../../../Application/Modules/WhatsApp/UseCases/GetSessionStatus";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class GetSessionStatusController {
  constructor(private readonly getSessionStatus: GetSessionStatus) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.getSessionStatus.execute(req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
