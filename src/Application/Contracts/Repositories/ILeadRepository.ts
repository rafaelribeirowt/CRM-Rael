import { Lead } from "../../../Domain/Leads/Models/Lead";
import { IRepository } from "./IRepository";
import {
  PaginationInput,
  PaginationResult,
} from "../../../Infrastructure/Database/Helpers/pagination";

export interface LeadFilters {
  pipelineId?: string;
  stageId?: string;
  assignedTo?: string;
  source?: string;
  search?: string;
}

export interface ILeadRepository extends IRepository<Lead> {
  findByPhone(phone: string): Promise<Lead | null>;
  findByStageId(stageId: string): Promise<Lead[]>;
  findByPipelineId(pipelineId: string): Promise<Lead[]>;
  search(
    filters: LeadFilters,
    pagination: PaginationInput
  ): Promise<PaginationResult<Lead>>;
  updatePosition(id: string, stageId: string, position: number, pipelineId?: string): Promise<void>;
}
