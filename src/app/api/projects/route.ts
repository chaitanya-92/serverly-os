import { NextResponse } from "next/server";
import { auth } from "@/../auth";
import { requireDb } from "@/db";
import { projects, type BlueprintDocument } from "@/db/schema";

const starterBlueprint: BlueprintDocument = {
  schemaVersion: 1,
  serverName: "My Community",
  selectedPreset: "developer",
  selectedChannel: "general",
  visibility: "public",
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

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL ?? "http://localhost:3000"), 303);

  const db = requireDb();
  const [project] = await db.insert(projects).values({
    ownerId: session.user.id,
    name: "Untitled community",
    description: "A new Discord server blueprint",
    document: starterBlueprint,
  }).returning({ id: projects.id });

  return NextResponse.redirect(new URL(`/studio/${project.id}`, process.env.NEXTAUTH_URL ?? "http://localhost:3000"), 303);
}
