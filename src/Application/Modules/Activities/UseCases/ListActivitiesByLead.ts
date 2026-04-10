import { IActivityRepository } from "../../../Contracts/Repositories/IActivityRepository";
import { PaginationInput } from "../../../../Infrastructure/Database/Helpers/pagination";

interface ListActivitiesByLeadInput {
  leadId: string;
  pagination: PaginationInput;
  tenantId: string;
}

export class ListActivitiesByLead {
  constructor(private readonly activityRepository: IActivityRepository) {}

  async execute(input: ListActivitiesByLeadInput) {
    return this.activityRepository.findByLeadId(input.leadId, input.pagination, input.tenantId);
  }
}
