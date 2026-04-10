import { ApiKey } from "../../../../Domain/ApiKey/Models/ApiKey";
import { IApiKeyRepository } from "../../../Contracts/Repositories/IApiKeyRepository";

interface Input {
  tenantId: string;
  name: string;
}

export class CreateApiKey {
  constructor(private readonly apiKeyRepo: IApiKeyRepository) {}

  async execute(input: Input) {
    const { apiKey, rawKey } = ApiKey.create({
      tenantId: input.tenantId,
      name: input.name,
    });

    await this.apiKeyRepo.save(apiKey);

    return {
      ...apiKey.toJSON(),
      key: rawKey, // Only returned once
    };
  }
}
