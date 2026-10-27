"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown, ArrowRight, AudioLines, Bell, Check, ChevronDown, ChevronRight, LoaderCircle,
  CircleHelp, Code2, Command, Crown, Gamepad2, Hash, LayoutGrid, LockKeyhole,
  MessageCircle, MoreHorizontal, PanelLeft, Plus, Search, Settings2, ShieldCheck, Sparkles, WandSparkles,
  Volume2, X, Zap, Download, Save, Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ChannelType = "text" | "voice";
type Channel = { id: string; name: string; type: ChannelType; locked?: boolean };
type Category = { id: string; name: string; channels: Channel[] };
type ServerRole = { id: string; name: string; description: string; color: string; permissions: string[] };
type ModalState = "channel" | "role" | "category" | "rename-category" | null;

const starterCategories: Category[] = [
  { id: "welcome", name: "START HERE", channels: [
    { id: "start", name: "start-here", type: "text" },
    { id: "rules", name: "rules", type: "text" },
    { id: "announcements", name: "announcements", type: "text", locked: true },
  ]},
  { id: "community", name: "THE COMMUNITY", channels: [
    { id: "general", name: "general", type: "text" },
    { id: "introductions", name: "introductions", type: "text" },
    { id: "showcase", name: "showcase", type: "text" },
  ]},
  { id: "dev", name: "BUILD TOGETHER", channels: [
    { id: "help", name: "dev-help", type: "text" },
    { id: "resources", name: "resources", type: "text" },
    { id: "coding", name: "Coding lounge", type: "voice" },
    { id: "pairing", name: "Pair programming", type: "voice" },
  ]},
  { id: "staff", name: "STAFF CORNER", channels: [
    { id: "mod-chat", name: "mod-chat", type: "text", locked: true },
  ]},
];

const presets = [
  { id: "developer", name: "Developer Hub", description: "Build in public, share projects, help each other.", icon: Code2, members: "500+", color: "violet" },
  { id: "gaming", name: "Gaming Community", description: "Squads, game nights, voice lobbies, and LFG.", icon: Gamepad2, members: "1k+", color: "blue" },
  { id: "creator", name: "Creator Club", description: "A home for fans, updates, and creative feedback.", icon: Sparkles, members: "250+", color: "pink" },
  { id: "study", name: "Study Group", description: "Study rooms, accountability, and shared resources.", icon: Crown, members: "100+", color: "amber" },
  { id: "support", name: "Support Community", description: "Help desk, FAQs, tickets and trusted moderators.", icon: ShieldCheck, members: "300+", color: "green" },
  { id: "book-club", name: "Book Club", description: "Reading sprints, reviews, genres and monthly picks.", icon: LayoutGrid, members: "150+", color: "rose" },
  { id: "fitness", name: "Fitness Crew", description: "Workout accountability, progress and group coaching.", icon: AudioLines, members: "200+", color: "blue" },
  { id: "startup", name: "Startup Network", description: "Founder discussions, feedback, launches and networking.", icon: Command, members: "400+", color: "amber" },
];

function Designer({ initialPreset = "developer" }: { initialPreset?: string }) {
  const [selectedPreset, setSelectedPreset] = useState(initialPreset);
  const [categories, setCategories] = useState<Category[]>(starterCategories);
  const [selectedChannel, setSelectedChannel] = useState("general");
  const [serverName, setServerName] = useState("Devspace");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [workspaceTab, setWorkspaceTab] = useState<"designer" | "ai" | "templates">("designer");
  const [search, setSearch] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHint, setSidebarHint] = useState<string | null>(null);

  useEffect(() => {
    if (!sidebarHint) return;
    const timeout = window.setTimeout(() => setSidebarHint(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [sidebarHint]);
  const [modal, setModal] = useState<ModalState>(null);
  const [channelDraft, setChannelDraft] = useState({ name: "new-channel", type: "text" as ChannelType, categoryId: "welcome", isPrivate: false });
  const [categoryDraft, setCategoryDraft] = useState({ name: "NEW CATEGORY", categoryId: "" });
  const [roleDraft, setRoleDraft] = useState({ name: "", description: "", color: "#D9A441", permissions: ["View channels", "Send messages"] });
  const [roles, setRoles] = useState<ServerRole[]>([{ id: "owner", name: "Owner", description: "Full server access", color: "#D9A441", permissions: ["Manage server", "Manage channels", "Manage roles", "View channels", "Send messages"] }, { id: "moderator", name: "Moderator", description: "Manage community", color: "#D9A441", permissions: ["Manage messages", "Kick members", "View channels", "Send messages"] }, { id: "member", name: "Member", description: "Standard access", color: "#D9A441", permissions: ["View channels", "Send messages"] }]);
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState<"structure" | "roles">("structure");
  const [isRestored, setIsRestored] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  const [showArchitectPromo, setShowArchitectPromo] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("serverly-os:blueprint:v1");
      if (raw) {
        const saved = JSON.parse(raw) as { serverName?: string; selectedPreset?: string; selectedChannel?: string; categories?: Category[]; savedAt?: string; visibility?: "public" | "private"; roles?: ServerRole[] };
        if (typeof saved.serverName === "string") setServerName(saved.serverName);
        if (typeof saved.selectedPreset === "string" && presets.some((preset) => preset.id === saved.selectedPreset)) setSelectedPreset(saved.selectedPreset);
        if (Array.isArray(saved.categories)) setCategories(saved.categories);
        if (typeof saved.selectedChannel === "string") setSelectedChannel(saved.selectedChannel);
        if (typeof saved.savedAt === "string") setLastSavedAt(saved.savedAt);
        if (saved.visibility === "public" || saved.visibility === "private") setVisibility(saved.visibility);
        if (Array.isArray(saved.roles) && saved.roles.every((role) => role && typeof role.id === "string" && typeof role.name === "string" && Array.isArray(role.permissions))) setRoles(saved.roles);
      }
    } catch {
      window.localStorage.removeItem("serverly-os:blueprint:v1");
    } finally {
      setIsRestored(true);
    }
  }, []);

  useEffect(() => {
    try {
      const alreadyShown = window.localStorage.getItem("serverly-os:architect-promo-seen:v1") === "1";
      if (!alreadyShown) {
        setShowArchitectPromo(true);
        window.localStorage.setItem("serverly-os:architect-promo-seen:v1", "1");
      }
    } catch {
      // Keep the workspace usable when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (!isRestored) return;
    const timer = window.setTimeout(() => {
      const savedAt = new Date().toISOString();
      const blueprint = { schemaVersion: 1, serverName, selectedPreset, selectedChannel, categories, visibility, roles, savedAt };
      try {
        window.localStorage.setItem("serverly-os:blueprint:v1", JSON.stringify(blueprint));
        setLastSavedAt(savedAt);
      } catch {
        setNotice("Auto-save unavailable. Use Export JSON to keep a backup.");
      }
    }, 650);
    return () => window.clearTimeout(timer);
  }, [isRestored, serverName, selectedPreset, selectedChannel, categories, visibility, roles]);

  function saveDraft() {
    const savedAt = new Date().toISOString();
    const blueprint = { schemaVersion: 1, serverName, selectedPreset, selectedChannel, categories, visibility, roles, savedAt };
    try {
      window.localStorage.setItem("serverly-os:blueprint:v1", JSON.stringify(blueprint));
      setLastSavedAt(savedAt);
      setNotice("Draft saved on this device.");
    } catch {
      setNotice("Could not save locally. Check your browser storage settings.");
    }
  }

  async function importBlueprint(file: File | undefined) {
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object") throw new Error("invalid");
      const candidate = parsed as { serverName?: unknown; selectedPreset?: unknown; selectedChannel?: unknown; categories?: unknown; visibility?: unknown; roles?: unknown };
      if (typeof candidate.serverName !== "string" || !Array.isArray(candidate.categories)) throw new Error("invalid");
      const validCategories = candidate.categories.every((category) => {
        if (!category || typeof category !== "object") return false;
        const item = category as { id?: unknown; name?: unknown; channels?: unknown };
        if (typeof item.id !== "string" || typeof item.name !== "string" || !Array.isArray(item.channels)) return false;
        return item.channels.every((channel) => {
          if (!channel || typeof channel !== "object") return false;
          const entry = channel as { id?: unknown; name?: unknown; type?: unknown; locked?: unknown };
          return typeof entry.id === "string" && typeof entry.name === "string" && (entry.type === "text" || entry.type === "voice") && (entry.locked === undefined || typeof entry.locked === "boolean");
        });
      });
      if (!validCategories) throw new Error("invalid");
      const importedCategories = candidate.categories as Category[];
      const presetId = typeof candidate.selectedPreset === "string" && presets.some((preset) => preset.id === candidate.selectedPreset) ? candidate.selectedPreset : "developer";
      setServerName(candidate.serverName.slice(0, 100));
      setSelectedPreset(presetId);
      setCategories(importedCategories);
      if (candidate.visibility === "public" || candidate.visibility === "private") setVisibility(candidate.visibility);
      if (Array.isArray(candidate.roles) && candidate.roles.every((role) => role && typeof role === "object" && typeof (role as ServerRole).id === "string" && typeof (role as ServerRole).name === "string" && Array.isArray((role as ServerRole).permissions))) setRoles(candidate.roles as ServerRole[]);
      const allChannels = importedCategories.flatMap((category) => category.channels);
      setSelectedChannel(typeof candidate.selectedChannel === "string" && allChannels.some((channel) => channel.id === candidate.selectedChannel) ? candidate.selectedChannel : (allChannels[0]?.id ?? ""));
      setNotice("Blueprint imported. Save the draft to keep it on this device.");
    } catch {
      setNotice("That file is not a valid Serverly blueprint JSON.");
    }
  }

  function exportBlueprint() {
    const blueprint = { schemaVersion: 1, product: "Serverly OS", serverName, selectedPreset, selectedChannel, categories, visibility, roles, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(serverName || "serverly-blueprint").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "serverly-blueprint"}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice("Blueprint exported as JSON.");
  }

  const activePreset = presets.find((preset) => preset.id === selectedPreset) ?? presets[0];
  const selected = useMemo(
    () => categories.flatMap((category) => category.channels).find((channel) => channel.id === selectedChannel),
    [categories, selectedChannel]
  );

  function choosePreset(id: string) {
    setIsApplyingTemplate(true);
    setSelectedPreset(id);
    const preset = presets.find((item) => item.id === id);
    if (preset) setServerName(preset.name);
    if (id === "gaming") {
      setCategories([
        { id: "welcome", name: "WELCOME", channels: [{ id: "start", name: "start-here", type: "text" }, { id: "rules", name: "server-rules", type: "text" }, { id: "announcements", name: "announcements", type: "text", locked: true }] },
        { id: "hangout", name: "HANGOUT", channels: [{ id: "general", name: "general-chat", type: "text" }, { id: "clips", name: "clips-and-highlights", type: "text" }, { id: "looking", name: "looking-for-group", type: "text" }] },
        { id: "voice", name: "VOICE LOBBIES", channels: [{ id: "squad", name: "Squad One", type: "voice" }, { id: "squad-two", name: "Squad Two", type: "voice" }, { id: "afk", name: "AFK", type: "voice" }] },
        { id: "staff", name: "MODERATION", channels: [{ id: "mod-chat", name: "mod-chat", type: "text", locked: true }] },
      ]);
    } else if (id === "creator") {
      setCategories([
        { id: "welcome", name: "GET STARTED", channels: [{ id: "start", name: "welcome", type: "text" }, { id: "rules", name: "community-guidelines", type: "text" }, { id: "announcements", name: "creator-updates", type: "text", locked: true }] },
        { id: "community", name: "COMMUNITY", channels: [{ id: "general", name: "chat", type: "text" }, { id: "introductions", name: "introduce-yourself", type: "text" }, { id: "showcase", name: "share-your-work", type: "text" }] },
        { id: "studio", name: "THE STUDIO", channels: [{ id: "feedback", name: "feedback", type: "text" }, { id: "ideas", name: "ideas", type: "text" }, { id: "hangout", name: "Studio hangout", type: "voice" }] },
      ]);
    } else if (id === "study") {
      setCategories([
        { id: "welcome", name: "START HERE", channels: [{ id: "start", name: "welcome", type: "text" }, { id: "rules", name: "study-rules", type: "text" }, { id: "resources", name: "resources", type: "text" }] },
        { id: "study", name: "STUDY FLOOR", channels: [{ id: "general", name: "study-chat", type: "text" }, { id: "questions", name: "ask-for-help", type: "text" }, { id: "progress", name: "daily-progress", type: "text" }] },
        { id: "rooms", name: "FOCUS ROOMS", channels: [{ id: "focus", name: "Pomodoro room", type: "voice" }, { id: "silent", name: "Silent study", type: "voice" }] },
      ]);
    } else if (id === "support") {
      setCategories([{ id: "help", name: "HELP CENTER", channels: [{ id: "welcome", name: "welcome", type: "text" }, { id: "faq", name: "frequently-asked", type: "text" }, { id: "announcements", name: "service-updates", type: "text", locked: true }] }, { id: "tickets", name: "CUSTOMER SUPPORT", channels: [{ id: "open-ticket", name: "open-a-ticket", type: "text" }, { id: "ticket-status", name: "ticket-status", type: "text" }] }, { id: "team", name: "SUPPORT TEAM", channels: [{ id: "team-chat", name: "support-team", type: "text", locked: true }, { id: "handoff", name: "handoff-room", type: "voice", locked: true }] }]);
    } else if (id === "book-club") {
      setCategories([{ id: "club", name: "THE READING ROOM", channels: [{ id: "welcome", name: "welcome", type: "text" }, { id: "announcements", name: "club-announcements", type: "text" }, { id: "current", name: "current-read", type: "text" }] }, { id: "discussion", name: "BOOK DISCUSSIONS", channels: [{ id: "reviews", name: "reviews-and-ratings", type: "text" }, { id: "genres", name: "find-your-genre", type: "text" }, { id: "spoilers", name: "spoiler-room", type: "text", locked: true }] }, { id: "events", name: "READ TOGETHER", channels: [{ id: "sprint", name: "reading-sprints", type: "text" }, { id: "voice", name: "silent-reading", type: "voice" }] }]);
    } else if (id === "fitness") {
      setCategories([{ id: "start", name: "GET MOVING", channels: [{ id: "welcome", name: "welcome", type: "text" }, { id: "guidelines", name: "community-guidelines", type: "text" }, { id: "announcements", name: "fitness-updates", type: "text", locked: true }] }, { id: "training", name: "TRAINING FLOOR", channels: [{ id: "workouts", name: "daily-workout", type: "text" }, { id: "progress", name: "progress-check-in", type: "text" }, { id: "nutrition", name: "food-and-recovery", type: "text" }] }, { id: "coaching", name: "COACHING", channels: [{ id: "ask-coach", name: "ask-a-coach", type: "text" }, { id: "group-session", name: "group-training", type: "voice" }] }]);
    } else if (id === "startup") {
      setCategories([{ id: "network", name: "START HERE", channels: [{ id: "welcome", name: "introductions", type: "text" }, { id: "announcements", name: "network-updates", type: "text", locked: true }, { id: "guidelines", name: "community-guidelines", type: "text" }] }, { id: "build", name: "BUILD IN PUBLIC", channels: [{ id: "founders", name: "founder-chat", type: "text" }, { id: "feedback", name: "product-feedback", type: "text" }, { id: "launches", name: "launch-your-product", type: "text" }] }, { id: "connect", name: "MAKE CONNECTIONS", channels: [{ id: "opportunities", name: "opportunities", type: "text" }, { id: "networking", name: "networking-room", type: "voice" }, { id: "private", name: "founder-circle", type: "text", locked: true }] }]);
    } else {
      setCategories(starterCategories.map((category) => ({ ...category, channels: category.channels.map((channel) => ({ ...channel })) })));
    }
    const nextSelection = "general";
    setSelectedChannel(nextSelection);
    setWorkspaceTab("designer");
    setNotice("");
    window.setTimeout(() => setIsApplyingTemplate(false), 260);
  }

  useEffect(() => {
    if (initialPreset !== "developer") choosePreset(initialPreset);
  }, [initialPreset]);

  function addChannel(type: ChannelType, name = type === "text" ? "new-channel" : "New voice room", categoryId?: string, isPrivate = false) {
    const id = `${type}-${Date.now()}`;
    setCategories((current) => {
      const next = [...current];
      if (next.length === 0) next.push({ id: "new-category", name: "NEW CATEGORY", channels: [] });
      const targetIndex = Math.max(0, next.findIndex((category) => category.id === categoryId));
      next[targetIndex] = { ...next[targetIndex], channels: [...next[targetIndex].channels, { id, name, type, locked: isPrivate }] };
      return next;
    });
    setSelectedChannel(id);
    setModal(null);
    setNotice(type === "text" ? "Text channel added" : "Voice channel added");
  }

  function renameSelected(name: string) {
    setCategories((current) => current.map((category) => ({
      ...category,
      channels: category.channels.map((channel) => channel.id === selectedChannel ? { ...channel, name } : channel),
    })));
  }

  function removeSelected() {
    if (!selected) return;
    setCategories((current) => current.map((category) => ({
      ...category,
      channels: category.channels.filter((channel) => channel.id !== selectedChannel),
    })));
    setSelectedChannel("");
    setNotice("Channel removed from blueprint");
  }

  const channelCount = categories.reduce((count, category) => count + category.channels.length, 0);
  const voiceCount = categories.reduce((count, category) => count + category.channels.filter((channel) => channel.type === "voice").length, 0);

  return (
    <main className="h-dvh overflow-hidden bg-background text-foreground">
      <header className="relative z-30 flex h-[68px] shrink-0 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur-xl lg:px-8">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => window.location.assign("/")} aria-label="Serverly OS home" className="flex items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><LayoutGrid className="size-5" /></span><span className="leading-tight"><span className="block text-[15px] font-semibold tracking-tight">serverly <span className="text-primary">OS</span></span><span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Community architect</span></span></button>
          <Separator orientation="vertical" className="mx-3 hidden h-7 md:block" />
          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex"><span>Workspace</span><ChevronRight className="size-3.5" /><span className="text-foreground">{serverName || "Untitled server"}</span></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground lg:inline">{lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Saving locally…"}</span>
          <Button variant="ghost" size="icon" className="hidden text-muted-foreground sm:inline-flex" aria-label="Help"><CircleHelp /></Button>
          <Button variant="outline" className="hidden sm:inline-flex" onClick={saveDraft} disabled={!isRestored}><Save className="size-4" /> Save draft</Button>
          <Button onClick={() => setNotice("Discord integration is coming next — this preview does not publish yet.")}><Zap className="size-4" /> <span className="hidden sm:inline">Deploy server</span><span className="sm:hidden">Deploy</span></Button>
        </div>
      </header>

      <div className={`mx-auto grid h-[calc(100dvh-68px)] min-h-0 max-w-[1800px] grid-cols-1 gap-4 overflow-hidden p-3 lg:p-4 ${sidebarCollapsed ? "xl:grid-cols-[64px_minmax(0,1fr)_252px]" : "xl:grid-cols-[208px_minmax(0,1fr)_252px]"} 2xl:gap-5 2xl:p-5`}>
        <div className="relative min-w-0">
          <Button variant="outline" size="icon" className="absolute -right-3 top-0 z-40 hidden size-7 rounded-sm border border-border bg-card text-muted-foreground shadow-md transition-all duration-200 hover:border-primary hover:bg-accent hover:text-primary xl:inline-flex" aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => { setSidebarHint(null); setSidebarCollapsed((value) => !value); }}><PanelLeft className={`size-3.5 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} /></Button>
        <aside className={`flex min-w-0 flex-col gap-4 xl:sticky xl:top-0 xl:h-full xl:min-h-0 xl:self-start ${sidebarCollapsed ? "overflow-visible" : "overflow-y-auto overscroll-contain"} xl:pr-1`}>
          <div className={`flex min-h-7 items-center ${sidebarCollapsed ? "justify-center" : "justify-between pr-3"}`}><div className={`text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground ${sidebarCollapsed ? "sr-only" : ""}`}>Workspace</div></div>
          <nav className="space-y-1">
            <Button variant="ghost" title={sidebarCollapsed ? undefined : "Server designer"} onMouseEnter={() => sidebarCollapsed && setSidebarHint("Server designer")} onMouseLeave={() => setSidebarHint(null)} onFocus={() => sidebarCollapsed && setSidebarHint("Server designer")} onBlur={() => setSidebarHint(null)} onClick={() => { setSidebarHint(null); setWorkspaceTab("designer"); setActiveTab("structure"); }} className={`flex h-10 w-full ${sidebarCollapsed ? "justify-center px-0" : "justify-start"} items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium ${workspaceTab === "designer" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}><LayoutGrid className="size-4 shrink-0 text-primary" />{!sidebarCollapsed && "Server designer"}</Button>
            <Button variant="ghost" title={sidebarCollapsed ? undefined : "AI architect"} onMouseEnter={() => sidebarCollapsed && setSidebarHint("AI architect")} onMouseLeave={() => setSidebarHint(null)} onFocus={() => sidebarCollapsed && setSidebarHint("AI architect")} onBlur={() => setSidebarHint(null)} onClick={() => { setSidebarHint(null); setWorkspaceTab("ai"); setNotice(""); }} className={`flex h-10 w-full ${sidebarCollapsed ? "justify-center px-0" : "justify-start"} items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] ${workspaceTab === "ai" ? "bg-accent text-accent-foreground" : "text-muted-foreground transition hover:bg-secondary hover:text-foreground"}`}><Sparkles className="size-4 shrink-0" />{!sidebarCollapsed && "AI architect"}</Button>
            <Button variant="ghost" title={sidebarCollapsed ? undefined : "Template library"} onMouseEnter={() => sidebarCollapsed && setSidebarHint("Template library")} onMouseLeave={() => setSidebarHint(null)} onFocus={() => sidebarCollapsed && setSidebarHint("Template library")} onBlur={() => setSidebarHint(null)} onClick={() => { setSidebarHint(null); setWorkspaceTab("templates"); setNotice(""); }} className={`flex h-10 w-full ${sidebarCollapsed ? "justify-center px-0" : "justify-start"} items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] ${workspaceTab === "templates" ? "bg-accent text-accent-foreground" : "text-muted-foreground transition hover:bg-secondary hover:text-foreground"}`}><LayoutGrid className="size-4 shrink-0" />{!sidebarCollapsed && "Template library"}</Button>
          </nav>
          {!sidebarCollapsed && <><Separator /><div className="flex items-center justify-between"><div className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Quick start</div><span className="text-xs text-muted-foreground">{String(Math.min(4, presets.length)).padStart(2, "0")}</span></div></> }
          {!sidebarCollapsed && <div className="space-y-1.5">
            {presets.slice(0, 4).map((preset) => {
              const Icon = preset.icon;
              const isActive = selectedPreset === preset.id;
              return <Button variant="ghost" key={preset.id} title={preset.name} aria-label={preset.name} onClick={() => choosePreset(preset.id)} className={`group flex h-auto min-h-0 w-full ${sidebarCollapsed ? "justify-center px-0" : "justify-start"} items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors ${isActive ? "border-primary/50 bg-primary/[0.08] " : "border-transparent hover:border-border hover:bg-card"}`}>
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-md ${isActive ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground group-hover:text-foreground"}`}><Icon className="size-4" /></div>
                {!sidebarCollapsed && <div className="min-w-0 flex-1"><div className={`text-sm font-medium ${isActive ? "text-foreground" : "text-secondary-foreground"}`}>{preset.name}</div></div>}
              </Button>;
            })}
          </div>}

        </aside>
        </div>

        {sidebarHint && sidebarCollapsed && <AnimatePresence><motion.div key={sidebarHint} initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }} role="status" className="fixed right-4 top-[76px] z-[120] flex max-w-[min(320px,calc(100vw-2rem))] items-center gap-3 border border-border bg-card px-3 py-2.5 text-sm text-foreground shadow-xl"><span className="size-1.5 shrink-0 bg-primary" /><span className="font-medium">{sidebarHint}</span><span className="text-xs text-muted-foreground">Navigation</span><button type="button" aria-label="Dismiss tooltip" onClick={() => setSidebarHint(null)} className="ml-1 flex size-6 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><X className="size-3.5" /></button></motion.div></AnimatePresence>}

        <section className="min-w-0 space-y-3 xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:overflow-hidden">

          {workspaceTab === "ai" && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div><Badge variant="subtle">BLUEPRINT ARCHITECT</Badge><h1 className="mt-3 text-3xl font-semibold">Describe your community<span className="text-primary">.</span></h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Create an editable starter structure from your community brief.</p></div>
            <Card><CardContent className="space-y-4 p-5"><label htmlFor="architect-prompt" className="text-sm font-medium">What are you building?</label><textarea id="architect-prompt" value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} rows={4} maxLength={1000} placeholder="A gaming community with squad voice rooms, clips, rules and private moderator spaces…" className="w-full resize-y rounded-lg border border-input bg-background px-3 py-3 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring" /><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><span className="text-xs text-muted-foreground">{aiPrompt.length}/1000 · Curated blueprint matching</span><Button onClick={() => { const brief = aiPrompt.trim().toLowerCase(); if (!brief) { setNotice("Describe your community first."); return; } const target = /game|gaming|esport|squad|guild|raid/.test(brief) ? "gaming" : /study|student|class|learning|exam|focus/.test(brief) ? "study" : /creator|stream|artist|fan|content|audience/.test(brief) ? "creator" : "developer"; choosePreset(target); setWorkspaceTab("designer"); setNotice("Blueprint generated from your brief using a curated template. Customize it before export."); }}><WandSparkles className="size-4" /> Generate blueprint</Button></div></CardContent></Card>
            <p className="text-xs text-muted-foreground">Uses local rules and curated templates; no external AI model is connected.</p>
          </motion.div>}
          {workspaceTab === "templates" && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div><Badge variant="subtle">TEMPLATE LIBRARY</Badge><h1 className="mt-3 text-3xl font-semibold">A better starting point<span className="text-primary">.</span></h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Load a blueprint, then customize its categories, channels and access.</p></div>
          <div className="h-[calc(100dvh-250px)] min-h-[420px] overflow-y-auto overscroll-contain pr-1 pb-8 [scrollbar-width:thin]">
            <motion.div className="grid gap-4 pb-2 sm:grid-cols-2" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.085, delayChildren: 0.04 } } }}>
              {presets.map((preset, index) => {
                const Icon = preset.icon;
                const isSelected = selectedPreset === preset.id;
                return <motion.div key={preset.id} variants={{ hidden: { opacity: 0, y: 18, scale: 0.985 }, visible: { opacity: 1, y: 0, scale: 1 } }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }} whileHover={{ y: -3, transition: { duration: 0.18 } }} className="h-full">
                  <Card className={isSelected ? "group relative h-full overflow-hidden border border-primary/45 bg-card shadow-[0_0_0_1px_rgba(234,191,36,0.07)]" : "group relative h-full overflow-hidden border border-border/80 bg-card/80 transition-colors duration-300 hover:border-primary/30 hover:bg-card"}>
                    <div className={isSelected ? "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" : "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"} />
                    <CardContent className="flex h-full min-h-[214px] flex-col p-5">
                      <div className="flex items-start justify-between">
                        <span className={isSelected ? "flex size-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary" : "flex size-11 items-center justify-center rounded-xl border border-border/70 bg-secondary/80 text-primary transition-colors duration-300 group-hover:border-primary/25 group-hover:bg-primary/10"}><Icon className="size-[19px]" /></span>
                        <Badge variant="outline" className="rounded-md border-border/80 bg-background/70 px-2 font-mono text-[10px] tracking-wide text-muted-foreground">{String(index + 1).padStart(2, "0")}</Badge>
                      </div>
                      <h2 className="mt-5 text-[15px] font-semibold tracking-tight">{preset.name}</h2>
                      <p className="mt-2 min-h-10 text-[13px] leading-5 text-muted-foreground">{preset.description}</p>
                      <div className="mt-auto pt-5">
                        <Button className="group/button h-10 w-full justify-between rounded-lg px-3.5 text-xs font-medium transition-all duration-200 hover:shadow-sm" variant={isSelected ? "default" : "outline"} onClick={() => { choosePreset(preset.id); setWorkspaceTab("designer"); }}><span>Use this template</span><ArrowRight className="size-3.5 transition-transform duration-200 group-hover/button:translate-x-0.5" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>;
              })}
            </motion.div>
          </div>
          </motion.div>}
          {workspaceTab === "designer" && <>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/90 p-2.5 shadow-sm shadow-black/10 backdrop-blur-sm">
            <input id="blueprint-import" type="file" accept=".json,application/json" className="hidden" onChange={(event) => { void importBlueprint(event.target.files?.[0]); event.target.value = ""; }} />
            <div className="flex flex-wrap items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-9 gap-2 border-border bg-background px-3 text-xs" onClick={() => document.getElementById("blueprint-import")?.click()}><Upload className="size-3.5" /> Import JSON</Button>
              <Button variant="outline" size="sm" className="h-9 gap-2 border-transparent bg-transparent px-3 text-xs shadow-none hover:border-border hover:bg-secondary" onClick={exportBlueprint}><Download className="size-3.5" /> Export JSON</Button>
              <Button variant="ghost" size="sm" className="h-9 gap-2 px-3 text-xs text-muted-foreground hover:text-destructive" onClick={() => setModal("reset")}><ArrowDown className="size-3.5" /> Reset</Button>
            </div>
            <Button size="sm" className="h-9 gap-2 rounded-sm px-4 text-xs font-semibold shadow-md shadow-primary/15 transition-all hover:-translate-y-px hover:shadow-primary/25" onClick={() => { setChannelDraft({ name: "new-channel", type: "text", categoryId: categories[0]?.id ?? "", isPrivate: false }); setModal("channel"); }}><Plus className="size-4" /> Add channel</Button>
          </div>

          <Card className="relative flex min-h-0 flex-1 flex-col overflow-hidden border-border/80">
            {isApplyingTemplate && <div aria-live="polite" aria-label="Applying template" className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-[2px]"><div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xl"><LoaderCircle className="size-4 animate-spin text-primary" /><span className="text-sm font-medium">Preparing your workspace…</span></div></div>}
            <div className="flex flex-col justify-between gap-3 border-b border-border bg-card/70 p-3 sm:flex-row sm:items-center sm:px-4">
              <div><div className="flex items-center gap-2 text-sm font-semibold"><span className="size-2 rounded-full bg-emerald-400" /> Live preview</div><div className="mt-1 text-xs text-muted-foreground">A preview of your Discord server structure</div></div>
              <div className="flex flex-wrap items-center gap-1.5"><span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1.5 text-[10px] text-muted-foreground"><LayoutGrid className="size-3" />{categories.length} categories</span><span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1.5 text-[10px] text-muted-foreground"><Hash className="size-3" />{channelCount} channels</span><span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1.5 text-[10px] text-muted-foreground"><AudioLines className="size-3" />{voiceCount} voice</span><div className="relative"><Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a channel..." className="h-8 w-full pl-8 text-xs sm:w-44" /></div><Button variant="outline" size="icon" className="size-8" aria-label="More preview options" onClick={() => setNotice("Preview options: drag-and-drop ordering is coming next.")}><MoreHorizontal className="size-4" /></Button></div>
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[176px_minmax(0,1fr)]">
              <div className="flex min-h-0 flex-col overflow-hidden border-b border-border bg-[var(--discord-sidebar)] p-3 md:border-b-0 md:border-r">
                <div className="mb-3 flex items-center gap-3 rounded-lg px-2 py-2"><div className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">{serverName.slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{serverName || "Your server"}</div><div className="mt-0.5 text-[10px] text-muted-foreground">Server preview</div></div><ChevronDown className="size-4 text-muted-foreground" /></div>
                <Separator className="mb-3" />
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain">
                  {categories.map((category) => {
                    const visibleChannels = category.channels.filter((channel) => channel.name.toLowerCase().includes(search.toLowerCase()));
                    if (search && visibleChannels.length === 0) return null;
                    return <div key={category.id}>
                      <div className="group mb-1 flex items-center justify-between px-1.5 text-[10px] font-bold tracking-[0.13em] text-[var(--discord-muted)]"><span className="flex items-center gap-1"><ChevronDown className="size-3" />{category.name}</span><Button variant="ghost" className="opacity-0 transition group-hover:opacity-100" onClick={() => { setCategoryDraft({ name: category.name, categoryId: category.id }); setModal("rename-category"); }} aria-label={`Rename ${category.name}`}><MoreHorizontal className="size-3.5" /></Button></div>
                      <div className="space-y-0.5">
                        {visibleChannels.map((channel) => {
                          const active = selectedChannel === channel.id;
                          return <Button variant="ghost" key={channel.id} onClick={() => setSelectedChannel(channel.id)} className={`group flex w-full items-center gap-2 rounded-md px-2 py-[7px] text-left text-[13px] transition ${active ? "bg-[var(--discord-active)] text-[var(--discord-text)]" : "text-[var(--discord-muted)] hover:bg-[var(--discord-hover)] hover:text-[var(--discord-text)]"}`}>
                            {channel.type === "text" ? <Hash className={`size-[17px] shrink-0 ${active ? "text-primary" : "text-[var(--discord-muted)]"}`} /> : <Volume2 className={`size-[16px] shrink-0 ${active ? "text-[#b8b2ff]" : "text-[#74788a]"}`} />}
                            <span className="min-w-0 flex-1 truncate">{channel.name}</span>{channel.locked && <LockKeyhole className="size-3 shrink-0 text-[#74788a]" />}{active && <span className="size-1.5 rounded-full bg-primary" />}
                          </Button>;
                        })}
                      </div>
                    </div>;
                  })}
                  <Button variant="ghost" onClick={() => { setCategoryDraft({ name: "NEW CATEGORY", categoryId: "" }); setModal("category"); }} className="flex items-center gap-2 px-1.5 pt-1 text-xs text-muted-foreground transition hover:text-foreground"><Plus className="size-3.5" /> Add category</Button>
                </div>
              </div>
              <div className="flex min-w-0 flex-col bg-[var(--discord-main)]">
                <div className="flex items-center gap-2.5 border-b border-border/80 px-3 py-2.5"><Hash className="size-4 text-primary" /><span className="text-sm font-semibold">{selected?.name ?? "Select a channel"}</span><Separator orientation="vertical" className="h-4" /><span className="truncate text-xs text-muted-foreground">{selected?.type === "voice" ? "Voice channel" : "Text channel"}</span><div className="ml-auto flex items-center gap-1"><Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Notifications" onClick={() => setNotice("Channel notification settings will be available in a future iteration.")}><Bell className="size-4" /></Button><Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Channel options" onClick={() => setNotice("Select a channel and edit its details in the inspector.")}><MoreHorizontal className="size-4" /></Button></div></div>
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.09] text-primary ">{selected?.type === "voice" ? <Volume2 className="size-7" /> : <Hash className="size-7" />}</div>
                  <Badge variant="outline" className="mb-3 border-border/80 text-muted-foreground">{selected?.type === "voice" ? "VOICE ROOM" : "TEXT CHANNEL"}</Badge>
                  <h2 className="text-xl font-semibold tracking-tight">{selected?.name ?? "Choose a channel"}</h2>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{selected?.type === "voice" ? "A place for members to talk, collaborate, or hang out together." : "This is where your community conversation will happen. Add a topic to tell members what belongs here."}</p>
                  {selected?.locked && <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-3 py-1.5 text-xs text-amber-700 dark:text-amber-700 dark:text-amber-200"><LockKeyhole className="size-3.5" /> Restricted channel</div>}
                  <div className="mt-8 flex flex-wrap justify-center gap-2"><Button variant="outline" size="sm" onClick={() => { setActiveTab("structure"); document.getElementById("inspector")?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }}><Settings2 className="size-3.5" /> Edit settings</Button><Button variant="ghost" size="sm" onClick={() => setNotice("Preview is illustrative; Discord publishing is not connected yet.")}><MessageCircle className="size-3.5" /> Preview details</Button></div>
                </div>
                <div className="border-t border-border/80 p-3"><div className="flex items-center gap-2 rounded-lg border border-[var(--discord-border)] bg-[var(--discord-message)] px-3 py-2.5 text-xs text-muted-foreground"><MessageCircle className="size-4" /><span>Messages will appear here once your server is live</span><span className="ml-auto text-[10px]">PREVIEW</span></div></div>
              </div>
            </div>
          </Card>
          {notice && <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-[120] flex w-[min(380px,calc(100vw-2rem))] items-start gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 text-sm text-foreground shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"><Check className="size-3.5" /></span><span className="min-w-0 flex-1 leading-relaxed">{notice}</span><Button variant="ghost" size="icon" className="-mr-1 -mt-1 size-7 shrink-0 text-muted-foreground" onClick={() => setNotice("")} aria-label="Dismiss notification"><X className="size-3.5" /></Button></div>}
          </>}

        </section>

        <aside id="inspector" className="min-w-0 space-y-2 overflow-y-auto overscroll-contain xl:sticky xl:top-0 xl:h-full xl:min-h-0 xl:self-start xl:pr-1">
          <div><div className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Inspector</div><h2 className="mt-1 text-base font-semibold tracking-tight">Configure blueprint</h2><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Server identity and channel settings.</p></div>
          <Card>
            <CardContent className="space-y-2.5 p-3">
              <div><label htmlFor="server-name" className="mb-2 block text-xs font-medium text-muted-foreground">Server name</label><Input id="server-name" value={serverName} onChange={(event) => setServerName(event.target.value)} className="h-9" /></div>
              <div><label className="mb-2 block text-xs font-medium text-muted-foreground">Server category</label><Select value={selectedPreset} onValueChange={choosePreset}><SelectTrigger aria-label="Server category"><SelectValue placeholder="Choose a category" /></SelectTrigger><SelectContent>{presets.map((preset) => <SelectItem key={preset.id} value={preset.id}>{preset.name}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="mb-2 block text-xs font-medium text-muted-foreground">Visibility</label><div className="grid grid-cols-2 gap-2"><Button type="button" variant="ghost" aria-pressed={visibility === "public"} onClick={() => { setVisibility("public"); setNotice("Blueprint visibility set to public."); }} className={`flex items-center justify-center gap-2 rounded-lg border px-2 py-2.5 text-xs font-medium ${visibility === "public" ? "border-primary/50 bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-secondary"}`}><MessageCircle className="size-3.5" /> Public</Button><Button type="button" variant="ghost" aria-pressed={visibility === "private"} onClick={() => { setVisibility("private"); setNotice("Blueprint visibility set to private."); }} className={`flex items-center justify-center gap-2 rounded-lg border px-2 py-2.5 text-xs font-medium ${visibility === "private" ? "border-primary/50 bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-secondary"}`}><LockKeyhole className="size-3.5" /> Private</Button></div><p className="mt-1.5 text-[11px] text-muted-foreground">{visibility === "public" ? "Anyone can discover this planned community." : "Plan this server as invite-only."}</p></div>
            </CardContent>
          </Card>

          <Card>
            <div className="flex border-b border-border px-2 pt-2"><Button variant="ghost" onClick={() => setActiveTab("structure")} className={`flex-1 border-b-2 px-3 py-2.5 text-xs font-medium transition ${activeTab === "structure" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Channel</Button><Button variant="ghost" onClick={() => setActiveTab("roles")} className={`flex-1 border-b-2 px-3 py-2.5 text-xs font-medium transition ${activeTab === "roles" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Roles & access</Button></div>
            <CardContent className="space-y-3 p-3">
              {activeTab === "structure" ? <>
                <div><label htmlFor="channel-name" className="mb-2 block text-xs font-medium text-muted-foreground">Channel name</label><Input id="channel-name" value={selected?.name ?? ""} disabled={!selected} onChange={(event) => renameSelected(event.target.value)} placeholder="Select a channel" className="h-9" /></div>
                <div><label className="mb-2 block text-xs font-medium text-muted-foreground">Channel type</label><div className="grid grid-cols-2 gap-2"><Button variant="ghost" disabled={!selected} onClick={() => setCategories((current) => current.map((category) => ({ ...category, channels: category.channels.map((channel) => channel.id === selectedChannel ? { ...channel, type: "text" } : channel) })))} className={`flex items-center justify-center gap-2 rounded-lg border px-2 py-2.5 text-xs transition disabled:opacity-40 ${selected?.type === "text" ? "border-primary/40 bg-primary/[0.08] text-foreground" : "border-border text-muted-foreground hover:bg-secondary"}`}><Hash className="size-3.5" /> Text</Button><Button variant="ghost" disabled={!selected} onClick={() => setCategories((current) => current.map((category) => ({ ...category, channels: category.channels.map((channel) => channel.id === selectedChannel ? { ...channel, type: "voice" } : channel) })))} className={`flex items-center justify-center gap-2 rounded-lg border px-2 py-2.5 text-xs transition disabled:opacity-40 ${selected?.type === "voice" ? "border-primary/40 bg-primary/[0.08] text-foreground" : "border-border text-muted-foreground hover:bg-secondary"}`}><Volume2 className="size-3.5" /> Voice</Button></div></div>
                <Separator />
                <div className="flex items-start justify-between gap-3"><div><div className="text-xs font-medium">Private channel</div><div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Limit visibility to selected roles.</div></div><Button variant="ghost" disabled={!selected} onClick={() => setCategories((current) => current.map((category) => ({ ...category, channels: category.channels.map((channel) => channel.id === selectedChannel ? { ...channel, locked: !channel.locked } : channel) })))} className={`relative mt-0.5 h-5 w-9 rounded-full transition disabled:opacity-40 ${selected?.locked ? "bg-primary" : "bg-secondary"}`} aria-label="Toggle private channel"><span className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${selected?.locked ? "left-[18px]" : "left-0.5"}`} /></Button></div>
                <Button variant="destructive" className="w-full" disabled={!selected} onClick={removeSelected}><X className="size-4" /> Remove channel</Button>
              </> : <>
                {roles.map((role) => <div key={role.id} className="rounded-lg border border-border bg-background p-3"><div className="flex items-center gap-2"><div className="flex size-8 items-center justify-center rounded-lg border border-border" style={{ color: role.color, backgroundColor: `${role.color}18` }}><ShieldCheck className="size-4" /></div><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{role.name}</div><div className="text-[11px] text-muted-foreground">{role.description}</div></div><Badge variant="outline">{role.permissions.length}</Badge></div>{!["owner", "moderator", "member"].includes(role.id) && <div className="mt-2 flex justify-end"><Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive" onClick={() => setRoles((current) => current.filter((item) => item.id !== role.id))}>Remove role</Button></div>}</div>)}
                <Button variant="outline" className="w-full" onClick={() => { setRoleDraft({ name: "", description: "", color: "#D9A441", permissions: ["View channels", "Send messages"] }); setModal("role"); }}><Plus className="size-4" /> Add role</Button>
              </>}
            </CardContent>
          </Card>
          
        </aside>
      </div>
      {showArchitectPromo && workspaceTab !== "ai" && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          <motion.aside initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} className="fixed bottom-5 right-5 z-[100] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary"><WandSparkles className="size-4" /></span>
              <Button variant="ghost" size="icon" className="size-7 -mr-1 -mt-1 text-muted-foreground" aria-label="Dismiss AI Architect tip" onClick={() => { setShowArchitectPromo(false); try { window.localStorage.setItem("serverly-os:architect-promo-seen:v1", "1"); } catch {} }}><X className="size-3.5" /></Button>
            </div>
            <h3 className="mt-3 text-sm font-semibold">Have an idea?</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Describe your community and let the Architect shape a tailored blueprint.</p>
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => { setShowArchitectPromo(false); try { window.localStorage.setItem("serverly-os:architect-promo-seen:v1", "1"); } catch {} setWorkspaceTab("ai"); setNotice(""); }}><Sparkles className="size-3.5" /> Try AI Architect <ArrowRight className="size-3.5" /></Button>
          </motion.aside>
        </AnimatePresence>,
        document.body
      )}
      <AnimatePresence>
        {modal && <motion.div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/55 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          <motion.div role="dialog" aria-modal="true" aria-labelledby="serverly-modal-title" className="my-auto w-full max-w-lg rounded-2xl border border-border bg-card text-card-foreground shadow-2xl" initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.18, ease: "easeOut" }}>
            <form onSubmit={(event) => { event.preventDefault(); if (modal === "channel") { const clean = channelDraft.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, ""); if (!clean || !channelDraft.categoryId) return; addChannel(channelDraft.type, clean, channelDraft.categoryId, channelDraft.isPrivate); } else if (modal === "role") { const clean = roleDraft.name.trim(); if (!clean) return; setRoles((current) => [...current, { id: `role-${Date.now()}`, name: clean, description: roleDraft.description.trim() || "Custom community role", color: roleDraft.color, permissions: roleDraft.permissions }]); setModal(null); setActiveTab("roles"); setNotice("Role added to this local blueprint."); } else if (modal === "category") { const clean = categoryDraft.name.trim(); if (!clean) return; setCategories((current) => [...current, { id: `category-${Date.now()}`, name: clean.toUpperCase(), channels: [] }]); setModal(null); setNotice("Category added."); } else if (modal === "rename-category") { const clean = categoryDraft.name.trim(); if (!clean) return; setCategories((current) => current.map((item) => item.id === categoryDraft.categoryId ? { ...item, name: clean.toUpperCase() } : item)); setModal(null); setNotice("Category renamed."); } else if (modal === "reset") { setCategories(starterCategories.map((category) => ({ ...category, channels: category.channels.map((channel) => ({ ...channel })) }))); setSelectedPreset("developer"); setServerName("Devspace"); setSelectedChannel("general"); setVisibility("public"); setRoles([{ id: "owner", name: "Owner", description: "Full server access", color: "#D9A441", permissions: ["Manage server", "Manage channels", "Manage roles", "View channels", "Send messages"] }, { id: "moderator", name: "Moderator", description: "Manage community", color: "#D9A441", permissions: ["Manage messages", "Kick members", "View channels", "Send messages"] }, { id: "member", name: "Member", description: "Standard access", color: "#D9A441", permissions: ["View channels", "Send messages"] }]); setModal(null); setNotice("Blueprint reset to Developer Hub."); } }}>
              <div className="flex items-start justify-between gap-4 border-b border-border p-5"><div><div className="text-xs font-semibold uppercase tracking-[.14em] text-primary">Serverly Studio</div><h2 id="serverly-modal-title" className="mt-1 text-lg font-semibold">{modal === "channel" ? "Add a channel" : modal === "role" ? "Create a role" : modal === "category" ? "Create a category" : modal === "reset" ? "Reset blueprint?" : "Rename category"}</h2><p className="mt-1 text-sm text-muted-foreground">{modal === "channel" ? "Choose the channel type, location, and visibility." : modal === "role" ? "Define a reusable role for your community blueprint." : modal === "reset" ? "This replaces your current structure with the starter Developer Hub template." : "Keep your server structure organized and easy to scan."}</p></div><Button type="button" variant="ghost" size="icon" aria-label="Close dialog" onClick={() => setModal(null)}><X className="size-4"/></Button></div>
              <div className="space-y-4 p-5">
                {modal === "reset" && <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">Your current categories, channels, role configuration, and visibility will be replaced. Export a JSON backup first if you want to keep them.</div>}
                {modal === "channel" && <><div><label htmlFor="new-channel-name" className="mb-1.5 block text-sm font-medium">Channel name</label><Input id="new-channel-name" autoFocus maxLength={80} required value={channelDraft.name} onChange={(event) => setChannelDraft((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. announcements"/></div><div><label className="mb-1.5 block text-sm font-medium">Channel type</label><Select value={channelDraft.type} onValueChange={(value) => setChannelDraft((current) => ({ ...current, type: value as ChannelType, name: value === "voice" ? "New voice room" : "new-channel" }))}><SelectTrigger aria-label="Channel type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="text">Text channel</SelectItem><SelectItem value="voice">Voice room</SelectItem></SelectContent></Select></div><div><label className="mb-1.5 block text-sm font-medium">Category</label><Select value={channelDraft.categoryId} onValueChange={(value) => setChannelDraft((current) => ({ ...current, categoryId: value }))}><SelectTrigger aria-label="Category"><SelectValue placeholder="Choose a category" /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select></div><label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm"><input type="checkbox" checked={channelDraft.isPrivate} onChange={(event) => setChannelDraft((current) => ({ ...current, isPrivate: event.target.checked }))} className="size-4 accent-[var(--primary)]"/> Make this channel private</label></>}
                {modal === "role" && <><div><label htmlFor="new-role-name" className="mb-1.5 block text-sm font-medium">Role name</label><Input id="new-role-name" autoFocus required maxLength={60} value={roleDraft.name} onChange={(event) => setRoleDraft((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Event Host"/></div><div><label htmlFor="new-role-description" className="mb-1.5 block text-sm font-medium">Description</label><Input id="new-role-description" maxLength={120} value={roleDraft.description} onChange={(event) => setRoleDraft((current) => ({ ...current, description: event.target.value }))} placeholder="What this role is for"/></div><div><label htmlFor="new-role-color" className="mb-1.5 block text-sm font-medium">Role color</label><div className="flex items-center gap-3"><input id="new-role-color" type="color" value={roleDraft.color} onChange={(event) => setRoleDraft((current) => ({ ...current, color: event.target.value }))} className="h-10 w-14 cursor-pointer rounded-md border border-border bg-background p-1"/><span className="text-sm text-muted-foreground">{roleDraft.color.toUpperCase()}</span></div></div><fieldset><legend className="mb-2 text-sm font-medium">Permissions</legend><div className="grid grid-cols-2 gap-2">{["View channels", "Send messages", "Manage messages", "Kick members", "Manage channels", "Manage roles"].map((permission) => <label key={permission} className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-xs"><input type="checkbox" checked={roleDraft.permissions.includes(permission)} onChange={(event) => setRoleDraft((current) => ({ ...current, permissions: event.target.checked ? [...current.permissions, permission] : current.permissions.filter((item) => item !== permission) }))} className="size-4 accent-[var(--primary)]"/>{permission}</label>)}</div></fieldset></>}
                {(modal === "category" || modal === "rename-category") && <div><label htmlFor="category-name" className="mb-1.5 block text-sm font-medium">Category name</label><Input id="category-name" autoFocus required maxLength={60} value={categoryDraft.name} onChange={(event) => setCategoryDraft((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. COMMUNITY"/></div>}
              </div>
              <div className="flex justify-end gap-2 border-t border-border p-5"><Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button><Button type="submit" variant={modal === "reset" ? "destructive" : "default"}>{modal === "channel" ? "Add channel" : modal === "role" ? "Create role" : modal === "category" ? "Create category" : modal === "reset" ? "Reset blueprint" : "Save changes"}</Button></div>
            </form>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </main>
  );
}


export default function StudioPage() {
  const [initialPreset, setInitialPreset] = useState("developer");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get("preset");
    if (preset && presets.some((item) => item.id === preset)) setInitialPreset(preset);
  }, []);
  return <Designer key={initialPreset} initialPreset={initialPreset} />;
}
