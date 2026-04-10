import { Response, NextFunction } from "express";
import { ListActivitiesByLead } from "../../../Application/Modules/Activities/UseCases/ListActivitiesByLead";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class ListActivitiesByLeadController {
  constructor(
    private readonly listActivitiesByLead: ListActivitiesByLead
  ) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.listActivitiesByLead.execute({
        leadId: req.query.leadId as string,
        pagination: {
          page: req.query.page ? Number(req.query.page) : undefined,
          limit: req.query.limit ? Number(req.query.limit) : undefined,
        },
        tenantId: req.tenantId!,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
