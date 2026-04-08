import { Response, NextFunction } from "express";
import { DeleteMessage } from "../../../Application/Modules/WhatsApp/UseCases/DeleteMessage";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class DeleteMessageController {
  constructor(private readonly deleteMessage: DeleteMessage) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.deleteMessage.execute({
        userId: req.userId!,
        messageId: req.params.messageId,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
