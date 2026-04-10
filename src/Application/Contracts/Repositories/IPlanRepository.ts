import { Plan } from "../../../Domain/Subscription/Models/Plan";

export interface IPlanRepository {
  findById(id: string): Promise<Plan | null>;
  findBySlug(slug: string): Promise<Plan | null>;
  findAllActive(): Promise<Plan[]>;
}
