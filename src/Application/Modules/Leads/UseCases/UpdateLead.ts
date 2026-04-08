import { Lead } from "../../../../Domain/Leads/Models/Lead";
import { AppError } from "../../../Contracts/Errors/AppError";
import { ILeadRepository } from "../../../Contracts/Repositories/ILeadRepository";

interface UpdateLeadInput {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  tags?: string[];
  notes?: string;
  value?: string;
}

export class UpdateLead {
  constructor(private readonly leadRepository: ILeadRepository) {}

  async execute(input: UpdateLeadInput) {
    const existing = await this.leadRepository.findById(input.id);
    if (!existing) {
      throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
    }

    const updated = new Lead({
      ...existing.props,
      name: input.name ?? existing.name,
      phone: input.phone ?? existing.phone,
      email: input.email !== undefined ? input.email : existing.email,
      company: input.company !== undefined ? input.company : existing.company,
      tags: input.tags !== undefined ? input.tags : existing.tags,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      value: input.value ?? existing.value,
      updatedAt: new Date(),
    });

    await this.leadRepository.save(updated);

    return updated.toJSON();
  }
}
