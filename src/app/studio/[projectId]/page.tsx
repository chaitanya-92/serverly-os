import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Keep project URLs on the full, original Studio instead of the reduced MVP designer.
// The project id is forwarded so the full Studio can be connected to persisted project
// data without maintaining a second, divergent designer UI.
export default async function ProjectStudioPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  redirect(`/studio?projectId=${encodeURIComponent(projectId)}`);
}
