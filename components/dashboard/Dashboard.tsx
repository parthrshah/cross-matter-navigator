"use client";

import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { KPICards } from "./KPICards";
import { GlobeVisualization } from "./GlobeVisualization";
import { AgentPanel } from "../agents/AgentPanel";
import { ActivityFeed } from "./ActivityFeed";
import { useDashboardStore } from "@/lib/store";

export function Dashboard() {
  const { sidebarCollapsed } = useDashboardStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-bg-primary)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div
        className="flex flex-1 flex-col overflow-hidden transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
      >
        <DashboardHeader />

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Overview panel */}
          <div className="flex w-[420px] shrink-0 flex-col gap-4 overflow-y-auto p-5 border-r border-[var(--color-border-primary)]">
            <KPICards />
            <GlobeVisualization />
            <ActivityFeed />
          </div>

          {/* Right: Agent interaction panel */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <AgentPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
