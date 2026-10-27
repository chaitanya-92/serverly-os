import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/../auth";
import { requireDb } from "@/db";
import { projects } from "@/db/schema";
import { Designer } from "@/components/studio/designer";

export const dynamic = "force-dynamic";

export default async function ProjectStudioPage({ params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { projectId } = await params;
  const db = requireDb();
  const [project] = await db.select().from(projects).where(
    and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id)),
  ).limit(1);

  if (!project) notFound();

  return (
    <>
      <div className="flex min-h-14 items-center justify-between border-b border-border bg-background px-5 lg:px-8">
        <Link href="/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> All projects
        </Link>
        <div className="text-right">
          <p className="text-sm font-medium">{project.name}</p>
          <p className="text-xs text-muted-foreground">Project revision {project.revision} · Private workspace</p>
        </div>
      </div>
      <Designer
        projectId={project.id}
        initialDocument={project.document}
        initialRevision={project.revision}
        initialPreset={project.document.selectedPreset}
      />
    </>
  );
}
