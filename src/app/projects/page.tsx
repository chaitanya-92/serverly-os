import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { auth, signOut } from "@/../auth";
import { requireDb } from "@/db";
import { projects } from "@/db/schema";
import { redirect } from "next/navigation";
import { Plus, FolderOpen, LogOut, MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const db = requireDb();
  const rows = await db.select({
    id: projects.id,
    name: projects.name,
    description: projects.description,
    updatedAt: projects.updatedAt,
    revision: projects.revision,
  }).from(projects).where(eq(projects.ownerId, session.user.id)).orderBy(desc(projects.updatedAt));

  return (
    <main className="min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border px-6 lg:px-10">
        <Link href="/projects" className="flex items-center gap-3 font-semibold"><span className="flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground"><MessageCircle size={17}/></span>Serverly OS</Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted-foreground sm:block">{session.user.name ?? session.user.email ?? "Discord user"}</span>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
            <button className="flex h-9 items-center gap-2 border border-border px-3 text-sm hover:bg-secondary"><LogOut size={15}/> Sign out</button>
          </form>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-xs uppercase tracking-[0.2em] text-primary">Your workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Projects</h1><p className="mt-3 text-sm text-muted-foreground">Every community starts with a blueprint. Your work is private by default.</p></div>
          <form action="/api/projects" method="post">
            <button className="flex h-11 items-center justify-center gap-2 bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={17}/> New project</button>
          </form>
        </div>
        {rows.length === 0 ? (
          <div className="mt-10 border border-dashed border-border px-6 py-16 text-center">
            <FolderOpen className="mx-auto text-primary" size={32}/>
            <h2 className="mt-4 text-lg font-medium">Your first blueprint starts here</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Create a project from scratch, or start with a community template. You can connect Discord later when you want to import or publish.</p>
            <form className="mt-6" action="/api/projects" method="post"><button className="h-10 bg-primary px-4 text-sm font-semibold text-primary-foreground">Create your first project</button></form>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((project) => <Link key={project.id} href={`/studio/${project.id}`} className="group border border-border bg-card p-5 transition-colors hover:border-primary/70">
              <div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center bg-secondary text-primary"><FolderOpen size={19}/></div><span className="text-xs text-muted-foreground">v{project.revision}</span></div>
              <h2 className="mt-5 font-semibold group-hover:text-primary">{project.name}</h2>
              <p className="mt-2 line-clamp-2 min-h-10 text-sm text-muted-foreground">{project.description ?? "Discord community blueprint"}</p>
              <p className="mt-5 text-xs text-muted-foreground">Updated {project.updatedAt.toLocaleDateString()}</p>
            </Link>)}
          </div>
        )}
      </section>
    </main>
  );
}
