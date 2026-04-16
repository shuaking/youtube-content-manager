import { NextRequest, NextResponse } from "next/server";
import { addChannel, getAllChannels, deleteChannel } from "@/lib/hybrid-data-store";
import { getChannelDetails } from "@/lib/youtube-api";
import { Channel } from "@/types/catalog";

export async function GET() {
  try {
    const channels = await getAllChannels();
    return NextResponse.json({ channels, count: channels.length });
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelId, language = "en", platform = "youtube", topics = [] } = body;

    if (!channelId) {
      return NextResponse.json(
        { error: "Channel ID is required" },
        { status: 400 }
      );
    }

    // Fetch channel details from YouTube API
    const youtubeData = await getChannelDetails(channelId);

    if (!youtubeData) {
      return NextResponse.json(
        { error: "Channel not found on YouTube" },
        { status: 404 }
      );
    }

    // Convert YouTube data to our Channel format
    const channel: Channel = {
      id: youtubeData.id,
      name: youtubeData.name,
      description: youtubeData.description,
      thumbnail: youtubeData.thumbnail,
      subscriberCount: youtubeData.subscriberCount,
      videoCount: youtubeData.videoCount,
      language,
      platform: platform as "youtube" | "netflix",
      topics: topics.length > 0 ? topics : [],
    };

    await addChannel(channel);

    return NextResponse.json({
      success: true,
      channel,
      message: "Channel added successfully",
    });
  } catch (error) {
    console.error("Error adding channel:", error);
    return NextResponse.json(
      {
        error: "Failed to add channel",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("id");

    if (!channelId) {
      return NextResponse.json(
        { error: "Channel ID is required" },
        { status: 400 }
      );
    }

    await deleteChannel(channelId);

    return NextResponse.json({
      success: true,
      message: "Channel deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting channel:", error);
    return NextResponse.json(
      { error: "Failed to delete channel" },
      { status: 500 }
    );
  }
}
