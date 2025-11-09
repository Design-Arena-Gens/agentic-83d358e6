import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  agentSystemPrompt,
  buildFallbackResponse,
  generationRequestSchema,
  modelName,
  parseOrFallback,
  type AgentResponse,
} from "@/lib/agent";

let client: OpenAI | null = null;

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
};

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const validated = generationRequestSchema.parse(raw);

    const fallback = buildFallbackResponse(validated);
    const openai = getClient();

    if (!openai) {
      return NextResponse.json(fallback);
    }

    const prompt = agentSystemPrompt(validated);

    const completion = await openai.responses.create({
      model: modelName,
      input: prompt,
      max_output_tokens: 1200,
      temperature: 0.7,
    });

    const outputText = completion.output_text;

    if (!outputText) {
      return NextResponse.json(fallback);
    }

    const parsed: AgentResponse = parseOrFallback(outputText, fallback);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("/api/generate error", error);
    return NextResponse.json(
      { error: "Unable to process generation request." },
      { status: 400 },
    );
  }
}
