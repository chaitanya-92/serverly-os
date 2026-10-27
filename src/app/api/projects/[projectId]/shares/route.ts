import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { and, desc, eq, isNull, or, gt } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/../auth";
import { requireDb } from "@/db";
import { projectShares, projects } from "@/db/schema";

export const runtime = "nodejs";
type Context = { params: Promise<{ projectId: string }> };
const createSchema = z.object({ expiresInDays: z.number().int().min(1).max(365).optional() });

export async function GET(_request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { projectId } = await params;
  const db = requireDb();
  const [project] = await db.select({ id: projects.id }).from(projects).where(
    and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id)),
  ).limit(1);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const shares = await db.select({
    id: projectShares.id,
    permission: projectShares.permission,
    expiresAt: projectShares.expiresAt,
    revokedAt: projectShares.revokedAt,
    createdAt: projectShares.createdAt,
  }).from(projectShares).where(eq(projectShares.projectId, projectId)).orderBy(desc(projectShares.createdAt));
  return NextResponse.json({ shares });
}

export async function POST(request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid share settings", details: parsed.error.flatten() }, { status: 400 });
  const { projectId } = await params;
  const db = requireDb();
  const [project] = await db.select({ id: projects.id }).from(projects).where(
    and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id)),
  ).limit(1);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = parsed.data.expiresInDays
    ? new Date(Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000)
    : null;
  const [share] = await db.insert(projectShares).values({
    projectId,
    tokenHash,
    permission: "read",
    expiresAt,
    createdBy: session.user.id,
  }).returning({ id: projectShares.id, expiresAt: projectShares.expiresAt, createdAt: projectShares.createdAt });
  const baseUrl = new URL(request.url).origin;
  return NextResponse.json({ share, url: `${baseUrl}/share/${token}` }, { status: 201 });
}
