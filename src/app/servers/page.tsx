import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { auth, signIn, signOut } from "@/../auth";
import { requireDb } from "@/db";
import { accounts, projects } from "@/db/schema";
import { ArrowLeft, Check, Plus, Server, ShieldCheck, LogOut, Search } from "lucide-react";

type DiscordGuild = { id: string; name: string; icon: string | null; owner: boolean; permissions: string };

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
    try { guilds = await getGuilds(account.accessToken); } catch { needsReconnect = true; }
  }

  const manageable = guilds.filter((guild) => guild.owner || (Number(guild.permissions) & 0x20) === 0x20);
  const recent = await db.select({ id: projects.id, name: projects.name, updatedAt: projects.updatedAt })
    .from(projects).where(eq(projects.ownerId, session.user.id)).orderBy(desc(projects.updatedAt)).limit(6);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0e0e0d] text-[#f3f0e8]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,164,65,0.10),transparent_55%)]"/>
      <header className="relative flex h-16 items-center justify-between border-b border-white/10 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold"><span className="flex size-9 items-center justify-center rounded-lg bg-[#d9a441] text-black"><Server size={18}/></span>serverly <span className="text-[#d9a441]">OS</span></Link>
        <div className="flex items-center gap-3 text-sm text-white/55"><span className="hidden sm:inline">{session.user.name ?? "Discord user"}</span><form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 hover:bg-white/5"><LogOut size={15}/> Sign out</button></form></div>
      </header>
      <section className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"><ArrowLeft size={15}/> Back to Serverly OS</Link>
        <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#171715] shadow-2xl shadow-black/40">
          <div className="border-b border-white/10 px-6 py-6 sm:px-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d9a441]"><ShieldCheck size={14}/> Workspace connection</div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Choose a server</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Select a Discord server you manage to start a blueprint, or create a new one. This selection does not invite a bot or change your server.</p>
          </div>
          <div className="border-b border-white/10 px-6 py-4 sm:px-8"><div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white/40"><Search size={16}/> Servers you can manage</div></div>
          <div className="p-5 sm:p-8">
            {needsReconnect ? <div className="rounded-xl border border-white/10 bg-black/15 p-6"><ShieldCheck className="text-[#d9a441]" size={24}/><h2 className="mt-3 font-medium">Allow access to your server list</h2><p className="mt-2 text-sm leading-6 text-white/55">Discord sign-in needs the read-only server-list permission. Reconnect to grant it. This does not add a bot.</p><form action={async () => { "use server"; await signIn("discord", { redirectTo: "/servers", authorizationParams: { scope: "identify email guilds" } }); }}><button className="mt-4 rounded-lg bg-[#d9a441] px-4 py-2.5 text-sm font-semibold text-black">Continue with Discord</button></form></div> :
            manageable.length === 0 ? <div className="rounded-xl border border-dashed border-white/15 p-8 text-center"><Server className="mx-auto text-white/35" size={30}/><h2 className="mt-3 font-medium">No manageable servers found</h2><p className="mt-2 text-sm text-white/50">You can still create a fresh blueprint and design your server in Studio.</p></div> :
            <div className="grid gap-3 sm:grid-cols-2">{manageable.map((guild) => <form key={guild.id} action="/api/projects" method="post" className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-[#d9a441]/70 hover:bg-[#d9a441]/[0.06]"><input type="hidden" name="serverName" value={guild.name}/><input type="hidden" name="discordGuildId" value={guild.id}/><div className="flex items-center gap-3"><div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#d9a441]/15 font-semibold text-[#e8b84e]">{guild.icon ? <img alt="" src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=96`} className="size-full object-cover"/> : guild.name.slice(0,1).toUpperCase()}</div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">{guild.name}</h3><p className="mt-1 text-xs text-white/45">{guild.owner ? "Server owner" : "Manage Server permission"}</p></div><span className="flex size-7 items-center justify-center rounded-full border border-white/10 text-white/35 transition group-hover:border-[#d9a441] group-hover:bg-[#d9a441] group-hover:text-black"><Check size={15}/></span></div><button className="mt-4 w-full rounded-lg border border-white/10 px-3 py-2.5 text-sm font-medium transition group-hover:border-[#d9a441]/50 group-hover:text-[#e8b84e]">Select server <span aria-hidden="true">→</span></button></form>)}</div>}
            <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-white/30"><span className="h-px flex-1 bg-white/10"/>or start fresh<span className="h-px flex-1 bg-white/10"/></div>
            <form action="/api/projects" method="post"><button className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#d9a441]/50 bg-[#d9a441] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#e8b84e]"><Plus size={17}/> Create a new blueprint</button></form>
          </div>
          {recent.length > 0 && <div className="border-t border-white/10 px-6 py-5 sm:px-8"><h2 className="text-sm font-semibold">Continue a recent blueprint</h2><div className="mt-3 flex flex-wrap gap-2">{recent.map((project) => <Link key={project.id} href={`/studio/${project.id}`} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 hover:border-[#d9a441]/50 hover:text-white">{project.name} ↗</Link>)}</div></div>}
        </div>
        <p className="mt-5 text-center text-xs text-white/30">Selecting a server starts a blueprint. Importing or deploying server changes will be a separate, explicit step.</p>
      </section>
    </main>
  );
}
