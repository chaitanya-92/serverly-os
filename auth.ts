import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq } from "drizzle-orm";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { db } from "@/db";

const adapter = db
  ? DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    })
  : undefined;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      // Discord's issuer identifier is https://discord.com. Explicitly setting it
      // avoids Auth.js treating its default issuer metadata as the expected value.
      issuer: "https://discord.com",
      authorization: { params: { scope: "identify email guilds" } },
      // Use state validation for Discord OAuth; do not require a PKCE verifier cookie.
      checks: ["state"],
    }),
  ],
  session: { strategy: adapter ? "database" : "jwt" },
  pages: { signIn: "/login" },
  events: {
    async signIn({ user, account }) {
      // Re-consenting to Discord can grant the guilds scope to an existing account.
      // Persist the newly issued token/scope so the server picker sees the updated grant.
      if (account?.provider !== "discord" || !user.id || !db || !account.access_token) return;
      await db.update(accounts).set({
        access_token: account.access_token,
        refresh_token: account.refresh_token ?? null,
        expires_at: account.expires_at ?? null,
        token_type: account.token_type ?? null,
        scope: account.scope ?? null,
        id_token: account.id_token ?? null,
        session_state: account.session_state ?? null,
      }).where(and(eq(accounts.userId, user.id), eq(accounts.provider, "discord")));
    },
  },
  callbacks: {
    authorized({ auth: session }) {
      return Boolean(session?.user);
    },
  },
});
