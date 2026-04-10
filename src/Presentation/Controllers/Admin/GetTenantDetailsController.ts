import { Response, NextFunction } from "express";
import { GetTenantDetails } from "../../../Application/Modules/Admin/UseCases/GetTenantDetails";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class GetTenantDetailsController {
  constructor(private readonly getTenantDetails: GetTenantDetails) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.getTenantDetails.execute(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
