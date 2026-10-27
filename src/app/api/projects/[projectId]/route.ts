import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/../auth";
import { requireDb } from "@/db";
import { blueprintVersions, projects } from "@/db/schema";

const channelSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(80),
  type: z.enum(["text", "voice"]),
  locked: z.boolean().optional(),
});

const documentSchema = z.object({
  schemaVersion: z.literal(1),
  serverName: z.string().trim().min(1).max(100),
  selectedPreset: z.string().min(1).max(50),
  selectedChannel: z.string().max(100),
  visibility: z.enum(["public", "private"]),
  categories: z.array(z.object({
    id: z.string().min(1).max(100),
    name: z.string().trim().min(1).max(60),
    channels: z.array(channelSchema).max(200),
  })).max(100),
  roles: z.array(z.object({
    id: z.string().min(1).max(100),
    name: z.string().trim().min(1).max(60),
    description: z.string().max(120),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    permissions: z.array(z.string().max(80)).max(30),
  })).max(100),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  document: documentSchema.optional(),
  expectedRevision: z.number().int().positive().optional(),
  createVersion: z.boolean().optional(),
}).refine((value) => value.name !== undefined || value.description !== undefined || value.document !== undefined, {
  message: "Provide a project name, description, or blueprint document to update.",
});

type Context = { params: Promise<{ projectId: string }> };

export async function GET(_request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const { projectId } = await params;
  const db = requireDb();
  const [project] = await db.select().from(projects).where(
    and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id)),
  ).limit(1);

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PATCH(request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid project update", details: parsed.error.flatten() }, { status: 400 });

  const { projectId } = await params;
  const db = requireDb();
  const [current] = await db.select().from(projects).where(
    and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id)),
  ).limit(1);
  if (!current) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const data = parsed.data;
  const nextRevision = data.document ? current.revision + 1 : current.revision;
  if (data.document && data.createVersion) {
    await db.insert(blueprintVersions).values({
      projectId: current.id,
      versionNumber: current.revision,
      document: current.document,
      label: "Autosave checkpoint",
      createdBy: session.user.id,
    }).onConflictDoNothing();
  }

  const values: {
    name?: string;
    description?: string | null;
    document?: typeof current.document;
    revision?: number;
    updatedAt: Date;
  } = { updatedAt: new Date() };
  if (data.name !== undefined) values.name = data.name;
  if (data.description !== undefined) values.description = data.description;
  if (data.document !== undefined) values.document = data.document;
  if (data.document !== undefined) values.revision = nextRevision;

  const updateWhere = data.expectedRevision === undefined
    ? and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id))
    : and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id), eq(projects.revision, data.expectedRevision));
  const [updated] = await db.update(projects).set(values).where(updateWhere).returning({
    id: projects.id,
    name: projects.name,
    description: projects.description,
    document: projects.document,
    revision: projects.revision,
    updatedAt: projects.updatedAt,
  });
  if (!updated) return NextResponse.json({ error: "Revision conflict. Reload the project before saving again." }, { status: 409 });
  return NextResponse.json({ project: updated });
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const { projectId } = await params;
  const db = requireDb();
  const deleted = await db.delete(projects).where(
    and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id)),
  ).returning({ id: projects.id });

  if (!deleted.length) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
