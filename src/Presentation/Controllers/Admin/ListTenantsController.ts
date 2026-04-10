import { Response, NextFunction } from "express";
import { ListTenants } from "../../../Application/Modules/Admin/UseCases/ListTenants";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class ListTenantsController {
  constructor(private readonly listTenants: ListTenants) {}

  handle = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.listTenants.execute();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
