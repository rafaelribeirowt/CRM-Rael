import { AppError } from "../../../Contracts/Errors/AppError";
import { ILeadRepository } from "../../../Contracts/Repositories/ILeadRepository";
import { IContactRepository } from "../../../Contracts/Repositories/IContactRepository";
import { Contact } from "../../../../Domain/WhatsApp/Models/Contact";

interface DeleteLeadInput {
  id: string;
  tenantId: string;
}

export class DeleteLead {
  constructor(
    private readonly leadRepository: ILeadRepository,
    private readonly contactRepository: IContactRepository
  ) {}

  async execute(input: DeleteLeadInput) {
    const lead = await this.leadRepository.findById(input.id, input.tenantId);
    if (!lead) {
      throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
    }

    // Unlink any contacts referencing this lead
    const contact = await this.contactRepository.findByLeadId(input.id, input.tenantId);
    if (contact) {
      const unlinked = new Contact({ ...contact.props, leadId: null });
      await this.contactRepository.save(unlinked, input.tenantId);
    }

    await this.leadRepository.delete(input.id, input.tenantId);
    return { success: true };
  }
}
