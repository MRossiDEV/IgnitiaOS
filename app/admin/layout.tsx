"use client";

import { useState, useEffect, useRef } from "react";
import AIChatDrawer from "@/components/admin/ai/AIChatDrawer";
import ClubDrawer from "@/components/admin/club/ClubDrawer";
import { NavItem } from "@/components/ui/nav-item";
import BackgroundFX from "@/app/admin/agents/[id]/components/background-fx";
import {
  ChevronLeft,
  ChevronRight,
  Brain,
  Home,
  LineChart,
  Server,
  Globe,
  Users,
  Workflow,
  LayoutTemplate,
  Wallet,
  Settings,
  Search,
  Bell,
  CreditCard,
  Rocket,
  Target,
  Layers,
  Database,
  FileText,
  BottleWine,
  Link,
  Speakerphone,
  Megaphone,  
} from "lucide-react";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [clubOpen, setClubOpen] = useState(false);

  const [aiWidth, setAiWidth] = useState(400);
  const isResizing = useRef(false);

  function startResize() {
    isResizing.current = true;
    document.body.style.cursor = "ew-resize";
  }

  function stopResize() {
    isResizing.current = false;
    document.body.style.cursor = "default";
  }

  function onMouseMove(e: MouseEvent) {
    if (!isResizing.current) return;

    const newWidth = window.innerWidth - e.clientX;

    if (newWidth < 320) return setAiWidth(320);
    if (newWidth > 700) return setAiWidth(700);

    setAiWidth(newWidth);
  }

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopResize);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopResize);
    };
  }, []);

  return (
    <div className="admin-theme relative flex h-screen overflow-hidden bg-[#050505] text-white">
        <Toaster
          position="top-right"
          richColors
          expand
          closeButton
          duration={4000}
        />

      {/* Global Background FX */}
      <BackgroundFX />

      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,#2D6BFF22,transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#00D5FF11,transparent_35%)]" />


      {/* SIDEBAR */}
      <aside
        className={`
          relative z-10
          border-r border-white/10 bg-black
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? "w-16" : "w-64"}
        `}
        >
        {/* BRAND */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-3">
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-xl font-black tracking-wide">IGNITIAOS</h1>
              <p className="text-xs text-zinc-500">
                Revenue Execution System
              </p>
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hover:bg-white/10 p-2 rounded-lg transition"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        {/* NAV */}
        <div className="overflow-y-auto h-[calc(100vh-64px)] p-3 space-y-1">

          <NavItem collapsed={sidebarCollapsed} href="/admin/dashboard" icon={<Home size={18} />}>
            Command Center
          </NavItem>

          <NavItem collapsed={sidebarCollapsed} href="/admin/my-leads" icon={<Database size={18} />}>
            My Leads
          </NavItem>

          <NavItem collapsed={sidebarCollapsed} href="/admin/reports" icon={<FileText size={18} />}>
            Reports
          </NavItem>

          {/* <NavItem collapsed={sidebarCollapsed} href="/admin/opportunities" icon={<Target size={18} />}>
            Opportunities
          </NavItem> */}

          <NavItem collapsed={sidebarCollapsed} href="/admin/clients" icon={<Users size={18} />}>
            Clients
          </NavItem>

          <NavItem collapsed={sidebarCollapsed} href="/admin/leads" icon={<Database size={18} />}>
            Leads Engine
          </NavItem>
          
          {/* <NavItem collapsed={sidebarCollapsed} href="/admin/promptstack" icon={<Server  size={18} />}>
            PromptStack
          </NavItem> */}

          <NavItem collapsed={sidebarCollapsed} href="/admin/campaigns" icon={<Rocket size={18} />}>
            Campaigns
          </NavItem>

          {/* <NavItem collapsed={sidebarCollapsed} href="/admin/funnels" icon={<Layers size={18} />}>
            Funnels
          </NavItem> */}

          {/* <NavItem collapsed={sidebarCollapsed} href="/admin/landing-pages" icon={<Globe size={18} />}>
            Landing Pages
          </NavItem> */}

          <NavItem collapsed={sidebarCollapsed} href="/admin/agents" icon={<Brain size={18} />}>
            AI Agents
          </NavItem>

          {/* <NavItem collapsed={sidebarCollapsed} href="/admin/analytics" icon={<LineChart size={18} />}>
            Revenue Analytics
          </NavItem> */}

          <NavItem collapsed={sidebarCollapsed} href="/admin/revenue" icon={<Wallet size={18} />}>
            Revenue
          </NavItem>

          {/* <NavItem collapsed={sidebarCollapsed} href="/admin/users" icon={<Users size={18} />}>
            Users
          </NavItem> */}

          <NavItem collapsed={sidebarCollapsed} href="/admin/marketing" icon={<Megaphone size={18} />}>
            Marketing
          </NavItem>

          <NavItem collapsed={sidebarCollapsed} href="/admin/settings" icon={<Settings size={18} />}>
            System Settings
          </NavItem>

        </div>
      </aside>

      {/* MAIN */}
      <div className="relative z-10 flex flex-1 flex-col">

        {/* HEADER */}
        <header className="relative z-50 h-16 border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl">
          <div className="h-full px-4 flex items-center justify-between">

            {/* TITLE */}
            <div>
              <h2 className="font-bold text-white">IgnitiaOS</h2>
              <p className="text-xs text-zinc-500">
                Autonomous Revenue Generation Infrastructure
              </p>
            </div>

            {/* SEARCH */}
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-[360px]">
              <Search size={18} className="text-zinc-500" />
              <input
                placeholder="Search clients, campaigns, leads..."
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-4">

              <button
                onClick={() => setClubOpen((current) => !current)}
                className={`rounded-lg p-2 transition ${clubOpen ? "bg-white/10 text-cyan-300" : "hover:bg-white/10"}`}
                aria-label="Toggle The Club drawer"
              >
                <BottleWine size={20} />
              </button>

              <button className="hover:bg-white/10 p-2 rounded-lg transition">
                <Bell size={20} />
              </button>

              <div className="hidden md:flex items-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-3 py-2">
                <CreditCard size={16} />
                <span className="text-sm">Credits: 12,450</span>
              </div>

              {/* AI BUTTON */}
              <button
                onClick={() => setAiOpen(true)}
                className="flex items-center gap-2 bg-cyan-500 text-black px-3 py-2 rounded-xl font-semibold hover:bg-cyan-400 transition"
              >
                <Brain size={18} />
                AI Copilot
              </button>

              <div className="h-10 w-10 rounded-full bg-cyan-500 text-black flex items-center justify-center font-bold">
                M
              </div>
            </div>

          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-black to-[#050505]">
          {children}
        </main>
      </div>

      {/* BACKDROP */}
      {aiOpen && (
        <div
          onClick={() => {
            setAiOpen(false);
            setClubOpen(false);
          }}
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        />
      )}

      {clubOpen && (
        <div
          onClick={() => setClubOpen(false)}
          className="fixed inset-x-0 top-16 bottom-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      {aiOpen && (
        <div
          className={`
            fixed right-0 top-0 h-full
            bg-black border-l border-white/10
            z-50 flex
            transition-transform duration-300 ease-in-out
            ${aiOpen ? "translate-x-0" : "translate-x-full"}
          `}
          style={{ width: aiWidth }}
        >

          {/* RESIZE HANDLE */}
          <div
            onMouseDown={startResize}
            className="w-1 cursor-ew-resize bg-white/10 hover:bg-cyan-500 transition"
          />

          {/* CONTENT */}
          <div className="flex-1">
            <AIChatDrawer onClose={() => setAiOpen(false)} />
          </div>
        </div>
      )}

      {clubOpen && (
        <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-[760px] overflow-hidden border-l border-white/10 bg-black z-50">
          <ClubDrawer onClose={() => setClubOpen(false)} />
        </div>
      )}
    </div>
  );
}