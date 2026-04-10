import { AppError } from "../../../Contracts/Errors/AppError";
import { IContactRepository } from "../../../Contracts/Repositories/IContactRepository";

interface Input {
  contactId: string;
  tenantId: string;
  flag: "isHidden" | "isIgnored";
  value: boolean;
}

export class ToggleContactFlag {
  constructor(private readonly contactRepository: IContactRepository) {}

  async execute(input: Input) {
    const contact = await this.contactRepository.findById(input.contactId, input.tenantId);
    if (!contact) {
      throw new AppError("Contact not found", 404, "CONTACT_NOT_FOUND");
    }

    await this.contactRepository.updateFlags(input.contactId, input.tenantId, {
      [input.flag]: input.value,
    });

    return { success: true, [input.flag]: input.value };
  }
}
