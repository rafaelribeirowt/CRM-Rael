import { Tenant } from "../../../Domain/Subscription/Models/Tenant";

export interface ITenantRepository {
  save(tenant: Tenant): Promise<void>;
  findById(id: string): Promise<Tenant | null>;
  findBySlug(slug: string): Promise<Tenant | null>;
  findAll(): Promise<Tenant[]>;
  delete(id: string): Promise<void>;
}
