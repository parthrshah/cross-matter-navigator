# Cross-Matter Navigator

**AI-powered knowledge and collaboration hub for Dentons — delivering seamless cross-border legal services across 80+ countries.**

Built for: Dentons Leadership Pitch  
Stack: Next.js 15 · OpenAI GPT-4o · Vercel AI SDK · Tailwind CSS 4 · Zustand

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────┐
│                   Client (Next.js)                   │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Sidebar  │  │ Overview │  │   Agent Panel     │  │
│  │ (Nav)    │  │ (KPIs,   │  │   (Chat UI +     │  │
│  │          │  │  Globe,  │  │    Streaming)     │  │
│  │          │  │  Feed)   │  │                   │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│                       │                │             │
│              Zustand Store        useChat() ×5       │
│                                       │             │
├───────────────────────────────────────┼─────────────┤
│              Next.js API Routes       │             │
│                                       │             │
│  /api/agents/[agentId]/route.ts       │             │
│  ┌────────────────────────────────────┘             │
│  │  Orchestrator Pattern                             │
│  │  ┌──────────┬──────────┬──────────┬──────────┐   │
│  │  │Cross-    │Expert    │Regulatory│Cultural  │   │
│  │  │Matter    │Finder    │Radar     │Bridge    │   │
│  │  │(GPT-4o)  │(GPT-4o-  │(GPT-4o)  │(GPT-4o-  │  │
│  │  │          │mini)     │          │mini)     │   │
│  │  └──────────┴──────────┴──────────┴──────────┘   │
│  │  ┌──────────┐                                    │
│  │  │Workload  │                                    │
│  │  │Optimizer │                                    │
│  │  │(GPT-4o-  │                                    │
│  │  │mini)     │                                    │
│  │  └──────────┘                                    │
├─────────────────────────────────────────────────────┤
│                   OpenAI API                         │
│            (Streaming via AI SDK)                    │
└─────────────────────────────────────────────────────┘
```

### The 5 AI Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| **Cross-Matter Intelligence** | GPT-4o | Connects insights across the global matter portfolio — finds precedents, patterns, and reuse opportunities |
| **Expert Finder** | GPT-4o-mini | Discovers the right lawyers across 80+ offices based on expertise, track record, and availability |
| **Regulatory Radar** | GPT-4o | Monitors regulatory changes across jurisdictions and maps impact to active matters |
| **Cultural Bridge** | GPT-4o-mini | Provides cultural intelligence for cross-border collaborations and client relationships |
| **Workload Optimizer** | GPT-4o-mini | Coordinates time-zone handoffs, follow-the-sun workflows, and staffing optimization |

### Design Decisions

- **Orchestrator Pattern**: Central API route dynamically loads the right agent config based on `[agentId]` — adding new agents requires only a new entry in `lib/agents.ts`
- **Model Routing**: GPT-4o for complex reasoning (Cross-Matter, Regulatory), GPT-4o-mini for structured tasks (Expert Finder, Cultural Bridge, Workload) — 10-20× cost savings on simpler agents
- **Streaming**: Vercel AI SDK's `streamText` → Server-Sent Events for real-time token-by-token output
- **State**: Zustand for lightweight global state (active agent, statuses). Each agent chat uses independent `useChat()` instances
- **Dark Mode**: Navy-black base with indigo/cyan accents — optimized for conference room presentations

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- OpenAI API key with GPT-4o access

### Installation

```bash
# Clone and enter the project
cd cross-matter-navigator

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your OpenAI API key

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — the dashboard loads immediately.

---

## 🌐 Deploy to Vercel

### One-Click Deploy

1. Push the repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Add environment variable: `OPENAI_API_KEY` = your key
5. Deploy

### Manual Deploy via CLI

```bash
# Install Vercel CLI
pnpm i -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

### Vercel Configuration

**Required Settings:**
- Framework Preset: Next.js
- Build Command: `pnpm build` (auto-detected)
- Output Directory: `.next` (auto-detected)
- Node.js Version: 20.x

**Environment Variables:**
- `OPENAI_API_KEY` — Mark as **Sensitive** in Vercel dashboard (prevents decryption after creation)
- Never use `NEXT_PUBLIC_` prefix for API keys

**Function Duration:**
- Default 60s is sufficient for streaming responses
- For Vercel Pro: can extend to 300s via `export const maxDuration = 300` in route files

---

## 📁 Project Structure

```
cross-matter-navigator/
├── app/
│   ├── api/
│   │   └── agents/
│   │       └── [agentId]/
│   │           └── route.ts      # Dynamic API route for all 5 agents
│   ├── globals.css               # Dark theme design system + animations
│   ├── layout.tsx                # Root layout with fonts
│   └── page.tsx                  # Dashboard entry point
├── components/
│   ├── agents/
│   │   ├── AgentPanel.tsx        # Agent tab bar + description + chat wrapper
│   │   └── AgentChat.tsx         # Streaming chat UI with markdown rendering
│   └── dashboard/
│       ├── Dashboard.tsx         # Main 3-column layout
│       ├── Sidebar.tsx           # Agent navigation with status indicators
│       ├── DashboardHeader.tsx   # Top bar with search + user
│       ├── KPICards.tsx          # 4 key metric cards with trends
│       ├── GlobeVisualization.tsx # Animated SVG globe with office connections
│       └── ActivityFeed.tsx      # Recent cross-border activity stream
├── lib/
│   ├── agents.ts                 # Agent configs, system prompts, models
│   ├── mock-data.ts              # Dashboard KPIs, office locations, activities
│   ├── store.ts                  # Zustand state management
│   └── utils.ts                  # Utility functions
├── .env.example                  # Environment variable template
├── package.json
├── tsconfig.json
├── next.config.js
└── postcss.config.js
```

---

## 🎯 Key Use Case: 12-Hour Cross-Border Deal Closing

**Scenario:** A multinational client needs urgent legal advice across Japan, Germany, Brazil, and Australia before a deal closes in 12 hours.

**How the Navigator responds:**

1. **Cross-Matter Intelligence** → Instantly retrieves similar past deals, winning clauses, and risk patterns
2. **Expert Finder** → Identifies the top lawyers in each jurisdiction with relevant experience and current availability  
3. **Regulatory Radar** → Flags jurisdiction-specific regulatory requirements and deadlines
4. **Cultural Bridge** → Provides collaboration protocols for the 4-culture team
5. **Workload Optimizer** → Designs a follow-the-sun handoff schedule spanning all 4 time zones

**Result:** One coordinated response. Globally consistent. Locally informed. Delivered in hours, not days.

---

## 💰 Cost Model

| Component | Cost |
|-----------|------|
| GPT-4o agents (Cross-Matter, Regulatory) | ~$0.01-0.03 per query |
| GPT-4o-mini agents (Expert, Cultural, Workload) | ~$0.001-0.003 per query |
| Vercel Pro hosting | $20/month |
| Estimated 1,000 queries/day | ~$15-25/day total |

Model routing saves 60-80% vs. running all agents on GPT-4o.

---

## 🔒 Security Considerations (Production)

- API keys stored as Vercel Sensitive Environment Variables
- All AI calls server-side only (never exposed to browser)
- Agent responses are streaming but processed server-side
- For production: add ethical-wall compliance, matter-level access controls, and audit logging
- Consider Azure OpenAI Service for enterprise compliance requirements

---

## 📄 License

Proprietary — Built for Dentons leadership pitch demonstration.
