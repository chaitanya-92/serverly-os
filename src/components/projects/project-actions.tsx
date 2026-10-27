"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Trash2, X } from "lucide-react";

export function ProjectActions({ projectId, initialName }: { projectId: string; initialName: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function renameProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 100) {
      setError("Project name must be between 1 and 100 characters.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Could not rename project.");
      setEditing(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not rename project.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteProject() {
    if (!window.confirm(`Delete "${initialName}" permanently? This also deletes its saved versions and share links.`)) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Could not delete project.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete project.");
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={renameProject} className="mt-4 space-y-2" onClick={(event) => event.stopPropagation()}>
        <label htmlFor={`project-name-${projectId}`} className="sr-only">Project name</label>
        <input id={`project-name-${projectId}`} autoFocus maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="inline-flex h-8 items-center gap-1.5 bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-50"><Check size={14}/> Save name</button>
          <button type="button" onClick={() => { setName(initialName); setEditing(false); setError(""); }} className="inline-flex h-8 items-center gap-1.5 border border-border px-3 text-xs"><X size={14}/> Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-4 flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
      <button type="button" disabled={busy} onClick={() => setEditing(true)} className="inline-flex h-8 items-center gap-1.5 border border-border px-3 text-xs hover:border-primary disabled:opacity-50"><Pencil size={13}/> Rename</button>
      <button type="button" disabled={busy} onClick={deleteProject} className="inline-flex h-8 items-center gap-1.5 border border-border px-3 text-xs text-destructive hover:bg-destructive/5 disabled:opacity-50"><Trash2 size={13}/> Delete</button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
