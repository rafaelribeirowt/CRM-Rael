import { IApiKeyRepository } from "../../../Contracts/Repositories/IApiKeyRepository";

export class RevokeApiKey {
  constructor(private readonly apiKeyRepo: IApiKeyRepository) {}

  async execute(input: { id: string; tenantId: string }) {
    await this.apiKeyRepo.delete(input.id, input.tenantId);
    return { success: true };
  }
}
