import { AppError } from "../../../Contracts/Errors/AppError";
import { ILeadRepository } from "../../../Contracts/Repositories/ILeadRepository";

export class GetLeadById {
  constructor(private readonly leadRepository: ILeadRepository) {}

  async execute(id: string) {
    const lead = await this.leadRepository.findById(id);
    if (!lead) {
      throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
    }
    return lead.toJSON();
  }
}
