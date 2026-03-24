import { openai } from "@ai-sdk/openai";
import {
  streamText,
  type UIMessage,
  convertToModelMessages,
} from "ai";
import { AGENTS, type AgentId } from "@/lib/agents";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      "OPENAI_API_KEY is not set. Add it to .env.local",
      { status: 500 }
    );
  }

  try {
    const {
      messages,
      agentId,
    }: {
      messages: UIMessage[];
      agentId?: string;
    } = await req.json();

    const agent = AGENTS[(agentId || "cross-matter") as AgentId];
    if (!agent) {
      return new Response("Unknown agent: " + agentId, { status: 400 });
    }

    const result = streamText({
      model: openai(agent.model),
      system: agent.systemPrompt,
      // CRITICAL: Convert UIMessage[] to ModelMessage[] — required in AI SDK v6
      messages: await convertToModelMessages(messages),
      temperature: 0.7,
      maxTokens: 2048,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Internal server error";
    console.error("API route error:", msg);
    return new Response(msg, { status: 500 });
  }
}
