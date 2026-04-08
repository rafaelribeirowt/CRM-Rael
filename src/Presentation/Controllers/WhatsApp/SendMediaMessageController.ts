import { Response, NextFunction } from "express";
import { SendMediaMessage } from "../../../Application/Modules/WhatsApp/UseCases/SendMediaMessage";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";
import { AppError } from "../../../Application/Contracts/Errors/AppError";

export class SendMediaMessageController {
  constructor(private readonly sendMediaMessage: SendMediaMessage) {}

  handle = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const file = (req as any).file;
      if (!file) {
        throw new AppError("File is required", 400, "FILE_REQUIRED");
      }

      const result = await this.sendMediaMessage.execute({
        userId: req.userId!,
        contactId: req.body.contactId,
        caption: req.body.caption || undefined,
        file: {
          buffer: file.buffer,
          mimetype: file.mimetype,
          originalname: file.originalname,
        },
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
