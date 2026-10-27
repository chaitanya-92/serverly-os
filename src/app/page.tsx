import { auth } from "@/../auth";
import { redirect } from "next/navigation";

/**
 * Keep the root URL as the single entry point:
 * authenticated users continue to their workspace, while new users sign in.
 */
export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/projects");
  }

  redirect("/login");
}
