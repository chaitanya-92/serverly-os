import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { auth } from "@/../auth";
import { requireDb } from "@/db";
import { projectShares, projects } from "@/db/schema";

type Context = { params: Promise<{ projectId: string; shareId: string }> };

export async function DELETE(_request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { projectId, shareId } = await params;
  const db = requireDb();

  const [ownedProject] = await db.select({ id: projects.id }).from(projects).where(
    and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id)),
  ).limit(1);
  if (!ownedProject) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const [revoked] = await db.update(projectShares).set({ revokedAt: new Date() }).where(and(
    eq(projectShares.id, shareId),
    eq(projectShares.projectId, projectId),
    isNull(projectShares.revokedAt),
  )).returning({ id: projectShares.id });
  if (!revoked) return NextResponse.json({ error: "Share link not found or already revoked" }, { status: 404 });
  return NextResponse.json({ success: true });
}
