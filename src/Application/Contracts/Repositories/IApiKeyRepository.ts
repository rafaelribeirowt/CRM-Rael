import { ApiKey } from "../../../Domain/ApiKey/Models/ApiKey";

export interface IApiKeyRepository {
  save(apiKey: ApiKey): Promise<void>;
  findByKeyHash(keyHash: string): Promise<ApiKey | null>;
  findAllByTenantId(tenantId: string): Promise<ApiKey[]>;
  delete(id: string, tenantId: string): Promise<void>;
  updateLastUsedAt(id: string): Promise<void>;
}
