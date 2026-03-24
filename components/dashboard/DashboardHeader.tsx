"use client";

import { Search, Bell, Settings } from "lucide-react";
import { useDashboardStore } from "@/lib/store";
import { AGENTS } from "@/lib/agents";

export function DashboardHeader() {
  const { activeAgent } = useDashboardStore();
  const agent = AGENTS[activeAgent];

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border-primary)] px-6 backdrop-blur-md" style={{ backgroundColor: "rgba(13, 13, 26, 0.6)" }}>
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Dashboard
        </h1>
        <span className="text-sm text-[var(--color-text-tertiary)]">/</span>
        <span
          className="text-sm font-medium"
          style={{ color: agent.color }}
        >
          {agent.name}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-input)] px-3 py-1.5">
          <Search className="h-4 w-4 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            placeholder="Search matters, experts, docs..."
            className="w-52 border-0 bg-transparent text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] outline-none"
          />
          <kbd className="rounded border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] px-1.5 py-0.5 font-[var(--font-mono)] text-[10px] text-[var(--color-text-tertiary)]">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-secondary)]">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-accent-rose)]" />
        </button>

        {/* Settings */}
        <button className="rounded-lg p-2 text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-secondary)]">
          <Settings className="h-4 w-4" />
        </button>

        {/* User avatar */}
        <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent-indigo)] to-[var(--color-accent-violet)] text-xs font-semibold text-white">
          JR
        </div>
      </div>
    </header>
  );
}
