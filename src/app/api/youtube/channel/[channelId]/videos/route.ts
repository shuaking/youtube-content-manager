import { NextRequest, NextResponse } from "next/server";
import { getChannelVideos } from "@/lib/youtube-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params;
    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get("maxResults") || "10");

    if (!channelId) {
      return NextResponse.json(
        { error: "Channel ID is required" },
        { status: 400 }
      );
    }

    const videos = await getChannelVideos(channelId, maxResults);

    return NextResponse.json({
      channelId,
      videos,
      count: videos.length,
    });
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch channel videos",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
