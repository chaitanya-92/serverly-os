import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { ArrowLeft, Clock3, Layers3, ShieldCheck } from "lucide-react";
import { auth } from "@/../auth";
import { requireDb } from "@/db";
import { projects } from "@/db/schema";

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

  const document = project.document;

  return (
    <main className="min-h-screen bg-background">
      <header className="flex min-h-16 items-center justify-between border-b border-border px-5 py-3 lg:px-8">
        <Link href="/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16}/> All projects</Link>
        <span className="text-xs text-muted-foreground">Private blueprint · Revision {project.revision}</span>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-xs uppercase tracking-[0.2em] text-primary">Studio / {project.name}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{document.serverName}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Your blueprint is loaded from PostgreSQL and scoped to your account. The next build step is wiring the existing visual editor to this saved document and autosave API.</p></div>
          <div className="flex gap-2"><span className="flex h-10 items-center gap-2 border border-border px-3 text-sm"><ShieldCheck size={16} className="text-primary"/> Private</span><span className="flex h-10 items-center gap-2 border border-border px-3 text-sm"><Clock3 size={16}/> v{project.revision}</span></div>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <section className="border border-border bg-card p-5">
            <div className="flex items-center gap-2"><Layers3 size={18} className="text-primary"/><h2 className="font-semibold">Server structure</h2></div>
            <div className="mt-5 space-y-5">
              {document.categories.map((category) => <div key={category.id}>
                <h3 className="mb-2 text-xs font-semibold tracking-[0.12em] text-muted-foreground">{category.name}</h3>
                <div className="space-y-1">
                  {category.channels.map((channel) => <div key={channel.id} className="flex items-center justify-between border border-border/70 bg-background px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">{channel.type === "voice" ? "◖" : "#"}</span>{channel.name}</span>
                    <span className="text-xs text-muted-foreground">{channel.locked ? "Restricted" : channel.type}</span>
                  </div>)}
                </div>
              </div>)}
            </div>
          </section>
          <aside className="space-y-5">
            <section className="border border-border bg-card p-5">
              <h2 className="font-semibold">Project details</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Project</dt><dd className="text-right">{project.name}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Template</dt><dd className="text-right capitalize">{document.selectedPreset}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Categories</dt><dd>{document.categories.length}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Channels</dt><dd>{document.categories.reduce((sum, category) => sum + category.channels.length, 0)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Roles</dt><dd>{document.roles.length}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Last updated</dt><dd className="text-right">{project.updatedAt.toLocaleString()}</dd></div>
              </dl>
            </section>
            <section className="border border-border bg-secondary/40 p-5">
              <h2 className="font-semibold">Next: connect the editor</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">The database-backed project flow is in place. We’ll now connect the existing channel and role controls to this project, then add reliable autosave and version checkpoints.</p>
              <Link href="/" className="mt-4 inline-flex h-10 items-center border border-border bg-card px-4 text-sm hover:border-primary">Open current editor preview</Link>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
