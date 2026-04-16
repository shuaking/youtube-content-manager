import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { tokenizeText } from "@/lib/subtitle-processor";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

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
    console.error("Error fetching subtitles:", error);
    return NextResponse.json(
      { error: "Failed to fetch subtitles", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
