import { create } from "zustand";
import type { AgentId } from "./agents";

interface DashboardState {
  activeAgent: AgentId;
  setActiveAgent: (id: AgentId) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  agentStatuses: Record<AgentId, "idle" | "processing" | "complete" | "error">;
  setAgentStatus: (
    id: AgentId,
    status: "idle" | "processing" | "complete" | "error"
  ) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeAgent: "cross-matter",
  setActiveAgent: (id) => set({ activeAgent: id }),
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  agentStatuses: {
    "cross-matter": "idle",
    "expert-finder": "idle",
    "regulatory-radar": "idle",
    "cultural-bridge": "idle",
    "workload-optimizer": "idle",
  },
  setAgentStatus: (id, status) =>
    set((state) => ({
      agentStatuses: { ...state.agentStatuses, [id]: status },
    })),
}));
