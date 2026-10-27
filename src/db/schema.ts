import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable("accounts", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => ({
  providerAccountUnique: uniqueIndex("accounts_provider_providerAccountId_uq").on(table.provider, table.providerAccountId),
}));

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (table) => ({
  identifierTokenUnique: uniqueIndex("verification_tokens_identifier_token_uq").on(table.identifier, table.token),
}));

export type BlueprintDocument = {
  schemaVersion: 1;
  serverName: string;
  selectedPreset: string;
  selectedChannel: string;
  visibility: "public" | "private";
  categories: Array<{
    id: string;
    name: string;
    channels: Array<{ id: string; name: string; type: "text" | "voice"; locked?: boolean }>;
  }>;
  roles: Array<{
    id: string;
    name: string;
    description: string;
    color: string;
    permissions: string[];
  }>;
};

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  discordGuildId: text("discord_guild_id"),
  document: jsonb("document").$type<BlueprintDocument>().notNull(),
  revision: integer("revision").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  ownerUpdatedIdx: index("projects_owner_updated_idx").on(table.ownerId, table.updatedAt),
}));

export const blueprintVersions = pgTable("blueprint_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  document: jsonb("document").$type<BlueprintDocument>().notNull(),
  label: text("label"),
  createdBy: text("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  projectVersionUnique: uniqueIndex("blueprint_versions_project_version_uq").on(table.projectId, table.versionNumber),
  projectCreatedIdx: index("blueprint_versions_project_created_idx").on(table.projectId, table.createdAt),
}));

export const projectShares = pgTable("project_shares", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  permission: text("permission").notNull().default("read"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdBy: text("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  projectIdx: index("project_shares_project_idx").on(table.projectId),
}));

export const discordConnections = pgTable("discord_connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  discordUserId: text("discord_user_id").notNull(),
  encryptedAccessToken: text("encrypted_access_token"),
  encryptedRefreshToken: text("encrypted_refresh_token"),
  scopes: text("scopes").array().notNull().default([]),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userDiscordUnique: uniqueIndex("discord_connections_user_discord_uq").on(table.userId, table.discordUserId),
}));

export const deployments = pgTable("deployments", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  initiatedBy: text("initiated_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  discordServerId: text("discord_server_id").notNull(),
  status: text("status").notNull().default("pending"),
  summary: text("summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => ({
  projectCreatedIdx: index("deployments_project_created_idx").on(table.projectId, table.createdAt),
}));

export const deploymentOperations = pgTable("deployment_operations", {
  id: uuid("id").defaultRandom().primaryKey(),
  deploymentId: uuid("deployment_id").notNull().references(() => deployments.id, { onDelete: "cascade" }),
  operation: text("operation").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => ({
  deploymentIdx: index("deployment_operations_deployment_idx").on(table.deploymentId),
}));
