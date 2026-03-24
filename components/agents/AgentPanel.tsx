"use client";

import { useDashboardStore } from "@/lib/store";
import { AGENTS, AGENT_IDS } from "@/lib/agents";
import { AgentChat } from "./AgentChat";
import { cn } from "@/lib/utils";

export function AgentPanel() {
  const { activeAgent, setActiveAgent, agentStatuses } = useDashboardStore();
  const agent = AGENTS[activeAgent];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Agent tab bar */}
      <div className="flex shrink-0 items-center gap-1 border-b border-[var(--color-border-primary)] px-4 backdrop-blur-sm" style={{ backgroundColor: "rgba(13, 13, 26, 0.4)" }}>
        {AGENT_IDS.map((id) => {
          const a = AGENTS[id];
          const isActive = activeAgent === id;
          const status = agentStatuses[id];

          return (
            <button
              key={id}
              onClick={() => setActiveAgent(id)}
              className={cn(
                "relative flex items-center gap-2 border-b-2 px-3 py-3 text-[12px] font-medium transition-all",
                isActive
                  ? "text-[var(--color-text-primary)]"
                  : "border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              )}
              style={
                isActive
                  ? { borderBottomColor: a.color, color: a.color }
                  : undefined
              }
            >
              {a.shortName}
              {status === "processing" && (
                <span
                  className="h-1.5 w-1.5 rounded-full status-pulse"
                  style={{ color: a.color, backgroundColor: a.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Agent description bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[var(--color-border-subtle)] px-5 py-3">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: agent.color }}
        />
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">
            {agent.name}
          </span>
          <span className="text-[11px] text-[var(--color-text-tertiary)]">
            {agent.description}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-full border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] px-2.5 py-0.5 font-[var(--font-mono)] text-[10px] text-[var(--color-text-tertiary)]">
            {agent.model}
          </span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden">
        <AgentChat key={activeAgent} agentId={activeAgent} />
      </div>
    </div>
  );
}
