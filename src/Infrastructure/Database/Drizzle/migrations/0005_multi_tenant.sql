-- ============================================
-- MIGRATION: Multi-Tenancy Support
-- ============================================

-- 1. Create new tables
CREATE TABLE IF NOT EXISTS "tenants" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "logo_url" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "plans" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "price" numeric(10, 2) NOT NULL DEFAULT '0',
  "max_whatsapp_sessions" integer NOT NULL DEFAULT 1,
  "max_leads" integer NOT NULL DEFAULT 100,
  "max_users" integer NOT NULL DEFAULT 2,
  "features" jsonb DEFAULT '{}',
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id"),
  "plan_id" text NOT NULL REFERENCES "plans"("id"),
  "status" text NOT NULL DEFAULT 'active',
  "asaas_subscription_id" text,
  "asaas_customer_id" text,
  "current_period_start" timestamp,
  "current_period_end" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "payment_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id"),
  "subscription_id" text NOT NULL REFERENCES "subscriptions"("id"),
  "asaas_payment_id" text,
  "amount" numeric(10, 2) NOT NULL,
  "status" text NOT NULL,
  "payment_method" text,
  "paid_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- 2. Seed default tenant and plans
INSERT INTO "tenants" ("id", "name", "slug", "is_active")
VALUES ('default-tenant-000', 'Default', 'default', true)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "plans" ("id", "name", "slug", "price", "max_whatsapp_sessions", "max_leads", "max_users", "features")
VALUES
  ('plan-free-000', 'Free', 'free', '0', 1, 100, 2, '{"bot_flows": true}'),
  ('plan-pro-000', 'Pro', 'pro', '97', 5, -1, 10, '{"bot_flows": true, "ai_features": true}'),
  ('plan-enterprise-000', 'Enterprise', 'enterprise', '297', -1, -1, -1, '{"bot_flows": true, "ai_features": true, "priority_support": true}')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "subscriptions" ("id", "tenant_id", "plan_id", "status")
VALUES ('sub-default-000', 'default-tenant-000', 'plan-enterprise-000', 'active')
ON CONFLICT ("id") DO NOTHING;

-- 3. Add tenant_id to all existing tables (NULLABLE first)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tenant_id" text;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "tenant_id" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "tenant_id" text;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "tenant_id" text;
ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "tenant_id" text;
ALTER TABLE "pipelines" ADD COLUMN IF NOT EXISTS "tenant_id" text;
ALTER TABLE "pipeline_stages" ADD COLUMN IF NOT EXISTS "tenant_id" text;
ALTER TABLE "whatsapp_sessions" ADD COLUMN IF NOT EXISTS "tenant_id" text;
ALTER TABLE "bot_flows" ADD COLUMN IF NOT EXISTS "tenant_id" text;
ALTER TABLE "bot_steps" ADD COLUMN IF NOT EXISTS "tenant_id" text;
ALTER TABLE "bot_step_conditions" ADD COLUMN IF NOT EXISTS "tenant_id" text;
ALTER TABLE "bot_sessions" ADD COLUMN IF NOT EXISTS "tenant_id" text;
ALTER TABLE "bot_logs" ADD COLUMN IF NOT EXISTS "tenant_id" text;

-- 4. Backfill all existing data with default tenant
UPDATE "users" SET "tenant_id" = 'default-tenant-000' WHERE "tenant_id" IS NULL;
UPDATE "leads" SET "tenant_id" = 'default-tenant-000' WHERE "tenant_id" IS NULL;
UPDATE "contacts" SET "tenant_id" = 'default-tenant-000' WHERE "tenant_id" IS NULL;
UPDATE "messages" SET "tenant_id" = 'default-tenant-000' WHERE "tenant_id" IS NULL;
UPDATE "activities" SET "tenant_id" = 'default-tenant-000' WHERE "tenant_id" IS NULL;
UPDATE "pipelines" SET "tenant_id" = 'default-tenant-000' WHERE "tenant_id" IS NULL;
UPDATE "pipeline_stages" SET "tenant_id" = 'default-tenant-000' WHERE "tenant_id" IS NULL;
UPDATE "whatsapp_sessions" SET "tenant_id" = 'default-tenant-000' WHERE "tenant_id" IS NULL;
UPDATE "bot_flows" SET "tenant_id" = 'default-tenant-000' WHERE "tenant_id" IS NULL;
UPDATE "bot_steps" SET "tenant_id" = 'default-tenant-000' WHERE "tenant_id" IS NULL;
UPDATE "bot_step_conditions" SET "tenant_id" = 'default-tenant-000' WHERE "tenant_id" IS NULL;
UPDATE "bot_sessions" SET "tenant_id" = 'default-tenant-000' WHERE "tenant_id" IS NULL;
UPDATE "bot_logs" SET "tenant_id" = 'default-tenant-000' WHERE "tenant_id" IS NULL;

-- 5. Set NOT NULL and add foreign keys
ALTER TABLE "users" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");

ALTER TABLE "leads" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");

ALTER TABLE "contacts" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");

ALTER TABLE "messages" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "messages" ADD CONSTRAINT "messages_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");

ALTER TABLE "activities" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "activities" ADD CONSTRAINT "activities_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");

ALTER TABLE "pipelines" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");

ALTER TABLE "pipeline_stages" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");

ALTER TABLE "whatsapp_sessions" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "whatsapp_sessions" ADD CONSTRAINT "whatsapp_sessions_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");

ALTER TABLE "bot_flows" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "bot_flows" ADD CONSTRAINT "bot_flows_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");

ALTER TABLE "bot_steps" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "bot_steps" ADD CONSTRAINT "bot_steps_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");

ALTER TABLE "bot_step_conditions" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "bot_step_conditions" ADD CONSTRAINT "bot_step_conditions_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");

ALTER TABLE "bot_sessions" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "bot_sessions" ADD CONSTRAINT "bot_sessions_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");

ALTER TABLE "bot_logs" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "bot_logs" ADD CONSTRAINT "bot_logs_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");

-- 6. Update unique constraints
-- users: email unique per tenant (drop old, create new)
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_email_unique";
CREATE UNIQUE INDEX IF NOT EXISTS "users_tenant_email_idx" ON "users" ("tenant_id", "email");

-- contacts: whatsapp_id unique per tenant (drop old, create new)
ALTER TABLE "contacts" DROP CONSTRAINT IF EXISTS "contacts_whatsapp_id_unique";
CREATE UNIQUE INDEX IF NOT EXISTS "contacts_tenant_whatsapp_idx" ON "contacts" ("tenant_id", "whatsapp_id");

-- settings: change PK to composite (tenant_id, key)
-- Add tenant_id column first
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "tenant_id" text;
UPDATE "settings" SET "tenant_id" = 'default-tenant-000' WHERE "tenant_id" IS NULL;
ALTER TABLE "settings" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "settings" ADD CONSTRAINT "settings_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");
ALTER TABLE "settings" DROP CONSTRAINT IF EXISTS "settings_pkey";
ALTER TABLE "settings" ADD PRIMARY KEY ("tenant_id", "key");

-- 7. Create indexes on tenant_id for performance
CREATE INDEX IF NOT EXISTS "leads_tenant_id_idx" ON "leads" ("tenant_id");
CREATE INDEX IF NOT EXISTS "messages_tenant_id_idx" ON "messages" ("tenant_id");
CREATE INDEX IF NOT EXISTS "activities_tenant_id_idx" ON "activities" ("tenant_id");
CREATE INDEX IF NOT EXISTS "pipelines_tenant_id_idx" ON "pipelines" ("tenant_id");
CREATE INDEX IF NOT EXISTS "pipeline_stages_tenant_id_idx" ON "pipeline_stages" ("tenant_id");
CREATE INDEX IF NOT EXISTS "whatsapp_sessions_tenant_id_idx" ON "whatsapp_sessions" ("tenant_id");
CREATE INDEX IF NOT EXISTS "bot_flows_tenant_id_idx" ON "bot_flows" ("tenant_id");
CREATE INDEX IF NOT EXISTS "bot_steps_tenant_id_idx" ON "bot_steps" ("tenant_id");
CREATE INDEX IF NOT EXISTS "bot_step_conditions_tenant_id_idx" ON "bot_step_conditions" ("tenant_id");
CREATE INDEX IF NOT EXISTS "bot_sessions_tenant_id_idx" ON "bot_sessions" ("tenant_id");
CREATE INDEX IF NOT EXISTS "bot_logs_tenant_id_idx" ON "bot_logs" ("tenant_id");

-- 8. Update first user to superadmin role (for platform admin)
UPDATE "users" SET "role" = 'superadmin' WHERE "id" = (SELECT "id" FROM "users" ORDER BY "created_at" ASC LIMIT 1);
