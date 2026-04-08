import { Activity } from "../../../Domain/Activities/Models/Activity";
import { IRepository } from "./IRepository";
import {
  PaginationInput,
  PaginationResult,
} from "../../../Infrastructure/Database/Helpers/pagination";

export interface IActivityRepository extends IRepository<Activity> {
  findByLeadId(
    leadId: string,
    pagination: PaginationInput
  ): Promise<PaginationResult<Activity>>;
}
