import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { tokenizeText } from "@/lib/subtitle-processor";

function classifyError(message: string): "no_subtitles" | "disabled" | "network" | "unknown" {
  const m = message.toLowerCase();
  if (m.includes("transcript is disabled")) return "disabled";
  if (
    m.includes("no transcript") ||
    m.includes("could not retrieve a transcript") ||
    m.includes("impossible to retrieve") ||
    m.includes("not available") ||
    m.includes("transcripts are disabled") ||
    m.includes("could not find")
  ) {
    return "no_subtitles";
  }
  if (m.includes("fetch") || m.includes("network") || m.includes("timeout") || m.includes("econnrefused")) {
    return "network";
  }
  return "unknown";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;

  if (!videoId) {
    return NextResponse.json(
      { error: "Video ID is required" },
      { status: 400 }
    );
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({
        videoId,
        subtitles: [],
        totalCount: 0,
        reason: "no_subtitles",
        message: "该视频未提供字幕",
      });
    }

    const formattedSubtitles = transcript.map((item, index) => {
      const words = tokenizeText(item.text);
      return {
        id: index + 1,
        startTime: item.offset / 1000,
        endTime: (item.offset + item.duration) / 1000,
        originalText: item.text,
        translatedText: "",
        words,
      };
    });

    return NextResponse.json({
      videoId,
      subtitles: formattedSubtitles,
      totalCount: formattedSubtitles.length,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    const reason = classifyError(msg);

    // Treat "disabled" and "no_subtitles" as soft-failure: return 200 with empty
    // subtitles so the UI can show a friendly empty state.
    if (reason === "disabled" || reason === "no_subtitles") {
      return NextResponse.json({
        videoId,
        subtitles: [],
        totalCount: 0,
        reason,
        message: reason === "disabled" ? "该视频的字幕已被禁用" : "该视频未提供字幕",
      });
    }

    console.error("Error fetching subtitles:", error);
    return NextResponse.json(
      {
        videoId,
        subtitles: [],
        totalCount: 0,
        reason,
        error: "字幕加载失败",
        details: msg,
      },
      { status: reason === "network" ? 502 : 500 }
    );
  }
}
