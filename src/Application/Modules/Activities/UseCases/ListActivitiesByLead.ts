import { IActivityRepository } from "../../../Contracts/Repositories/IActivityRepository";
import { PaginationInput } from "../../../../Infrastructure/Database/Helpers/pagination";

export class ListActivitiesByLead {
  constructor(private readonly activityRepository: IActivityRepository) {}

  async execute(leadId: string, pagination: PaginationInput) {
    return this.activityRepository.findByLeadId(leadId, pagination);
  }
}
