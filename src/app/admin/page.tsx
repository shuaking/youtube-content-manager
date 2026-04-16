"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";

interface VideoPreview {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  channelName: string;
  views: string;
}

interface ChannelPreview {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  subscriberCount: string;
  videoCount: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"video" | "channel">("video");
  const [videoId, setVideoId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoPreview, setVideoPreview] = useState<VideoPreview | null>(null);
  const [channelPreview, setChannelPreview] = useState<ChannelPreview | null>(null);
  const [channelVideos, setChannelVideos] = useState<VideoPreview[]>([]);

  const extractVideoId = (input: string): string => {
    // Handle full YouTube URLs
    const urlPatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of urlPatterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }

    // If it's already just an ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input;
    }

    return input;
  };

  const extractChannelId = (input: string): string => {
    // Handle full YouTube channel URLs
    const match = input.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/);
    if (match) return match[1];

    // If it's already just an ID
    if (/^UC[a-zA-Z0-9_-]{22}$/.test(input)) {
      return input;
    }

    return input;
  };

  const fetchVideoDetails = async () => {
    setLoading(true);
    setError("");
    setVideoPreview(null);

    try {
      const id = extractVideoId(videoId);
      const response = await fetch(`/api/youtube/video/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch video");
      }

      const data = await response.json();
      setVideoPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelDetails = async () => {
    setLoading(true);
    setError("");
    setChannelPreview(null);
    setChannelVideos([]);

    try {
      const id = extractChannelId(channelId);

      // Fetch channel details
      const channelResponse = await fetch(`/api/youtube/channel/${id}`);
      if (!channelResponse.ok) {
        const errorData = await channelResponse.json();
        throw new Error(errorData.error || "Failed to fetch channel");
      }
      const channelData = await channelResponse.json();
      setChannelPreview(channelData);

      // Fetch channel videos
      const videosResponse = await fetch(`/api/youtube/channel/${id}/videos?maxResults=10`);
      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        setChannelVideos(videosData.videos);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const addVideoToCatalog = async () => {
    if (!videoPreview) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/catalog/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: videoPreview.id,
          language: "en",
          difficulty: "intermediate",
          topics: [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save video");
      }

      const data = await response.json();

      // 显示成功消息并询问是否跳转
      const shouldNavigate = window.confirm(
        `✅ 视频 "${videoPreview.title}" 已成功添加到目录！\n\n是否前往内容目录页面查看？`
      );

      if (shouldNavigate) {
        router.push("/catalog");
      } else {
        setVideoId("");
        setVideoPreview(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const addChannelToCatalog = async () => {
    if (!channelPreview) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/catalog/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: channelPreview.id,
          language: "en",
          platform: "youtube",
          topics: [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save channel");
      }

      const data = await response.json();

      // 显示成功消息并询问是否跳转
      const shouldNavigate = window.confirm(
        `✅ 频道 "${channelPreview.name}" 已成功添加到目录！\n\n是否前往内容目录页面查看？`
      );

      if (shouldNavigate) {
        router.push("/catalog");
      } else {
        setChannelId("");
        setChannelPreview(null);
        setChannelVideos([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      {/* Header */}
      <section className="w-full border-b border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-4xl leading-none">⚙️</span>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              内容管理
            </h1>
          </div>
          <p className="text-white/70">
            通过 YouTube API 自动获取视频和频道信息
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="w-full border-b border-white/10 py-6">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("video")}
              className={`rounded-lg px-6 py-3 font-semibold transition-all ${
                activeTab === "video"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              添加视频
            </button>
            <button
              onClick={() => setActiveTab("channel")}
              className={`rounded-lg px-6 py-3 font-semibold transition-all ${
                activeTab === "channel"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              添加频道
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="w-full py-12">
        <div className="mx-auto max-w-7xl px-6">
          {activeTab === "video" ? (
            <div className="space-y-6">
              {/* Video Input */}
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <h2 className="mb-4 text-xl font-bold text-white">输入视频信息</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/80">
                      YouTube 视频 ID 或 URL
                    </label>
                    <input
                      type="text"
                      placeholder="例如: dQw4w9WgXcQ 或 https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      value={videoId}
                      onChange={(e) => setVideoId(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-white placeholder-white/40 outline-none transition-all focus:border-white/20 focus:ring-2 focus:ring-secondary/50"
                    />
                  </div>
                  <button
                    onClick={fetchVideoDetails}
                    disabled={loading || !videoId}
                    className="rounded-xl bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? "获取中..." : "获取视频信息"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {/* Video Preview */}
              {videoPreview && (
                <div className="rounded-2xl border border-white/10 bg-card p-6">
                  <h2 className="mb-4 text-xl font-bold text-white">视频预览</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <img
                        src={videoPreview.thumbnail}
                        alt={videoPreview.title}
                        className="w-full rounded-xl"
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-white/60">标题</div>
                        <div className="font-semibold text-white">{videoPreview.title}</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60">频道</div>
                        <div className="text-white">{videoPreview.channelName}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-white/60">时长</div>
                          <div className="text-white">{videoPreview.duration}</div>
                        </div>
                        <div>
                          <div className="text-sm text-white/60">观看次数</div>
                          <div className="text-white">{videoPreview.views}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60">描述</div>
                        <div className="line-clamp-3 text-sm text-white/70">
                          {videoPreview.description}
                        </div>
                      </div>
                      <button
                        onClick={addVideoToCatalog}
                        className="w-full rounded-xl bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90"
                      >
                        添加到目录
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Channel Input */}
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <h2 className="mb-4 text-xl font-bold text-white">输入频道信息</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/80">
                      YouTube 频道 ID 或 URL
                    </label>
                    <input
                      type="text"
                      placeholder="例如: UCsooa4yRKGN_zEE8iknghZA 或 https://www.youtube.com/channel/UCsooa4yRKGN_zEE8iknghZA"
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-white placeholder-white/40 outline-none transition-all focus:border-white/20 focus:ring-2 focus:ring-secondary/50"
                    />
                  </div>
                  <button
                    onClick={fetchChannelDetails}
                    disabled={loading || !channelId}
                    className="rounded-xl bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? "获取中..." : "获取频道信息"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {/* Channel Preview */}
              {channelPreview && (
                <div className="rounded-2xl border border-white/10 bg-card p-6">
                  <h2 className="mb-4 text-xl font-bold text-white">频道预览</h2>
                  <div className="mb-6 flex items-start gap-6">
                    <img
                      src={channelPreview.thumbnail}
                      alt={channelPreview.name}
                      className="h-24 w-24 rounded-full"
                    />
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="text-sm text-white/60">频道名称</div>
                        <div className="text-xl font-bold text-white">{channelPreview.name}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-white/60">订阅者</div>
                          <div className="text-white">{channelPreview.subscriberCount}</div>
                        </div>
                        <div>
                          <div className="text-sm text-white/60">视频数量</div>
                          <div className="text-white">{channelPreview.videoCount}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60">描述</div>
                        <div className="line-clamp-2 text-sm text-white/70">
                          {channelPreview.description}
                        </div>
                      </div>
                      <button
                        onClick={addChannelToCatalog}
                        className="rounded-xl bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90"
                      >
                        添加到目录
                      </button>
                    </div>
                  </div>

                  {/* Channel Videos */}
                  {channelVideos.length > 0 && (
                    <div>
                      <h3 className="mb-4 text-lg font-bold text-white">
                        最近视频 ({channelVideos.length})
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {channelVideos.map((video) => (
                          <div
                            key={video.id}
                            className="flex gap-3 rounded-xl border border-white/10 bg-background p-3"
                          >
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="h-20 w-36 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="mb-1 line-clamp-2 text-sm font-semibold text-white">
                                {video.title}
                              </div>
                              <div className="text-xs text-white/60">
                                {video.duration} • {video.views}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
