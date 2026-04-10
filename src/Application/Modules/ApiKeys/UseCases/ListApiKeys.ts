import { IApiKeyRepository } from "../../../Contracts/Repositories/IApiKeyRepository";

export class ListApiKeys {
  constructor(private readonly apiKeyRepo: IApiKeyRepository) {}

  async execute(tenantId: string) {
    const keys = await this.apiKeyRepo.findAllByTenantId(tenantId);
    return keys.map((k) => k.toJSON());
  }
}
