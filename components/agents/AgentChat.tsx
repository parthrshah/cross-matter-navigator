"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { AGENTS, type AgentId } from "@/lib/agents";
import { useDashboardStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface AgentChatProps {
  agentId: AgentId;
}

/** Extract text from AI SDK v6 UIMessage parts */
function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (message.parts && Array.isArray(message.parts)) {
    return message.parts
      .filter((p) => p.type === "text" && typeof p.text === "string")
      .map((p) => p.text!)
      .join("");
  }
  return "";
}

function TypingIndicator({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      <div className="typing-dot h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <div className="typing-dot h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <div className="typing-dot h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* non-critical */ }
  };
  return (
    <button onClick={handleCopy} className="rounded p-1 text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-secondary)]">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function MessageContent({ content }: { content: string }) {
  if (!content) return null;
  const lines = content.split("\n");
  const renderInline = (text: string) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j} className="font-semibold text-[var(--color-text-primary)]">{part.slice(2, -2)}</strong>;
      }
      return <span key={j}>{part}</span>;
    });
  };
  return (
    <div className="space-y-2 text-[13px] leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <h4 key={i} className="mt-3 text-[13px] font-semibold text-[var(--color-text-primary)]">{renderInline(line.slice(4))}</h4>;
        if (line.startsWith("## ")) return <h3 key={i} className="mt-4 text-[14px] font-bold text-[var(--color-text-primary)]">{renderInline(line.slice(3))}</h3>;
        if (line.startsWith("# ")) return <h2 key={i} className="mt-4 text-[15px] font-bold text-[var(--color-text-primary)]">{renderInline(line.slice(2))}</h2>;
        if (line.startsWith("- ") || line.startsWith("• ")) return (
          <div key={i} className="flex gap-2 pl-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-text-tertiary)]" />
            <span className="text-[var(--color-text-secondary)]">{renderInline(line.slice(2))}</span>
          </div>
        );
        const numMatch = line.match(/^(\d+)\.\s(.+)/);
        if (numMatch) return (
          <div key={i} className="flex gap-2 pl-2">
            <span className="shrink-0 font-[var(--font-mono)] text-[11px] text-[var(--color-text-tertiary)]">{numMatch[1]}.</span>
            <span className="text-[var(--color-text-secondary)]">{renderInline(numMatch[2])}</span>
          </div>
        );
        if (line.trim() === "---") return <hr key={i} className="my-3 border-[var(--color-border-primary)]" />;
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i} className="text-[var(--color-text-secondary)]">{renderInline(line)}</p>;
      })}
    </div>
  );
}

export function AgentChat({ agentId }: AgentChatProps) {
  const agent = AGENTS[agentId];
  const setAgentStatus = useDashboardStore((s) => s.setAgentStatus);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // AI SDK v6: DefaultChatTransport sends agentId in body alongside messages
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { agentId } }),
    [agentId]
  );

  // AI SDK v6: useChat returns sendMessage, status, messages (with .parts)
  const { messages, sendMessage, status } = useChat({
    transport,
    onError: (err: Error) => {
      setAgentStatus(agentId, "error");
      const msg = err?.message || "";
      setErrorMsg(
        msg.includes("API key") || msg.includes("401") || msg.includes("OPENAI_API_KEY")
          ? "OpenAI API key is missing or invalid. Add OPENAI_API_KEY to .env.local"
          : msg || "Something went wrong. Please try again."
      );
      setTimeout(() => setAgentStatus(agentId, "idle"), 5000);
    },
  });

  // AI SDK v6: status is 'ready' | 'submitted' | 'streaming' | 'error'
  const isActive = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (isActive) { setErrorMsg(null); setAgentStatus(agentId, "processing"); }
    else if (status === "ready" && messages.length > 0) {
      setAgentStatus(agentId, "complete");
      const t = setTimeout(() => setAgentStatus(agentId, "idle"), 3000);
      return () => clearTimeout(t);
    }
  }, [status, messages.length, agentId, setAgentStatus, isActive]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, status]);

  useEffect(() => { inputRef.current?.focus(); }, [agentId]);
  useEffect(() => { if (!input && inputRef.current) inputRef.current.style.height = "44px"; }, [input]);

  const doSend = (text: string) => {
    if (!text.trim() || isActive) return;
    setErrorMsg(null);
    // AI SDK v6: sendMessage({ text }) — not append({ role, content })
    sendMessage({ text: text.trim() });
    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: `linear-gradient(135deg, ${agent.color}20, ${agent.color}08)`, border: `1px solid ${agent.color}30` }}>
              <Sparkles className="h-8 w-8" style={{ color: agent.color }} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">{agent.name}</h3>
            <p className="mb-8 max-w-md text-center text-sm text-[var(--color-text-tertiary)]">{agent.description}</p>
            <div className="grid w-full max-w-lg grid-cols-1 gap-2">
              {agent.suggestedQueries.map((q, i) => (
                <button key={i} onClick={() => doSend(q)} className="group flex items-center gap-3 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-3.5 text-left transition-all hover:border-[#4f46e566] hover:bg-[var(--color-bg-card-hover)]">
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: agent.color }} />
                  <span className="text-[12.5px] leading-snug text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">{q}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* AI SDK v6: messages have .parts with {type:'text', text:'...'} */}
            {messages.map((message) => {
              const isUser = message.role === "user";
              const text = getMessageText(message);
              return (
                <div key={message.id} className={cn("animate-fade-in flex gap-3", isUser ? "justify-end" : "justify-start")}>
                  {!isUser && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: `linear-gradient(135deg, ${agent.color}30, ${agent.color}10)` }}>
                      <Sparkles className="h-3.5 w-3.5" style={{ color: agent.color }} />
                    </div>
                  )}
                  <div className={cn("group relative max-w-[85%] rounded-xl px-4 py-3 border", !isUser && "bg-[var(--color-bg-card)] border-[var(--color-border-primary)]")} style={isUser ? { backgroundColor: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.2)" } : undefined}>
                    {text ? <MessageContent content={text} /> : !isUser ? <TypingIndicator color={agent.color} /> : null}
                    {!isUser && text && (
                      <div className="absolute -bottom-1 right-2 translate-y-full opacity-0 transition-opacity group-hover:opacity-100">
                        <CopyButton text={text} />
                      </div>
                    )}
                  </div>
                  {isUser && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(99,102,241,0.15)" }}>
                      <User className="h-3.5 w-3.5 text-[var(--color-accent-indigo-light)]" />
                    </div>
                  )}
                </div>
              );
            })}
            {isActive && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3">
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: `linear-gradient(135deg, ${agent.color}30, ${agent.color}10)` }}>
                  <Sparkles className="h-3.5 w-3.5" style={{ color: agent.color }} />
                </div>
                <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] px-4 py-3">
                  <TypingIndicator color={agent.color} />
                </div>
              </div>
            )}
            {errorMsg && (
              <div className="animate-fade-in flex gap-3">
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(251,113,133,0.1)" }}>
                  <AlertCircle className="h-3.5 w-3.5 text-[var(--color-accent-rose)]" />
                </div>
                <div className="rounded-xl border px-4 py-3" style={{ backgroundColor: "rgba(251,113,133,0.06)", borderColor: "rgba(251,113,133,0.2)" }}>
                  <p className="text-[13px] text-[var(--color-accent-rose)]">{errorMsg}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[var(--color-border-primary)] p-4 backdrop-blur-sm" style={{ backgroundColor: "rgba(13,13,26,0.4)" }}>
        <form onSubmit={(e) => { e.preventDefault(); doSend(input); }} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(input); } }}
            placeholder={`Ask ${agent.shortName} agent...`}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-input)] px-4 py-3 text-[13px] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] outline-none transition-colors focus:border-[var(--color-border-active)]"
            style={{ minHeight: 44, maxHeight: 120 }}
            onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "44px"; t.style.height = Math.min(t.scrollHeight, 120) + "px"; }}
          />
          <button type="submit" disabled={isActive || !input.trim()} className={cn("flex h-[44px] w-[44px] items-center justify-center rounded-xl transition-all", input.trim() && !isActive ? "text-white" : "border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] text-[var(--color-text-tertiary)]")} style={input.trim() && !isActive ? { backgroundColor: agent.color, boxShadow: `0 0 20px ${agent.glowColor}` } : undefined}>
            <Send className="h-4 w-4" />
          </button>
        </form>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-[var(--color-text-tertiary)]">Powered by OpenAI {agent.model} · Shift+Enter for new line</span>
          <span className="text-[10px] text-[var(--color-text-tertiary)]">{messages.length} messages</span>
        </div>
      </div>
    </div>
  );
}
