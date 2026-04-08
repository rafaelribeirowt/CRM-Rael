import { AppError } from "../../../Contracts/Errors/AppError";
import { ILeadRepository } from "../../../Contracts/Repositories/ILeadRepository";
import { IContactRepository } from "../../../Contracts/Repositories/IContactRepository";
import { Contact } from "../../../../Domain/WhatsApp/Models/Contact";

export class DeleteLead {
  constructor(
    private readonly leadRepository: ILeadRepository,
    private readonly contactRepository: IContactRepository
  ) {}

  async execute(id: string) {
    const lead = await this.leadRepository.findById(id);
    if (!lead) {
      throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
    }

    // Unlink any contacts referencing this lead
    const contact = await this.contactRepository.findByLeadId(id);
    if (contact) {
      const unlinked = new Contact({ ...contact.props, leadId: null });
      await this.contactRepository.save(unlinked);
    }

    await this.leadRepository.delete(id);
    return { success: true };
  }
}
