import { NextResponse } from "next/server";
import { auth } from "@/../auth";
import { and, eq } from "drizzle-orm";
import { requireDb } from "@/db";
import { accounts, projects, type BlueprintDocument } from "@/db/schema";

const starterBlueprint: BlueprintDocument = {
  schemaVersion: 1,
  serverName: "My Community",
  selectedPreset: "developer",
  selectedChannel: "general",
  visibility: "private",
  categories: [
    { id: "welcome", name: "START HERE", channels: [
      { id: "start", name: "start-here", type: "text" },
      { id: "rules", name: "rules", type: "text" },
      { id: "announcements", name: "announcements", type: "text", locked: true },
    ] },
    { id: "community", name: "THE COMMUNITY", channels: [
      { id: "general", name: "general", type: "text" },
      { id: "introductions", name: "introductions", type: "text" },
      { id: "showcase", name: "showcase", type: "text" },
    ] },
  ],
  roles: [
    { id: "owner", name: "Owner", description: "Full server access", color: "#D9A441", permissions: ["Manage server", "Manage channels", "Manage roles", "View channels", "Send messages"] },
    { id: "moderator", name: "Moderator", description: "Manage community", color: "#D9A441", permissions: ["Manage messages", "Kick members", "View channels", "Send messages"] },
    { id: "member", name: "Member", description: "Standard access", color: "#D9A441", permissions: ["View channels", "Send messages"] },
  ],
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL ?? "http://localhost:3000"), 303);

  const form = await request.formData().catch(() => null);
  const requestedName = String(form?.get("serverName") ?? "").trim().slice(0, 100);
  const requestedGuildId = String(form?.get("discordGuildId") ?? "").trim();
  let discordGuildId: string | null = null;

  if (requestedGuildId) {
    if (!/^\d{17,20}$/.test(requestedGuildId)) {
      return NextResponse.json({ error: "Invalid Discord server ID" }, { status: 400 });
    }
    const db = requireDb();
    const [account] = await db.select({ accessToken: accounts.access_token, scope: accounts.scope })
      .from(accounts)
      .where(and(eq(accounts.userId, session.user.id), eq(accounts.provider, "discord")))
      .limit(1);
    if (!account?.accessToken) {
      return NextResponse.json({ error: "Reconnect Discord and grant server-list access first." }, { status: 403 });
    }
    const response = await fetch("https://discord.com/api/users/@me/guilds?limit=200", {
      headers: { Authorization: `Bearer ${account.accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: "Discord server list expired. Reconnect Discord and try again." }, { status: 401 });
    const guilds = await response.json() as Array<{ id: string; owner: boolean; permissions: string }>;
    const selectedGuild = guilds.find((guild) => guild.id === requestedGuildId);
    if (!selectedGuild || (!selectedGuild.owner && (Number(selectedGuild.permissions) & 0x20) !== 0x20)) {
      return NextResponse.json({ error: "You do not have Manage Server permission for that Discord server." }, { status: 403 });
    }
    discordGuildId = selectedGuild.id;
  }
  const projectName = requestedName || "Untitled community";
  const blueprint: BlueprintDocument = {
    ...starterBlueprint,
    serverName: requestedName || starterBlueprint.serverName,
    selectedPreset: requestedName ? "developer" : starterBlueprint.selectedPreset,
  };

  const db = requireDb();
  const [project] = await db.insert(projects).values({
    ownerId: session.user.id,
    name: projectName,
    description: requestedName
      ? "Blueprint for a selected Discord server. Existing channels are not imported yet."
      : "A new Discord server blueprint",
    discordGuildId,
    document: blueprint,
  }).returning({ id: projects.id });

  return NextResponse.redirect(new URL(`/studio/${project.id}`, process.env.NEXTAUTH_URL ?? "http://localhost:3000"), 303);
}
