"use client";

import {
  Layers,
  Users,
  Shield,
  Globe,
  Clock,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/lib/store";
import { AGENTS, AGENT_IDS } from "@/lib/agents";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Users,
  Shield,
  Globe,
  Clock,
};

const STATUS_COLORS: Record<string, string> = {
  idle: "bg-[var(--color-text-tertiary)]",
  processing: "bg-[var(--color-accent-cyan)] status-pulse",
  complete: "bg-[var(--color-accent-emerald)]",
  error: "bg-[var(--color-accent-rose)]",
};

export function Sidebar() {
  const {
    activeAgent,
    setActiveAgent,
    sidebarCollapsed,
    toggleSidebar,
    agentStatuses,
  } = useDashboardStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] transition-all duration-300",
        sidebarCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-[var(--color-border-primary)] px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-accent-indigo)] to-[var(--color-accent-cyan)]">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">
              Cross-Matter
            </span>
            <span className="text-[11px] font-medium text-[var(--color-accent-indigo-light)] leading-tight">
              Navigator
            </span>
          </div>
        )}
      </div>

      {/* Agent section label */}
      {!sidebarCollapsed && (
        <div className="px-5 pt-5 pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
            AI Agents
          </span>
        </div>
      )}

      {/* Agent nav items */}
      <nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
        {AGENT_IDS.map((id) => {
          const agent = AGENTS[id];
          const Icon = ICON_MAP[agent.icon];
          const isActive = activeAgent === id;
          const status = agentStatuses[id];

          return (
            <button
              key={id}
              onClick={() => setActiveAgent(id)}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200",
                isActive
                  ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
              )}
              style={
                isActive
                  ? {
                      boxShadow: `inset 3px 0 0 ${agent.color}, 0 0 20px ${agent.glowColor}`,
                    }
                  : undefined
              }
            >
              <div className="relative shrink-0">
                {Icon && (
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive
                        ? "text-current"
                        : "text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]"
                    )}
                    style={isActive ? { color: agent.color } : undefined}
                  />
                )}
                <span
                  className={cn(
                    "absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full",
                    STATUS_COLORS[status]
                  )}
                />
              </div>

              {!sidebarCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-[13px] font-medium">
                    {agent.shortName}
                  </span>
                  <span className="truncate text-[11px] text-[var(--color-text-tertiary)]">
                    {status === "processing"
                      ? "Processing..."
                      : agent.description.slice(0, 45) + "…"}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-[var(--color-border-primary)] p-3">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-secondary)]"
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
