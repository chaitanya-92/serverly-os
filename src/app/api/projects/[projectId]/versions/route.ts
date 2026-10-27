import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/../auth";
import { requireDb } from "@/db";
import { blueprintVersions, projects } from "@/db/schema";

type Context = { params: Promise<{ projectId: string }> };
const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("snapshot"), label: z.string().trim().max(120).optional() }),
  z.object({ action: z.literal("restore"), versionId: z.string().uuid() }),
]);

export async function GET(_request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { projectId } = await params;
  const db = requireDb();
  const [project] = await db.select({ id: projects.id }).from(projects).where(
    and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id)),
  ).limit(1);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const versions = await db.select({
    id: blueprintVersions.id,
    versionNumber: blueprintVersions.versionNumber,
    label: blueprintVersions.label,
    createdAt: blueprintVersions.createdAt,
  }).from(blueprintVersions).where(eq(blueprintVersions.projectId, projectId)).orderBy(desc(blueprintVersions.versionNumber));
  return NextResponse.json({ versions });
}

export async function POST(request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid version action", details: parsed.error.flatten() }, { status: 400 });

  const { projectId } = await params;
  const db = requireDb();
  const [project] = await db.select().from(projects).where(
    and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id)),
  ).limit(1);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (parsed.data.action === "snapshot") {
    const [version] = await db.insert(blueprintVersions).values({
      projectId: project.id,
      versionNumber: project.revision,
      document: project.document,
      label: parsed.data.label || "Manual checkpoint",
      createdBy: session.user.id,
    }).onConflictDoNothing().returning({
      id: blueprintVersions.id,
      versionNumber: blueprintVersions.versionNumber,
      createdAt: blueprintVersions.createdAt,
    });
    return NextResponse.json({ version: version ?? null }, { status: 201 });
  }

  const [version] = await db.select().from(blueprintVersions).where(
    and(eq(blueprintVersions.id, parsed.data.versionId), eq(blueprintVersions.projectId, project.id)),
  ).limit(1);
  if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 });

  await db.insert(blueprintVersions).values({
    projectId: project.id,
    versionNumber: project.revision,
    document: project.document,
    label: "Before restore",
    createdBy: session.user.id,
  }).onConflictDoNothing();

  const [updated] = await db.update(projects).set({
    document: version.document,
    revision: project.revision + 1,
    updatedAt: new Date(),
  }).where(and(
    eq(projects.id, project.id),
    eq(projects.ownerId, session.user.id),
    eq(projects.revision, project.revision),
  )).returning({ revision: projects.revision, document: projects.document });

  if (!updated) return NextResponse.json({ error: "Project changed during restore. Refresh and try again." }, { status: 409 });
  return NextResponse.json({ project: updated });
}
