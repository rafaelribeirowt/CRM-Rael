import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { UpdateContactName } from "../../../Application/Modules/WhatsApp/UseCases/UpdateContactName";

const schema = z.object({
  name: z.string().min(1),
});

export class UpdateContactNameController {
  constructor(private readonly updateContactName: UpdateContactName) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.updateContactName.execute({
        contactId: req.params.contactId,
        name: data.name,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
