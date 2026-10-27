"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown, ArrowLeft, ArrowRight, AudioLines, Bell, Check, ChevronDown, ChevronRight,
  CircleHelp, Code2, Command, Copy, Crown, Gamepad2, Hash, LayoutGrid, LockKeyhole,
  MessageCircle, MoreHorizontal, Plus, Search, Settings2, ShieldCheck, Sparkles, WandSparkles,
  Volume2, X, Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type ChannelType = "text" | "voice";
type Channel = { id: string; name: string; type: ChannelType; locked?: boolean };
type Category = { id: string; name: string; channels: Channel[] };

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
];

export default function Home() {
  const [selectedPreset, setSelectedPreset] = useState("developer");
  const [categories, setCategories] = useState<Category[]>(starterCategories);
  const [selectedChannel, setSelectedChannel] = useState("general");
  const [serverName, setServerName] = useState("Devspace");
  const [search, setSearch] = useState("");
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState<"structure" | "roles">("structure");

  const activePreset = presets.find((preset) => preset.id === selectedPreset) ?? presets[0];
  const selected = useMemo(
    () => categories.flatMap((category) => category.channels).find((channel) => channel.id === selectedChannel),
    [categories, selectedChannel]
  );

  function choosePreset(id: string) {
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
    } else {
      setCategories(starterCategories);
    }
    setSelectedChannel("general");
    setNotice(preset ? `${preset.name} template loaded` : "Template loaded");
  }

  function addChannel(type: ChannelType) {
    const id = `${type}-${Date.now()}`;
    setCategories((current) => {
      const next = [...current];
      if (next.length === 0) next.push({ id: "new-category", name: "NEW CATEGORY", channels: [] });
      next[0] = { ...next[0], channels: [...next[0].channels, { id, name: type === "text" ? "new-channel" : "New voice room", type }] };
      return next;
    });
    setSelectedChannel(id);
    setShowCreateMenu(false);
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
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-border bg-[#0b0c10]/95 px-5 backdrop-blur-xl lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-[0_0_28px_#8b7cff40]"><LayoutGrid className="size-5" /></div>
          <div className="leading-tight"><div className="text-[15px] font-semibold tracking-tight">serverly <span className="text-primary">OS</span></div><div className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Community architect</div></div>
          <Separator orientation="vertical" className="mx-3 hidden h-7 md:block" />
          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex"><span>Workspace</span><ChevronRight className="size-3.5" /><span className="text-foreground">Untitled server</span></div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden text-muted-foreground sm:inline-flex" aria-label="Help"><CircleHelp /></Button>
          <Button variant="outline" className="hidden sm:inline-flex" onClick={() => { setNotice("Blueprint saved locally for this preview"); }}><Check className="size-4" /> Save draft</Button>
          <Button onClick={() => setNotice("Discord integration is coming next — this preview does not publish yet.")}><Zap className="size-4" /> <span className="hidden sm:inline">Deploy server</span><span className="sm:hidden">Deploy</span></Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-5 p-4 md:p-6 xl:grid-cols-[250px_minmax(0,1fr)_292px] xl:gap-6 xl:p-8">
        <aside className="space-y-5">
          <div className="flex items-center justify-between"><div className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Workspace</div><Button variant="ghost" size="icon" className="size-7 text-muted-foreground" aria-label="Workspace settings"><Settings2 className="size-4" /></Button></div>
          <nav className="space-y-1">
            <button className="flex w-full items-center gap-3 rounded-lg bg-accent px-3 py-2.5 text-left text-sm font-medium text-accent-foreground"><LayoutGrid className="size-4 text-primary" /> Server designer <Badge variant="subtle" className="ml-auto">MVP</Badge></button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"><Sparkles className="size-4" /> AI architect</button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"><LayoutGrid className="size-4" /> Template library</button>
          </nav>
          <Separator />
          <div className="flex items-center justify-between"><div className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Templates</div><span className="text-xs text-muted-foreground">04</span></div>
          <div className="space-y-2">
            {presets.map((preset) => {
              const Icon = preset.icon;
              const isActive = selectedPreset === preset.id;
              return <button key={preset.id} onClick={() => choosePreset(preset.id)} className={`group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${isActive ? "border-primary/50 bg-primary/[0.08] shadow-[0_0_0_1px_#8b7cff10]" : "border-transparent hover:border-border hover:bg-card"}`}>
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground group-hover:text-foreground"}`}><Icon className="size-4" /></div>
                <div className="min-w-0 flex-1"><div className={`text-sm font-medium ${isActive ? "text-foreground" : "text-secondary-foreground"}`}>{preset.name}</div><div className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{preset.description}</div></div>
                {isActive && <Check className="mt-1 size-3.5 shrink-0 text-primary" />}
              </button>;
            })}
          </div>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.12] to-transparent">
            <CardContent className="p-4">
              <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary"><WandSparkles className="size-4" /></div>
              <div className="text-sm font-semibold">Have an idea?</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Describe your community and let AI draft the perfect structure.</p>
              <Button variant="outline" size="sm" className="mt-3 w-full border-primary/25 bg-background/40" onClick={() => setNotice("AI architect is planned for the next build phase.")}>Try AI architect <ArrowRight className="size-3.5" /></Button>
            </CardContent>
          </Card>
        </aside>

        <section className="min-w-0 space-y-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><div className="mb-2 flex items-center gap-2"><Badge variant="subtle"><span className="mr-1.5 inline-block size-1.5 rounded-full bg-primary" /> DESIGN MODE</Badge><span className="text-xs text-muted-foreground">Last edited just now</span></div><h1 className="text-2xl font-semibold tracking-tight sm:text-[30px]">Design your server<span className="text-primary">.</span></h1><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">Shape every channel, room, and category before your community goes live.</p></div>
            <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => { setCategories(starterCategories); setSelectedPreset("developer"); setServerName("Devspace"); setNotice("Blueprint reset to Developer Hub"); }}><ArrowDown className="size-3.5" /> Reset</Button><Button size="sm" onClick={() => setShowCreateMenu((show) => !show)}><Plus className="size-4" /> Add channel</Button></div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[{ label: "Categories", value: categories.length.toString(), icon: LayoutGrid }, { label: "Channels", value: channelCount.toString(), icon: Hash }, { label: "Voice rooms", value: voiceCount.toString(), icon: AudioLines }].map((metric) => {
              const Icon = metric.icon;
              return <Card key={metric.label} className="border-border/80 bg-card/70"><CardContent className="flex items-center gap-3 p-3.5 sm:p-4"><div className="hidden size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground sm:flex"><Icon className="size-4" /></div><div><div className="text-xl font-semibold tracking-tight">{metric.value}</div><div className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">{metric.label}</div></div></CardContent></Card>;
            })}
          </div>

          {showCreateMenu && <Card className="border-primary/30"><CardContent className="flex flex-wrap items-center justify-between gap-3 p-3"><div><div className="text-sm font-medium">Add a channel</div><div className="text-xs text-muted-foreground">Choose the channel type to add to the first category.</div></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => addChannel("text")}><Hash className="size-4" /> Text channel</Button><Button variant="outline" size="sm" onClick={() => addChannel("voice")}><Volume2 className="size-4" /> Voice channel</Button><Button variant="ghost" size="icon" onClick={() => setShowCreateMenu(false)} aria-label="Close"><X className="size-4" /></Button></div></CardContent></Card>}

          <Card className="overflow-hidden border-border/80">
            <div className="flex flex-col justify-between gap-3 border-b border-border bg-card/70 p-4 sm:flex-row sm:items-center sm:px-5">
              <div><div className="flex items-center gap-2 text-sm font-semibold"><span className="size-2 rounded-full bg-emerald-400" /> Live preview</div><div className="mt-1 text-xs text-muted-foreground">A preview of your Discord server structure</div></div>
              <div className="flex items-center gap-2"><div className="relative"><Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a channel..." className="h-8 w-full pl-8 text-xs sm:w-44" /></div><Button variant="outline" size="icon" className="size-8" aria-label="More preview options" onClick={() => setNotice("Preview options: drag-and-drop ordering is coming next.")}><MoreHorizontal className="size-4" /></Button></div>
            </div>
            <div className="grid min-h-[540px] grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="border-b border-border bg-[#101117] p-3 md:border-b-0 md:border-r">
                <div className="mb-3 flex items-center gap-3 rounded-lg px-2 py-2"><div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#5142c7] text-sm font-bold text-white">{serverName.slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{serverName || "Your server"}</div><div className="mt-0.5 text-[10px] text-muted-foreground">Server preview</div></div><ChevronDown className="size-4 text-muted-foreground" /></div>
                <Separator className="mb-3" />
                <div className="space-y-4">
                  {categories.map((category) => {
                    const visibleChannels = category.channels.filter((channel) => channel.name.toLowerCase().includes(search.toLowerCase()));
                    if (search && visibleChannels.length === 0) return null;
                    return <div key={category.id}>
                      <div className="group mb-1 flex items-center justify-between px-1.5 text-[10px] font-bold tracking-[0.13em] text-[#85889a]"><span className="flex items-center gap-1"><ChevronDown className="size-3" />{category.name}</span><button className="opacity-0 transition group-hover:opacity-100" onClick={() => { const newName = prompt("Rename category", category.name); if (newName?.trim()) setCategories((current) => current.map((item) => item.id === category.id ? { ...item, name: newName.trim().toUpperCase() } : item)); }} aria-label={`Rename ${category.name}`}><MoreHorizontal className="size-3.5" /></button></div>
                      <div className="space-y-0.5">
                        {visibleChannels.map((channel) => {
                          const active = selectedChannel === channel.id;
                          return <button key={channel.id} onClick={() => setSelectedChannel(channel.id)} className={`group flex w-full items-center gap-2 rounded-md px-2 py-[7px] text-left text-[13px] transition ${active ? "bg-[#2b2d3a] text-white" : "text-[#9295a6] hover:bg-[#1c1e27] hover:text-[#e5e6ec]"}`}>
                            {channel.type === "text" ? <Hash className={`size-[17px] shrink-0 ${active ? "text-[#b8b2ff]" : "text-[#74788a]"}`} /> : <Volume2 className={`size-[16px] shrink-0 ${active ? "text-[#b8b2ff]" : "text-[#74788a]"}`} />}
                            <span className="min-w-0 flex-1 truncate">{channel.name}</span>{channel.locked && <LockKeyhole className="size-3 shrink-0 text-[#74788a]" />}{active && <span className="size-1.5 rounded-full bg-primary" />}
                          </button>;
                        })}
                      </div>
                    </div>;
                  })}
                  <button onClick={() => { const name = prompt("New category name", "NEW CATEGORY"); if (name?.trim()) setCategories((current) => [...current, { id: `category-${Date.now()}`, name: name.trim().toUpperCase(), channels: [] }]); }} className="flex items-center gap-2 px-1.5 pt-1 text-xs text-muted-foreground transition hover:text-foreground"><Plus className="size-3.5" /> Add category</button>
                </div>
                <div className="mt-6 rounded-lg border border-dashed border-border p-3"><div className="flex items-center gap-2 text-xs font-medium"><ShieldCheck className="size-3.5 text-emerald-400" /> Structure looks good</div><p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">Your blueprint is ready for permission checks before deployment.</p></div>
              </div>
              <div className="flex min-w-0 flex-col bg-[#14151c]">
                <div className="flex items-center gap-3 border-b border-border/80 px-4 py-3"><Hash className="size-4 text-[#8b7cff]" /><span className="text-sm font-semibold">{selected?.name ?? "Select a channel"}</span><Separator orientation="vertical" className="h-4" /><span className="truncate text-xs text-muted-foreground">{selected?.type === "voice" ? "Voice channel" : "Text channel"}</span><div className="ml-auto flex items-center gap-1"><Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Notifications" onClick={() => setNotice("Channel notification settings will be available in a future iteration.")}><Bell className="size-4" /></Button><Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Channel options" onClick={() => setNotice("Select a channel and edit its details in the inspector.")}><MoreHorizontal className="size-4" /></Button></div></div>
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.09] text-primary shadow-[0_0_45px_#8b7cff12]">{selected?.type === "voice" ? <Volume2 className="size-7" /> : <Hash className="size-7" />}</div>
                  <Badge variant="outline" className="mb-3 border-border/80 text-muted-foreground">{selected?.type === "voice" ? "VOICE ROOM" : "TEXT CHANNEL"}</Badge>
                  <h2 className="text-xl font-semibold tracking-tight">{selected?.name ?? "Choose a channel"}</h2>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{selected?.type === "voice" ? "A place for members to talk, collaborate, or hang out together." : "This is where your community conversation will happen. Add a topic to tell members what belongs here."}</p>
                  {selected?.locked && <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-3 py-1.5 text-xs text-amber-200"><LockKeyhole className="size-3.5" /> Restricted channel</div>}
                  <div className="mt-8 flex flex-wrap justify-center gap-2"><Button variant="outline" size="sm" onClick={() => { setActiveTab("structure"); document.getElementById("inspector")?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }}><Settings2 className="size-3.5" /> Edit settings</Button><Button variant="ghost" size="sm" onClick={() => setNotice("Preview is illustrative; Discord publishing is not connected yet.")}><MessageCircle className="size-3.5" /> Preview details</Button></div>
                </div>
                <div className="border-t border-border/80 p-3"><div className="flex items-center gap-2 rounded-lg border border-border/80 bg-[#0f1015] px-3 py-2.5 text-xs text-muted-foreground"><MessageCircle className="size-4" /><span>Messages will appear here once your server is live</span><span className="ml-auto text-[10px]">PREVIEW</span></div></div>
              </div>
            </div>
          </Card>
          {notice && <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/[0.07] px-4 py-3 text-sm text-primary"><span className="flex items-center gap-2"><Check className="size-4 shrink-0" />{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss notification"><X className="size-4" /></button></div>}
        </section>

        <aside id="inspector" className="space-y-4">
          <div><div className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Inspector</div><h2 className="mt-2 text-lg font-semibold tracking-tight">Configure blueprint</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Tune your server identity and selected channel.</p></div>
          <Card>
            <CardContent className="space-y-4 p-4">
              <div><label htmlFor="server-name" className="mb-2 block text-xs font-medium text-muted-foreground">Server name</label><Input id="server-name" value={serverName} onChange={(event) => setServerName(event.target.value)} className="h-9" /></div>
              <div><label className="mb-2 block text-xs font-medium text-muted-foreground">Server category</label><div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm"><activePreset.icon className="size-4 text-primary" />{activePreset.name}<ChevronDown className="ml-auto size-4 text-muted-foreground" /></div></div>
              <div><label className="mb-2 block text-xs font-medium text-muted-foreground">Visibility</label><div className="grid grid-cols-2 gap-2"><button onClick={() => setNotice("Public visibility selected for this blueprint.")} className="flex items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/[0.08] px-2 py-2.5 text-xs font-medium"><MessageCircle className="size-3.5 text-primary" /> Public</button><button onClick={() => setNotice("Private visibility selected for this blueprint.")} className="flex items-center justify-center gap-2 rounded-lg border border-border px-2 py-2.5 text-xs text-muted-foreground hover:bg-secondary"><LockKeyhole className="size-3.5" /> Private</button></div></div>
            </CardContent>
          </Card>

          <Card>
            <div className="flex border-b border-border px-2 pt-2"><button onClick={() => setActiveTab("structure")} className={`flex-1 border-b-2 px-3 py-2.5 text-xs font-medium transition ${activeTab === "structure" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Channel</button><button onClick={() => setActiveTab("roles")} className={`flex-1 border-b-2 px-3 py-2.5 text-xs font-medium transition ${activeTab === "roles" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Roles & access</button></div>
            <CardContent className="space-y-4 p-4">
              {activeTab === "structure" ? <>
                <div><label htmlFor="channel-name" className="mb-2 block text-xs font-medium text-muted-foreground">Channel name</label><Input id="channel-name" value={selected?.name ?? ""} disabled={!selected} onChange={(event) => renameSelected(event.target.value)} placeholder="Select a channel" className="h-9" /></div>
                <div><label className="mb-2 block text-xs font-medium text-muted-foreground">Channel type</label><div className="grid grid-cols-2 gap-2"><button disabled={!selected} onClick={() => setCategories((current) => current.map((category) => ({ ...category, channels: category.channels.map((channel) => channel.id === selectedChannel ? { ...channel, type: "text" } : channel) })))} className={`flex items-center justify-center gap-2 rounded-lg border px-2 py-2.5 text-xs transition disabled:opacity-40 ${selected?.type === "text" ? "border-primary/40 bg-primary/[0.08] text-foreground" : "border-border text-muted-foreground hover:bg-secondary"}`}><Hash className="size-3.5" /> Text</button><button disabled={!selected} onClick={() => setCategories((current) => current.map((category) => ({ ...category, channels: category.channels.map((channel) => channel.id === selectedChannel ? { ...channel, type: "voice" } : channel) })))} className={`flex items-center justify-center gap-2 rounded-lg border px-2 py-2.5 text-xs transition disabled:opacity-40 ${selected?.type === "voice" ? "border-primary/40 bg-primary/[0.08] text-foreground" : "border-border text-muted-foreground hover:bg-secondary"}`}><Volume2 className="size-3.5" /> Voice</button></div></div>
                <Separator />
                <div className="flex items-start justify-between gap-3"><div><div className="text-xs font-medium">Private channel</div><div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Limit visibility to selected roles.</div></div><button disabled={!selected} onClick={() => setCategories((current) => current.map((category) => ({ ...category, channels: category.channels.map((channel) => channel.id === selectedChannel ? { ...channel, locked: !channel.locked } : channel) })))} className={`relative mt-0.5 h-5 w-9 rounded-full transition disabled:opacity-40 ${selected?.locked ? "bg-primary" : "bg-secondary"}`} aria-label="Toggle private channel"><span className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${selected?.locked ? "left-[18px]" : "left-0.5"}`} /></button></div>
                <Button variant="destructive" className="w-full" disabled={!selected} onClick={removeSelected}><X className="size-4" /> Remove channel</Button>
              </> : <>
                <div className="rounded-lg border border-border bg-background p-3"><div className="flex items-center gap-2"><div className="flex size-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300"><Crown className="size-4" /></div><div><div className="text-sm font-medium">Owner</div><div className="text-[11px] text-muted-foreground">Full server access</div></div><Badge variant="outline" className="ml-auto">1</Badge></div></div>
                <div className="rounded-lg border border-border bg-background p-3"><div className="flex items-center gap-2"><div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><ShieldCheck className="size-4" /></div><div><div className="text-sm font-medium">Moderator</div><div className="text-[11px] text-muted-foreground">Manage community</div></div><Badge variant="outline" className="ml-auto">3</Badge></div></div>
                <div className="rounded-lg border border-border bg-background p-3"><div className="flex items-center gap-2"><div className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300"><MessageCircle className="size-4" /></div><div><div className="text-sm font-medium">Member</div><div className="text-[11px] text-muted-foreground">Standard access</div></div><Badge variant="outline" className="ml-auto">∞</Badge></div></div>
                <Button variant="outline" className="w-full" onClick={() => setNotice("Role editor is planned next. These are illustrative roles only.")}><Plus className="size-4" /> Add role</Button>
              </>}
            </CardContent>
          </Card>
          <Card className="border-border/80 bg-card/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="size-4 text-emerald-400" /> Pre-deployment checks</div>
              <div className="mt-3 space-y-2.5 text-xs"><div className="flex items-center gap-2 text-muted-foreground"><Check className="size-3.5 text-emerald-400" /> Channel structure <span className="ml-auto text-emerald-300">Ready</span></div><div className="flex items-center gap-2 text-muted-foreground"><ArrowRight className="size-3.5 text-amber-300" /> Permissions audit <span className="ml-auto text-amber-200">Pending</span></div><div className="flex items-center gap-2 text-muted-foreground"><ArrowRight className="size-3.5 text-amber-300" /> Discord connection <span className="ml-auto text-amber-200">Not linked</span></div></div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-center gap-2 py-1 text-[10px] text-muted-foreground"><Command className="size-3" /> Built for communities, by Serverly OS</div>
        </aside>
      </div>
    </main>
  );
}