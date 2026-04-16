import { NextRequest, NextResponse } from "next/server";
import { getChannelDetails } from "@/lib/youtube-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params;

    if (!channelId) {
      return NextResponse.json(
        { error: "Channel ID is required" },
        { status: 400 }
      );
    }

    const channelDetails = await getChannelDetails(channelId);

    if (!channelDetails) {
      return NextResponse.json(
        { error: "Channel not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(channelDetails);
  } catch (error) {
    console.error("Error fetching channel details:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch channel details",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
