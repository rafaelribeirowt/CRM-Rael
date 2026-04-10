import { v4 as uuid } from "uuid";
import { createHash, randomBytes } from "crypto";

export interface ApiKeyProps {
  id: string;
  tenantId: string;
  name: string;
  keyHash: string;
  prefix: string;
  lastUsedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ApiKey {
  constructor(public readonly props: ApiKeyProps) {}

  get id() { return this.props.id; }
  get tenantId() { return this.props.tenantId; }
  get name() { return this.props.name; }
  get keyHash() { return this.props.keyHash; }
  get prefix() { return this.props.prefix; }
  get lastUsedAt() { return this.props.lastUsedAt; }
  get isActive() { return this.props.isActive; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  static hashKey(rawKey: string): string {
    return createHash("sha256").update(rawKey).digest("hex");
  }

  static create(input: { tenantId: string; name: string }): { apiKey: ApiKey; rawKey: string } {
    const rawToken = randomBytes(48).toString("base64url");
    const rawKey = `crm_${rawToken}`;
    const keyHash = ApiKey.hashKey(rawKey);
    const prefix = rawKey.substring(0, 12);

    const apiKey = new ApiKey({
      id: uuid(),
      tenantId: input.tenantId,
      name: input.name,
      keyHash,
      prefix,
      lastUsedAt: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { apiKey, rawKey };
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      name: this.name,
      prefix: this.prefix,
      lastUsedAt: this.lastUsedAt,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
