import { Contact } from "../../../../Domain/WhatsApp/Models/Contact";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IContactRepository } from "../../../Contracts/Repositories/IContactRepository";

interface UpdateContactNameInput {
  contactId: string;
  name: string;
}

export class UpdateContactName {
  constructor(private readonly contactRepository: IContactRepository) {}

  async execute(input: UpdateContactNameInput) {
    const existing = await this.contactRepository.findById(input.contactId);
    if (!existing) {
      throw new AppError("Contact not found", 404, "CONTACT_NOT_FOUND");
    }

    const updated = new Contact({
      ...existing.props,
      name: input.name,
      updatedAt: new Date(),
    });

    await this.contactRepository.save(updated);

    return updated.toJSON();
  }
}
