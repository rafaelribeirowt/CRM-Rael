import { DrizzleApiKeyRepository } from "../../../Infrastructure/Database/Repositories/DrizzleApiKeyRepository";
import { CreateApiKey } from "../../../Application/Modules/ApiKeys/UseCases/CreateApiKey";
import { ListApiKeys } from "../../../Application/Modules/ApiKeys/UseCases/ListApiKeys";
import { RevokeApiKey } from "../../../Application/Modules/ApiKeys/UseCases/RevokeApiKey";

const apiKeyRepository = new DrizzleApiKeyRepository();

export const createApiKey = new CreateApiKey(apiKeyRepository);
export const listApiKeys = new ListApiKeys(apiKeyRepository);
export const revokeApiKey = new RevokeApiKey(apiKeyRepository);
