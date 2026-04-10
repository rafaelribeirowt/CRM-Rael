import { Activity } from "../../../Domain/Activities/Models/Activity";
import { IRepository } from "./IRepository";
import {
  PaginationInput,
  PaginationResult,
} from "../../../Infrastructure/Database/Helpers/pagination";

export interface IActivityRepository extends IRepository<Activity> {
  save(entity: Activity, tenantId: string): Promise<void>;
  findById(id: string, tenantId: string): Promise<Activity | null>;
  delete(id: string, tenantId: string): Promise<void>;
  findByLeadId(
    leadId: string,
    pagination: PaginationInput,
    tenantId: string
  ): Promise<PaginationResult<Activity>>;
}
