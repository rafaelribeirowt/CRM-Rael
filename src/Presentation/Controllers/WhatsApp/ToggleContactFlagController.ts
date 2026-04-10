import { Response, NextFunction } from "express";
import { z } from "zod";
import { ToggleContactFlag } from "../../../Application/Modules/WhatsApp/UseCases/ToggleContactFlag";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const schema = z.object({
  flag: z.enum(["isHidden", "isIgnored"]),
  value: z.boolean(),
});

export class ToggleContactFlagController {
  constructor(private readonly toggleContactFlag: ToggleContactFlag) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.toggleContactFlag.execute({
        contactId: req.params.contactId,
        tenantId: req.tenantId!,
        flag: data.flag,
        value: data.value,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
