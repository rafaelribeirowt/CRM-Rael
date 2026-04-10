import { Response, NextFunction } from "express";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { ListIgnoredContacts } from "../../../Application/Modules/WhatsApp/UseCases/ListIgnoredContacts";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";
import { env } from "../../../Shared/Env";

export class ListIgnoredContactsController {
  constructor(private readonly listIgnoredContacts: ListIgnoredContacts) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const password = req.query.password as string;
      if (!password || password !== env.IGNORED_CONTACTS_PASSWORD) {
        throw new AppError("Access denied", 403, "FORBIDDEN");
      }

      const result = await this.listIgnoredContacts.execute(req.tenantId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
