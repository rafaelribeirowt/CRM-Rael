-- Add isHidden and isIgnored flags to contacts
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "is_hidden" boolean NOT NULL DEFAULT false;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "is_ignored" boolean NOT NULL DEFAULT false;
