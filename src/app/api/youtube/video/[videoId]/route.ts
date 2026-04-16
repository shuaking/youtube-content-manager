import { NextRequest, NextResponse } from "next/server";
import { getVideoDetails } from "@/lib/youtube-api";

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

    const videoDetails = await getVideoDetails(videoId);

    if (!videoDetails) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(videoDetails);
  } catch (error) {
    console.error("Error fetching video details:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch video details",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
