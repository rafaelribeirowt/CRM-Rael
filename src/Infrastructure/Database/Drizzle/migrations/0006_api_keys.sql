-- API Keys table for public REST API authentication
CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id"),
  "name" text NOT NULL,
  "key_hash" text NOT NULL UNIQUE,
  "prefix" text NOT NULL,
  "last_used_at" timestamp,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "api_keys_tenant_id_idx" ON "api_keys" ("tenant_id");
CREATE INDEX IF NOT EXISTS "api_keys_key_hash_idx" ON "api_keys" ("key_hash");
