import { AppError } from "../../../Contracts/Errors/AppError";
import { ILeadRepository } from "../../../Contracts/Repositories/ILeadRepository";

interface GetLeadByIdInput {
  id: string;
  tenantId: string;
}

export class GetLeadById {
  constructor(private readonly leadRepository: ILeadRepository) {}

  async execute(input: GetLeadByIdInput) {
    const lead = await this.leadRepository.findById(input.id, input.tenantId);
    if (!lead) {
      throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
    }
    return lead.toJSON();
  }
}
