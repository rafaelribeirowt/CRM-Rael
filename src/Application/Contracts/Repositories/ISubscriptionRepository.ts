import { Subscription } from "../../../Domain/Subscription/Models/Subscription";

export interface ISubscriptionRepository {
  save(subscription: Subscription): Promise<void>;
  findByTenantId(tenantId: string): Promise<Subscription | null>;
  findById(id: string): Promise<Subscription | null>;
  findAll(): Promise<Subscription[]>;
  delete(id: string): Promise<void>;
}
