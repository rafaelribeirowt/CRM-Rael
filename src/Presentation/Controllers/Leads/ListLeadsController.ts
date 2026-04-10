import { Response, NextFunction } from "express";
import { ListLeads } from "../../../Application/Modules/Leads/UseCases/ListLeads";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class ListLeadsController {
  constructor(private readonly listLeads: ListLeads) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.listLeads.execute({
        filters: {
          pipelineId: req.query.pipelineId as string | undefined,
          stageId: req.query.stageId as string | undefined,
          assignedTo: req.query.assignedTo as string | undefined,
          source: req.query.source as string | undefined,
          search: req.query.search as string | undefined,
        },
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
