import { createHash } from "node:crypto";
import { notFound } from "next/navigation";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { requireDb } from "@/db";
import { projectShares, projects } from "@/db/schema";
import { Layers3, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SharedBlueprintPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{32,100}$/.test(token)) notFound();

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const db = requireDb();
  const now = new Date();
  const [result] = await db.select({
    shareId: projectShares.id,
    projectName: projects.name,
    document: projects.document,
  }).from(projectShares).innerJoin(projects, eq(projectShares.projectId, projects.id)).where(and(
    eq(projectShares.tokenHash, tokenHash),
    eq(projectShares.permission, "read"),
    isNull(projectShares.revokedAt),
    or(isNull(projectShares.expiresAt), gt(projectShares.expiresAt, now)),
  )).limit(1);

  if (!result) notFound();
  const document = result.document;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex min-h-16 items-center justify-between border-b border-border px-5 sm:px-8">
        <div className="font-semibold">serverly <span className="text-primary">OS</span></div>
        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={15}/> Read-only shared blueprint</span>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Shared project · {result.projectName}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{document.serverName}</h1>
        <p className="mt-3 text-sm text-muted-foreground">This is a read-only view. Editing and project management are available only to the owner.</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="border border-border bg-card p-5">
            <div className="flex items-center gap-2"><Layers3 size={18} className="text-primary"/><h2 className="font-semibold">Server structure</h2></div>
            <div className="mt-5 space-y-5">
              {document.categories.map((category) => <section key={category.id}>
                <h3 className="mb-2 text-xs font-semibold tracking-[0.12em] text-muted-foreground">{category.name}</h3>
                <div className="space-y-1">
                  {category.channels.map((channel) => <div key={channel.id} className="flex items-center justify-between border border-border/70 bg-background px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">{channel.type === "voice" ? "◖" : "#"}</span>{channel.name}</span>
                    <span className="text-xs text-muted-foreground">{channel.locked ? "Restricted" : channel.type}</span>
                  </div>)}
                </div>
              </section>)}
            </div>
          </section>
          <aside className="border border-border bg-card p-5">
            <h2 className="font-semibold">Roles</h2>
            <div className="mt-4 space-y-3">
              {document.roles.map((role) => <div key={role.id} className="border border-border p-3">
                <div className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ backgroundColor: role.color }}/><span className="text-sm font-medium">{role.name}</span></div>
                {role.description && <p className="mt-1 text-xs text-muted-foreground">{role.description}</p>}
                <p className="mt-2 text-xs text-muted-foreground">{role.permissions.join(" · ")}</p>
              </div>)}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
