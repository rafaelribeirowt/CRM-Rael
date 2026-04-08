CREATE TABLE IF NOT EXISTS "bot_flows" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"trigger_type" text NOT NULL,
	"trigger_config" text,
	"pipeline_id" text,
	"stage_id" text,
	"first_step_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bot_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"step_id" text,
	"event" text NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bot_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"flow_id" text NOT NULL,
	"contact_id" text NOT NULL,
	"lead_id" text,
	"current_step_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"variables" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"retry_count" text DEFAULT '0' NOT NULL,
	"delay_until" timestamp,
	"last_interaction_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bot_step_conditions" (
	"id" text PRIMARY KEY NOT NULL,
	"step_id" text NOT NULL,
	"label" text NOT NULL,
	"operator" text NOT NULL,
	"value" text,
	"next_step_id" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bot_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"flow_id" text NOT NULL,
	"type" text NOT NULL,
	"position" integer NOT NULL,
	"config" text NOT NULL,
	"next_step_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bot_flows" ADD CONSTRAINT "bot_flows_pipeline_id_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."pipelines"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bot_flows" ADD CONSTRAINT "bot_flows_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bot_logs" ADD CONSTRAINT "bot_logs_session_id_bot_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."bot_sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bot_logs" ADD CONSTRAINT "bot_logs_step_id_bot_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."bot_steps"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bot_sessions" ADD CONSTRAINT "bot_sessions_flow_id_bot_flows_id_fk" FOREIGN KEY ("flow_id") REFERENCES "public"."bot_flows"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bot_sessions" ADD CONSTRAINT "bot_sessions_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bot_sessions" ADD CONSTRAINT "bot_sessions_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bot_sessions" ADD CONSTRAINT "bot_sessions_current_step_id_bot_steps_id_fk" FOREIGN KEY ("current_step_id") REFERENCES "public"."bot_steps"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bot_step_conditions" ADD CONSTRAINT "bot_step_conditions_step_id_bot_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."bot_steps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bot_steps" ADD CONSTRAINT "bot_steps_flow_id_bot_flows_id_fk" FOREIGN KEY ("flow_id") REFERENCES "public"."bot_flows"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
