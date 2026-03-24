"use client";

import { Layers, Users, Shield, Globe, Clock } from "lucide-react";
import { RECENT_ACTIVITIES } from "@/lib/mock-data";
import { AGENTS } from "@/lib/agents";
import { useDashboardStore } from "@/lib/store";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  matter: Layers,
  expert: Users,
  regulatory: Shield,
  cultural: Globe,
  workload: Clock,
};

export function ActivityFeed() {
  const { setActiveAgent } = useDashboardStore();

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
          Recent Activity
        </span>
        <button className="text-[11px] text-[var(--color-accent-indigo-light)] hover:underline">
          View all
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {RECENT_ACTIVITIES.map((activity) => {
          const Icon = ICON_MAP[activity.type];
          const agent = AGENTS[activity.agent];

          return (
            <button
              key={activity.id}
              onClick={() => setActiveAgent(activity.agent)}
              className="group flex items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-[var(--color-bg-card-hover)]"
            >
              <div
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${agent.color}15` }}
              >
                {Icon && (
                  <Icon className="h-3.5 w-3.5" style={{ color: agent.color }} />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-[12px] leading-snug text-[var(--color-text-primary)] group-hover:text-white">
                  {activity.text}
                </p>
                <span className="text-[10px] text-[var(--color-text-tertiary)]">
                  {activity.time}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
