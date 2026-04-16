import { NextRequest, NextResponse } from "next/server";
import { translateText } from "@/lib/subtitle-processor";

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang = "zh-CN" } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const translation = await translateText(text, targetLang);

    return NextResponse.json({
      original: text,
      translation,
      targetLang,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Failed to translate", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
