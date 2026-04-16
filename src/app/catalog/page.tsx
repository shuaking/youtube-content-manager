"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchIcon } from "@/components/icons";
import { languages, Video, Channel } from "@/types/catalog";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";

export default function CatalogPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | "youtube" | "netflix">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"channels" | "videos">("videos");
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [vocabularyLevel, setVocabularyLevel] = useState<[number, number]>([0, 15]);
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 120]);
  const [sortBy, setSortBy] = useState<"date" | "views">("date");

  const [channels, setChannels] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [channelsRes, videosRes] = await Promise.all([
          fetch("/api/catalog/channels"),
          fetch("/api/catalog/videos"),
        ]);

        if (channelsRes.ok) {
          const channelsData = await channelsRes.json();
          setChannels(channelsData.channels || []);
        }

        if (videosRes.ok) {
          const videosData = await videosRes.json();
          setVideos(videosData.videos || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredChannels = channels.filter((channel) => {
    const matchesLanguage = channel.language === selectedLanguage;
    const matchesPlatform = selectedPlatform === "all" || channel.platform === selectedPlatform;
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         channel.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLanguage && matchesPlatform && matchesSearch;
  });

  const filteredVideos = videos.filter((video) => {
    const channel = channels.find((c) => c.id === video.channelId);

    // 如果频道不存在，假设它匹配当前语言（显示视频）
    const matchesLanguage = channel ? channel.language === selectedLanguage : true;
    const matchesPlatform = selectedPlatform === "all" || (channel ? channel.platform === selectedPlatform : true);
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = !selectedChannel || video.channelId === selectedChannel;

    // Duration filter (convert duration string to minutes)
    const durationInMinutes = parseDuration(video.duration);
    const matchesDuration = durationInMinutes >= durationRange[0] && durationInMinutes <= durationRange[1];

    return matchesLanguage && matchesPlatform && matchesSearch && matchesChannel && matchesDuration;
  });

  // Sort videos
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortBy === "views") {
      return parseViews(b.views) - parseViews(a.views);
    }
    return 0; // Default date sort (already in order)
  });

  const selectedChannelData = selectedChannel
    ? channels.find(c => c.id === selectedChannel)
    : null;

  // Helper function to parse duration string (e.g., "22:30" -> 22.5 minutes)
  function parseDuration(duration: string): number {
    const parts = duration.split(":");
    if (parts.length === 2) {
      return parseInt(parts[0]) + parseInt(parts[1]) / 60;
    }
    return 0;
  }

  // Helper function to parse views string (e.g., "1.2M" -> 1200000)
  function parseViews(views: string): number {
    const num = parseFloat(views);
    if (views.includes("M")) return num * 1000000;
    if (views.includes("K")) return num * 1000;
    return num;
  }

  // Format duration for slider label
  function formatDuration(minutes: number): string {
    if (minutes === 0) return "0分";
    if (minutes >= 60) return `${Math.floor(minutes / 60)}小时`;
    return `${Math.round(minutes)}分`;
  }

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      {/* Header */}
      <section className="w-full border-b border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-4xl leading-none">📺</span>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              内容目录
            </h1>
          </div>
          <p className="text-white/70">
            浏览精选的 YouTube 视频和 Netflix 内容，按语言和主题分类
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="w-full border-b border-white/10 py-6">
        <div className="mx-auto max-w-7xl px-6">
          {/* Language Selector */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-white/80">选择语言</h3>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all ${
                    selectedLanguage === lang.code
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Platform Filter */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-white/80">平台</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPlatform("all")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  selectedPlatform === "all"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                全部平台
              </button>
              <button
                onClick={() => setSelectedPlatform("youtube")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  selectedPlatform === "youtube"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                YouTube
              </button>
              <button
                onClick={() => setSelectedPlatform("netflix")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  selectedPlatform === "netflix"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                Netflix
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            {/* Vocabulary Level */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white/80">词汇水平</h3>
              <DualRangeSlider
                min={0}
                max={15}
                step={1}
                value={vocabularyLevel}
                onChange={setVocabularyLevel}
                formatLabel={(v) => `Level ${v}`}
              />
            </div>

            {/* Duration */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white/80">视频时长</h3>
              <DualRangeSlider
                min={0}
                max={120}
                step={5}
                value={durationRange}
                onChange={setDurationRange}
                formatLabel={formatDuration}
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="mb-4">
            <h3 className="mb-3 text-sm font-semibold text-white/80">排序方式</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy("date")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  sortBy === "date"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                按日期
              </button>
              <button
                onClick={() => setSortBy("views")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  sortBy === "views"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                按观看次数
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div>
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="搜索频道或视频..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-card py-3 pl-12 pr-4 text-white placeholder-white/40 outline-none transition-all focus:border-white/20 focus:ring-2 focus:ring-secondary/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid - Left-Right Split Layout */}
      <section className="w-full py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Left Sidebar - Channels */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <h2 className="mb-4 text-xl font-bold text-white">
                  频道 ({filteredChannels.length})
                </h2>
                <div className="space-y-2">
                  {/* All Channels Option */}
                  <button
                    onClick={() => setSelectedChannel(null)}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      !selectedChannel
                        ? "border-secondary bg-secondary/10"
                        : "border-white/10 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <div className="font-semibold text-white">所有频道</div>
                    <div className="text-xs text-white/60">
                      {videos.filter(v => {
                        const channel = channels.find(c => c.id === v.channelId);
                        return channel?.language === selectedLanguage;
                      }).length} 个视频
                    </div>
                  </button>

                  {/* Channel List */}
                  {filteredChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={`w-full rounded-lg border p-3 text-left transition-all ${
                        selectedChannel === channel.id
                          ? "border-secondary bg-secondary/10"
                          : "border-white/10 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className="mb-1 font-semibold text-white line-clamp-1">
                        {channel.name}
                      </div>
                      <div className="text-xs text-white/60">
                        {videos.filter(v => v.channelId === channel.id).length} 个视频
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - Videos */}
            <div className="lg:col-span-3">
              {/* Channel Details Panel */}
              {selectedChannelData && (
                <div className="mb-6 rounded-2xl border border-white/10 bg-card p-6">
                  <div className="mb-4 flex items-start gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={selectedChannelData.thumbnail}
                        alt={selectedChannelData.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="mb-2 text-2xl font-bold text-white">
                        {selectedChannelData.name}
                      </h2>
                      <div className="mb-2 flex items-center gap-4 text-sm text-white/60">
                        <span>{selectedChannelData.subscriberCount} 订阅者</span>
                        <span>•</span>
                        <span>{selectedChannelData.videoCount} 个视频</span>
                      </div>
                      <p className="text-sm leading-relaxed text-white/70">
                        {selectedChannelData.description}
                      </p>
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-2">
                    {selectedChannelData.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-lg bg-white/10 px-3 py-1 text-sm text-white/70"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos Grid */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  视频 ({sortedVideos.length})
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {sortedVideos.map((video) => {
                  const channel = channels.find((c) => c.id === video.channelId);
                  const platform = channel?.platform || "youtube";

                  return (
                    <div key={video.id} className="group relative">
                      <Link
                        href={`/catalog/${selectedLanguage}/${platform}/video/${video.id}`}
                        className="block"
                      >
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-card transition-all hover:border-white/20 hover:shadow-xl">
                          <div className="relative h-[180px] w-full bg-white/5">
                            <Image
                              src={video.thumbnail}
                              alt={video.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
                              {video.duration}
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="mb-2 line-clamp-2 text-base font-semibold text-white group-hover:text-secondary">
                              {video.title}
                            </h3>
                            <p className="mb-2 text-sm text-white/60">
                              {video.channelName}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-white/50">
                              <span>{video.views} 观看</span>
                              <span>•</span>
                              <span
                                className={`rounded px-2 py-0.5 ${
                                  video.difficulty === "beginner"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : video.difficulty === "intermediate"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {video.difficulty === "beginner" && "初级"}
                                {video.difficulty === "intermediate" && "中级"}
                                {video.difficulty === "advanced" && "高级"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                      {/* Play Button Overlay */}
                      <Link
                        href={`/player/${video.id}`}
                        className="absolute left-1/2 top-[90px] z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-secondary opacity-0 transition-all group-hover:opacity-100 hover:scale-110"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-6 w-6 text-secondary-foreground"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {sortedVideos.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-card p-12 text-center">
                  <p className="text-white/60">没有找到匹配的内容</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
