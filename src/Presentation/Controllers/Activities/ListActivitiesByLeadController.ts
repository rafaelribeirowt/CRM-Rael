import { Request, Response, NextFunction } from "express";
import { ListActivitiesByLead } from "../../../Application/Modules/Activities/UseCases/ListActivitiesByLead";

export class ListActivitiesByLeadController {
  constructor(
    private readonly listActivitiesByLead: ListActivitiesByLead
  ) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.listActivitiesByLead.execute(
        req.query.leadId as string,
        {
          page: req.query.page ? Number(req.query.page) : undefined,
          limit: req.query.limit ? Number(req.query.limit) : undefined,
        }
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
