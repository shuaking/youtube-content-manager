import { NextRequest, NextResponse } from "next/server";

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `You are Aria, a warm, concise English conversation partner helping Chinese-speaking learners practice English.

Rules:
- Respond primarily in English, at a level slightly above the user's apparent level.
- If the user writes in Chinese, understand it and reply in simple English. You may include a one-line Chinese translation for unusual vocabulary.
- Keep replies short (2-4 sentences) unless the user asks for more.
- Gently correct grammar mistakes by rephrasing in a natural way, without lecturing.
- Ask a short follow-up question to keep the conversation going.
- Never produce copyrighted long-form content like song lyrics or book passages.`;

function mockReply(lastUserText: string): string {
  const t = lastUserText.toLowerCase().trim();
  if (/^(hi|hello|hey|你好)/.test(t)) {
    return "Hi! 👋 Nice to hear from you. What would you like to talk about today?";
  }
  if (/(\?|吗|what|how|why|when|where|who)/i.test(t)) {
    return `Good question! Could you share a bit more context so I can give a more useful answer? For example, a specific example or situation.`;
  }
  return `Got it. Try adding one more detail — what happened next, or how did it feel? I'm listening.`;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const messages: IncomingMessage[] = Array.isArray(body.messages) ? body.messages : [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  if (!lastUser) {
    return NextResponse.json({ error: "no user message" }, { status: 400 });
  }

  // Fallback to mock if no API key
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({
      reply: mockReply(lastUser.content),
      model: "mock",
    });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-20).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(
        {
          reply: mockReply(lastUser.content),
          model: "mock",
          warning: `Anthropic API ${res.status}: ${errText.slice(0, 200)}`,
        },
        { status: 200 }
      );
    }

    const data = await res.json();
    const text =
      Array.isArray(data.content) && data.content[0]?.type === "text"
        ? data.content[0].text
        : "";
    return NextResponse.json({
      reply: text || mockReply(lastUser.content),
      model: data.model || MODEL,
    });
  } catch (err) {
    return NextResponse.json({
      reply: mockReply(lastUser.content),
      model: "mock",
      warning: err instanceof Error ? err.message : "fetch failed",
    });
  }
}
