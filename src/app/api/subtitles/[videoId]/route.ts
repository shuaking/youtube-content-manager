import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { tokenizeText } from "@/lib/subtitle-processor";

type ErrorKind = "no_subtitles" | "unavailable" | "network" | "unknown";

function classifyError(message: string): ErrorKind {
  const m = message.toLowerCase();
  // "Transcript is disabled" from youtube-transcript often fires when the
  // scrape path hits a consent wall or a player-config variant, not a real
  // server-side disable. Group it under "unavailable" with neutral wording.
  if (m.includes("transcript is disabled") || m.includes("transcripts are disabled")) {
    return "unavailable";
  }
  if (
    m.includes("no transcript") ||
    m.includes("could not retrieve a transcript") ||
    m.includes("impossible to retrieve") ||
    m.includes("not available") ||
    m.includes("could not find")
  ) {
    return "no_subtitles";
  }
  if (
    m.includes("fetch") ||
    m.includes("network") ||
    m.includes("timeout") ||
    m.includes("econnrefused") ||
    m.includes("etimedout")
  ) {
    return "network";
  }
  return "unknown";
}

const MESSAGES: Record<ErrorKind, string> = {
  no_subtitles: "该视频未提供字幕",
  unavailable:
    "字幕暂时无法获取（若视频在 YouTube 上实际有字幕，可能是服务端抓取受限，可稍后重试）",
  network: "网络错误，请检查连接后重试",
  unknown: "字幕加载失败",
};

const LANG_FALLBACKS = ["en", "en-US", "en-GB", "zh-CN", "zh-Hans", "ja", "ko", "es", "fr", "de"];

async function tryFetch(videoId: string) {
  let lastErr: unknown = null;
  // First attempt: no lang (library default, picks whatever is available)
  try {
    return await YoutubeTranscript.fetchTranscript(videoId);
  } catch (e) {
    lastErr = e;
  }
  // Retry with each common language code — youtube-transcript sometimes
  // succeeds with an explicit lang where the default fails.
  for (const lang of LANG_FALLBACKS) {
    try {
      return await YoutubeTranscript.fetchTranscript(videoId, { lang });
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
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
    const transcript = await tryFetch(videoId);

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({
        videoId,
        subtitles: [],
        totalCount: 0,
        reason: "no_subtitles",
        message: MESSAGES.no_subtitles,
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

    // Soft failures return 200 so the UI renders an empty-state card.
    if (reason === "no_subtitles" || reason === "unavailable") {
      return NextResponse.json({
        videoId,
        subtitles: [],
        totalCount: 0,
        reason,
        message: MESSAGES[reason],
        details: msg,
      });
    }

    console.error("Error fetching subtitles:", error);
    return NextResponse.json(
      {
        videoId,
        subtitles: [],
        totalCount: 0,
        reason,
        error: MESSAGES[reason],
        details: msg,
      },
      { status: reason === "network" ? 502 : 500 }
    );
  }
}
