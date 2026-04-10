import { Response, NextFunction } from "express";
import { z } from "zod";
import { SendMessage } from "../../../Application/Modules/WhatsApp/UseCases/SendMessage";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const schema = z.object({
  contactId: z.string().min(1),
  content: z.string().min(1),
});

export class SendMessageController {
  constructor(private readonly sendMessage: SendMessage) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.sendMessage.execute({
        userId: req.userId!,
        tenantId: req.tenantId!,
        ...data,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
