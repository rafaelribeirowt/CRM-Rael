import { Pipeline } from "../../../Domain/Pipelines/Models/Pipeline";
import { IRepository } from "./IRepository";

export interface IPipelineRepository extends IRepository<Pipeline> {
  save(entity: Pipeline, tenantId: string): Promise<void>;
  findById(id: string, tenantId: string): Promise<Pipeline | null>;
  delete(id: string, tenantId: string): Promise<void>;
  findAll(tenantId: string): Promise<Pipeline[]>;
  findDefault(tenantId: string): Promise<Pipeline | null>;
}
