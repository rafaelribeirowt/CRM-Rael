import { Pipeline } from "../../../Domain/Pipelines/Models/Pipeline";
import { IRepository } from "./IRepository";

export interface IPipelineRepository extends IRepository<Pipeline> {
  findAll(): Promise<Pipeline[]>;
  findDefault(): Promise<Pipeline | null>;
}
