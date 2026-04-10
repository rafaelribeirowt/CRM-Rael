import { eq, and } from "drizzle-orm";
import { ApiKey } from "../../../Domain/ApiKey/Models/ApiKey";
import { IApiKeyRepository } from "../../../Application/Contracts/Repositories/IApiKeyRepository";
import { db } from "../Drizzle/client";
import { apiKeys, ApiKeyRow } from "../Schemas/apiKeys";

function toDomain(row: ApiKeyRow): ApiKey {
  return new ApiKey({
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    keyHash: row.keyHash,
    prefix: row.prefix,
    lastUsedAt: row.lastUsedAt,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class DrizzleApiKeyRepository implements IApiKeyRepository {
  async save(apiKey: ApiKey): Promise<void> {
    await db
      .insert(apiKeys)
      .values({
        id: apiKey.id,
        tenantId: apiKey.tenantId,
        name: apiKey.name,
        keyHash: apiKey.keyHash,
        prefix: apiKey.prefix,
        lastUsedAt: apiKey.lastUsedAt,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
        updatedAt: apiKey.updatedAt,
      })
      .onConflictDoUpdate({
        target: apiKeys.id,
        set: {
          name: apiKey.name,
          isActive: apiKey.isActive,
          updatedAt: new Date(),
        },
      });
  }

  async findByKeyHash(keyHash: string): Promise<ApiKey | null> {
    const rows = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, keyHash))
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findAllByTenantId(tenantId: string): Promise<ApiKey[]> {
    const rows = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.tenantId, tenantId));
    return rows.map(toDomain);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.tenantId, tenantId)));
  }

  async updateLastUsedAt(id: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, id));
  }
}
