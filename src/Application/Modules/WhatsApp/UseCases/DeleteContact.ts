import { AppError } from "../../../Contracts/Errors/AppError";
import { IContactRepository } from "../../../Contracts/Repositories/IContactRepository";

export class DeleteContact {
  constructor(private readonly contactRepository: IContactRepository) {}

  async execute(contactId: string) {
    const contact = await this.contactRepository.findById(contactId);
    if (!contact) {
      throw new AppError("Contact not found", 404, "CONTACT_NOT_FOUND");
    }

    // Messages are deleted via CASCADE on contact_id FK
    await this.contactRepository.delete(contactId);

    return { success: true };
  }
}
