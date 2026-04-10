import { Response, NextFunction } from "express";
import { ToggleTenant } from "../../../Application/Modules/Admin/UseCases/ToggleTenant";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class ToggleTenantController {
  constructor(private readonly toggleTenant: ToggleTenant) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.toggleTenant.execute(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
