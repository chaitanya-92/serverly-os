CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY,
  "name" text,
  "email" text UNIQUE,
  "emailVerified" timestamp,
  "image" text
);

CREATE TABLE IF NOT EXISTS "accounts" (
  "userId" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "providerAccountId" text NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text
);
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_uq"
  ON "accounts" ("provider", "providerAccountId");

CREATE TABLE IF NOT EXISTS "sessions" (
  "sessionToken" text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" text NOT NULL,
  "token" text NOT NULL UNIQUE,
  "expires" timestamp NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_identifier_token_uq"
  ON "verification_tokens" ("identifier", "token");

CREATE TABLE IF NOT EXISTS "projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "owner_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "description" text,
  "document" jsonb NOT NULL,
  "revision" integer NOT NULL DEFAULT 1,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "projects_owner_updated_idx" ON "projects" ("owner_id", "updated_at");

CREATE TABLE IF NOT EXISTS "blueprint_versions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "version_number" integer NOT NULL,
  "document" jsonb NOT NULL,
  "label" text,
  "created_by" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "blueprint_versions_project_version_uq"
  ON "blueprint_versions" ("project_id", "version_number");
CREATE INDEX IF NOT EXISTS "blueprint_versions_project_created_idx"
  ON "blueprint_versions" ("project_id", "created_at");

CREATE TABLE IF NOT EXISTS "project_shares" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "token_hash" text NOT NULL UNIQUE,
  "permission" text NOT NULL DEFAULT 'read',
  "expires_at" timestamptz,
  "revoked_at" timestamptz,
  "created_by" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "project_shares_project_idx" ON "project_shares" ("project_id");

CREATE TABLE IF NOT EXISTS "discord_connections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "discord_user_id" text NOT NULL,
  "encrypted_access_token" text,
  "encrypted_refresh_token" text,
  "scopes" text[] NOT NULL DEFAULT '{}',
  "expires_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "discord_connections_user_discord_uq"
  ON "discord_connections" ("user_id", "discord_user_id");

CREATE TABLE IF NOT EXISTS "deployments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "initiated_by" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "discord_server_id" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "summary" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "completed_at" timestamptz
);
CREATE INDEX IF NOT EXISTS "deployments_project_created_idx"
  ON "deployments" ("project_id", "created_at");

CREATE TABLE IF NOT EXISTS "deployment_operations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "deployment_id" uuid NOT NULL REFERENCES "deployments"("id") ON DELETE CASCADE,
  "operation" text NOT NULL,
  "resource_type" text NOT NULL,
  "resource_id" text,
  "status" text NOT NULL DEFAULT 'pending',
  "error_message" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "completed_at" timestamptz
);
CREATE INDEX IF NOT EXISTS "deployment_operations_deployment_idx"
  ON "deployment_operations" ("deployment_id");
