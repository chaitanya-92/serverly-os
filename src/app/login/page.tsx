import { auth, signIn } from "@/../auth";
import { redirect } from "next/navigation";
import { MessageCircle, ShieldCheck } from "lucide-react";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/servers");

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md border border-border bg-card p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground"><MessageCircle size={20} /></div>
          <div>
            <p className="text-lg font-semibold tracking-tight">Serverly OS</p>
            <p className="text-sm text-muted-foreground">Your community, your architecture.</p>
          </div>
        </div>
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-primary">Welcome back</p>
        <h1 className="text-3xl font-semibold tracking-tight">Build your server blueprint.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Sign in with Discord to choose a server you manage or create a new blueprint. Server changes remain separate until you deploy.</p>
        <form className="mt-8" action={async () => { "use server"; await signIn("discord", { redirectTo: "/servers" }); }}>
          <button className="flex h-12 w-full items-center justify-center gap-2 bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            <MessageCircle size={18} /> Continue with Discord
          </button>
        </form>
        <div className="mt-6 flex items-start gap-2 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
          <p>Signing in does not grant Serverly OS access to your Discord servers. Server access is requested separately when needed.</p>
        </div>
      </div>
    </main>
  );
}
