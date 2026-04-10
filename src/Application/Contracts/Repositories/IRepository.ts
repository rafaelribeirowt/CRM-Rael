export interface IRepository<T> {
  save(entity: T, tenantId?: string): Promise<void>;
  findById(id: string, tenantId?: string): Promise<T | null>;
  delete(id: string, tenantId?: string): Promise<void>;
}
