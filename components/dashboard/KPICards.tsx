"use client";

import {
  Briefcase,
  Globe,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from "lucide-react";
import { DASHBOARD_STATS } from "@/lib/mock-data";

const CARDS = [
  {
    label: "Active Matters",
    value: DASHBOARD_STATS.activeMatters.toLocaleString(),
    trend: DASHBOARD_STATS.activeMattersTrend,
    icon: Briefcase,
    color: "#6366f1",
  },
  {
    label: "Cross-Border",
    value: DASHBOARD_STATS.crossBorderMatters.toLocaleString(),
    trend: DASHBOARD_STATS.crossBorderTrend,
    icon: Globe,
    color: "#22d3ee",
  },
  {
    label: "Lawyers Online",
    value: DASHBOARD_STATS.lawyersOnline.toLocaleString(),
    trend: DASHBOARD_STATS.lawyersTrend,
    icon: Users,
    color: "#34d399",
  },
  {
    label: "Avg. Response",
    value: DASHBOARD_STATS.avgResponseTime,
    trend: DASHBOARD_STATS.responseTrend,
    icon: Zap,
    color: "#fbbf24",
  },
];

export function KPICards() {
  return (
    <div className="stagger-children grid grid-cols-2 gap-3">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const isPositive = card.trend > 0;
        const isGoodTrend =
          card.label === "Avg. Response" ? !isPositive : isPositive;

        return (
          <div
            key={card.label}
            className="glass-card group rounded-xl p-4 transition-all duration-200 hover:border-[#4f46e54d]"
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <Icon
                  className="h-4 w-4"
                  style={{ color: card.color }}
                />
              </div>
              <div
                className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium"
                style={{
                  color: isGoodTrend
                    ? "var(--color-accent-emerald)"
                    : "var(--color-accent-rose)",
                  backgroundColor: isGoodTrend
                    ? "rgba(52, 211, 153, 0.1)"
                    : "rgba(251, 113, 133, 0.1)",
                }}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(card.trend)}%
              </div>
            </div>

            <div className="mt-3">
              <div className="font-[var(--font-mono)] text-xl font-semibold text-[var(--color-text-primary)]">
                {card.value}
              </div>
              <div className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
                {card.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
