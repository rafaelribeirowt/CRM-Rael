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
  save(entity: Lead, tenantId: string): Promise<void>;
  findById(id: string, tenantId: string): Promise<Lead | null>;
  delete(id: string, tenantId: string): Promise<void>;
  findByPhone(phone: string, tenantId: string): Promise<Lead | null>;
  findByStageId(stageId: string, tenantId: string): Promise<Lead[]>;
  findByPipelineId(pipelineId: string, tenantId: string): Promise<Lead[]>;
  search(
    filters: LeadFilters,
    pagination: PaginationInput,
    tenantId: string
  ): Promise<PaginationResult<Lead>>;
  updatePosition(id: string, stageId: string, position: number, tenantId: string, pipelineId?: string): Promise<void>;
  countByTenantId(tenantId: string): Promise<number>;
}
