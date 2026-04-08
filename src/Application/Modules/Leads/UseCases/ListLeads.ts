import {
  ILeadRepository,
  LeadFilters,
} from "../../../Contracts/Repositories/ILeadRepository";
import { PaginationInput } from "../../../../Infrastructure/Database/Helpers/pagination";

interface ListLeadsInput {
  filters: LeadFilters;
  pagination: PaginationInput;
}

export class ListLeads {
  constructor(private readonly leadRepository: ILeadRepository) {}

  async execute(input: ListLeadsInput) {
    return this.leadRepository.search(input.filters, input.pagination);
  }
}
