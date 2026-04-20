import { NextRequest, NextResponse } from "next/server";

interface YouTubeSearchItem {
  id: { videoId?: string; channelId?: string };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    channelId: string;
    publishedAt: string;
    thumbnails: { default?: { url: string }; medium?: { url: string }; high?: { url: string } };
  };
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE = "https://www.googleapis.com/youtube/v3";

export async function GET(request: NextRequest) {
  if (!YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  if (!q || !q.trim()) {
    return NextResponse.json({ error: "q is required" }, { status: 400 });
  }

  const captionsOnly = searchParams.get("captionsOnly") === "1";
  const type = searchParams.get("type") === "channel" ? "channel" : "video";
  const maxResults = Math.min(25, parseInt(searchParams.get("maxResults") || "12", 10));

  try {
    const params = new URLSearchParams({
      key: YOUTUBE_API_KEY,
      part: "snippet",
      type,
      q: q.trim(),
      maxResults: String(maxResults),
    });
    if (type === "video" && captionsOnly) {
      params.set("videoCaption", "closedCaption");
    }

    const url = `${BASE}/search?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `YouTube API ${res.status}`, details: errText.slice(0, 300) },
        { status: 502 }
      );
    }
    const data = await res.json();
    const items: YouTubeSearchItem[] = data.items || [];
    const results = items.map((item) => ({
      kind: item.id.videoId ? "video" : "channel",
      id: item.id.videoId || item.id.channelId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      thumbnail:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url ||
        "",
    }));
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "search failed" },
      { status: 500 }
    );
  }
}
