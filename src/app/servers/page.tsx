import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq, and } from "drizzle-orm";
import { auth, signIn, signOut } from "@/../auth";
import { requireDb } from "@/db";
import { accounts, projects } from "@/db/schema";
import { ArrowLeft, Plus, Server, ShieldCheck, LogOut } from "lucide-react";

type DiscordGuild = { id: string; name: string; icon: string | null; owner: boolean; permissions: string; };

export const dynamic = "force-dynamic";

async function getGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const response = await fetch("https://discord.com/api/users/@me/guilds?limit=200", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Discord server list could not be loaded");
  return response.json();
}

export default async function ServerSelectionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Fservers");

  const db = requireDb();
  const [account] = await db.select({ accessToken: accounts.access_token, scope: accounts.scope })
    .from(accounts).where(and(eq(accounts.userId, session.user.id), eq(accounts.provider, "discord"))).limit(1);

  let guilds: DiscordGuild[] = [];
  let needsReconnect = false;
  if (!account?.accessToken || !account.scope?.split(" ").includes("guilds")) {
    needsReconnect = true;
  } else {
    try {
      guilds = await getGuilds(account.accessToken);
    } catch {
      needsReconnect = true;
    }
  }

  const manageable = guilds.filter((guild) => guild.owner || (Number(guild.permissions) & 0x20) === 0x20);
  const projectsRows = await db.select({ id: projects.id, name: projects.name, updatedAt: projects.updatedAt })
    .from(projects).where(eq(projects.ownerId, session.user.id)).orderBy(desc(projects.updatedAt)).limit(6);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex h-16 items-center justify-between border-b border-border px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold"><span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Server size={18}/></span>serverly <span className="text-primary">OS</span></Link>
        <div className="flex items-center gap-3 text-sm text-muted-foreground"><span className="hidden sm:inline">{session.user.name ?? "Discord user"}</span><form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-secondary"><LogOut size={15}/> Sign out</button></form></div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={15}/> Home</Link>
        <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">What are we working on?</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Choose a Discord server you manage, or start a fresh blueprint. Your server won't be changed unless you explicitly deploy later.</p></div>
          <form action="/api/projects" method="post"><button className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={17}/> Create new blueprint</button></form>
        </div>
        <div className="mt-10 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Your Discord servers</h2><p className="mt-1 text-sm text-muted-foreground">Servers where your account has Manage Server permissions.</p></div><span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{manageable.length} available</span></div>
        {needsReconnect ? <div className="mt-5 rounded-xl border border-border bg-card p-6"><div className="flex gap-3"><ShieldCheck className="mt-1 text-primary" size={22}/><div><h3 className="font-medium">Connect your server list</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Discord sign-in by itself doesn't share your servers. Reconnect to grant the read-only guild-list permission. This does not let Serverly edit or deploy to a server.</p><form action={async () => { "use server"; await signIn("discord", { redirectTo: "/servers", authorizationParams: { scope: "identify email guilds" } }); }}><button className="mt-4 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Connect Discord servers</button></form></div></div></div> :
          manageable.length === 0 ? <div className="mt-5 rounded-xl border border-dashed border-border p-10 text-center"><Server className="mx-auto text-muted-foreground" size={30}/><h3 className="mt-3 font-medium">No manageable servers found</h3><p className="mt-2 text-sm text-muted-foreground">Create a new blueprint, or check that your Discord account has Manage Server permission.</p><form action="/api/projects" method="post"><button className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Create a blueprint</button></form></div> :
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{manageable.map((guild) => <form key={guild.id} action="/api/projects" method="post" className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/60"><input type="hidden" name="serverName" value={guild.name}/><input type="hidden" name="discordGuildId" value={guild.id}/><div className="flex items-center gap-3"><div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary text-lg font-semibold">{guild.icon ? <img alt="" src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=96`} className="size-full object-cover"/> : guild.name.slice(0,1).toUpperCase()}</div><div className="min-w-0 flex-1"><h3 className="truncate font-medium">{guild.name}</h3><p className="mt-1 text-xs text-muted-foreground">{guild.owner ? "Server owner" : "Manage Server permission"}</p></div></div><button className="mt-4 w-full rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:bg-secondary">Open workspace <span aria-hidden="true">→</span></button></form>)}</div>}
        {projectsRows.length > 0 && <div className="mt-12"><h2 className="text-lg font-semibold">Recent blueprints</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{projectsRows.map((project) => <Link key={project.id} href={`/studio/${project.id}`} className="rounded-xl border border-border bg-card p-4 hover:border-primary/60"><p className="font-medium">{project.name}</p><p className="mt-2 text-xs text-muted-foreground">Saved blueprint · Open Studio →</p></Link>)}</div><Link href="/projects" className="mt-4 inline-block text-sm text-primary hover:underline">Manage all projects</Link></div>}
      </section>
    </main>
  );
}
