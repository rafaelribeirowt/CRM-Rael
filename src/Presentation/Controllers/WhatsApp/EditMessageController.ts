import { Response, NextFunction } from "express";
import { z } from "zod";
import { EditMessage } from "../../../Application/Modules/WhatsApp/UseCases/EditMessage";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const schema = z.object({
  newContent: z.string().min(1),
});

export class EditMessageController {
  constructor(private readonly editMessage: EditMessage) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.editMessage.execute({
        userId: req.userId!,
        messageId: req.params.messageId,
        newContent: data.newContent,
        tenantId: req.tenantId!,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
