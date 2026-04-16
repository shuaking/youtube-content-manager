import { NextRequest, NextResponse } from "next/server";
import { addVideo, getAllVideos, deleteVideo } from "@/lib/hybrid-data-store";
import { getVideoDetails } from "@/lib/youtube-api";
import { Video } from "@/types/catalog";

export async function GET() {
  try {
    const videos = await getAllVideos();
    return NextResponse.json({ videos, count: videos.length });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, language = "en", difficulty = "intermediate", topics = [] } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    // Fetch video details from YouTube API
    const youtubeData = await getVideoDetails(videoId);

    if (!youtubeData) {
      return NextResponse.json(
        { error: "Video not found on YouTube" },
        { status: 404 }
      );
    }

    // Convert YouTube data to our Video format
    const video: Video = {
      id: youtubeData.id,
      title: youtubeData.title,
      description: youtubeData.description,
      thumbnail: youtubeData.thumbnail,
      duration: youtubeData.duration,
      channelId: youtubeData.channelId,
      channelName: youtubeData.channelName,
      views: youtubeData.views,
      difficulty: difficulty as "beginner" | "intermediate" | "advanced",
      topics: topics.length > 0 ? topics : youtubeData.tags.slice(0, 5),
    };

    await addVideo(video);

    return NextResponse.json({
      success: true,
      video,
      message: "Video added successfully",
    });
  } catch (error) {
    console.error("Error adding video:", error);
    return NextResponse.json(
      {
        error: "Failed to add video",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("id");

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    await deleteVideo(videoId);

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
