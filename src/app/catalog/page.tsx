"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchIcon } from "@/components/icons";
import { languages, Video, Channel } from "@/types/catalog";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";

type CatalogTab =
  | "youtube"
  | "netflix"
  | "books"
  | "fsi-dli"
  | "media"
  | "podcasts"
  | "mytext"
  | "resources";

const catalogTabs: { id: CatalogTab; label: string; icon: string; badge?: string }[] = [
  { id: "youtube", label: "YouTube", icon: "📺" },
  { id: "netflix", label: "Netflix", icon: "🎬" },
  { id: "books", label: "图书", icon: "📚" },
  { id: "fsi-dli", label: "FSI/DLI", icon: "🎓" },
  { id: "media", label: "媒体文件", icon: "📁", badge: "NEW" },
  { id: "podcasts", label: "播客", icon: "🎧" },
  { id: "mytext", label: "我的文本", icon: "📝" },
  { id: "resources", label: "学习资源", icon: "🔗" },
];

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<CatalogTab>("youtube");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 120]);
  const [sortBy, setSortBy] = useState<"date" | "views">("date");

  const [channels, setChannels] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchData = async () => {
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
      } catch {
        // Silent fail — UI shows empty state
      }
    };

    fetchData();
  }, []);

  const isVideoTab = activeTab === "youtube" || activeTab === "netflix";

  const filteredChannels = channels.filter((channel) => {
    const matchesLanguage = channel.language === selectedLanguage;
    const matchesPlatform = channel.platform === activeTab;
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         channel.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLanguage && matchesPlatform && matchesSearch;
  });

  const filteredVideos = videos.filter((video) => {
    const channel = channels.find((c) => c.id === video.channelId);

    const matchesLanguage = channel ? channel.language === selectedLanguage : true;
    const matchesPlatform = channel ? channel.platform === activeTab : activeTab === "youtube";
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = !selectedChannel || video.channelId === selectedChannel;

    const durationInMinutes = parseDuration(video.duration);
    const matchesDuration = durationInMinutes >= durationRange[0] && durationInMinutes <= durationRange[1];

    return matchesLanguage && matchesPlatform && matchesSearch && matchesChannel && matchesDuration;
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortBy === "views") {
      return parseViews(b.views) - parseViews(a.views);
    }
    return 0;
  });

  const selectedChannelData = selectedChannel
    ? channels.find(c => c.id === selectedChannel)
    : null;

  function parseDuration(duration: string): number {
    const parts = duration.split(":");
    if (parts.length === 2) {
      return parseInt(parts[0]) + parseInt(parts[1]) / 60;
    }
    return 0;
  }

  function parseViews(views: string): number {
    const num = parseFloat(views);
    if (views.includes("M")) return num * 1000000;
    if (views.includes("K")) return num * 1000;
    return num;
  }

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
              媒体内容
            </h1>
          </div>
          <p className="text-white/70">
            浏览 YouTube、Netflix、图书、播客、FSI/DLI 等多源学习内容
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="w-full border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {catalogTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedChannel(null);
                }}
                className={`relative flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-secondary text-secondary-foreground"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* YouTube / Netflix: full content grid */}
      {isVideoTab && (
        <>
          <section className="w-full border-b border-white/10 py-6">
            <div className="mx-auto max-w-7xl px-6">
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

              <div className="mb-6">
                <div className="max-w-md">
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

          <section className="w-full py-12">
            <div className="mx-auto max-w-7xl px-6">
              <div className="grid gap-6 lg:grid-cols-4">
                <div className="lg:col-span-1">
                  <div className="sticky top-20">
                    <h2 className="mb-4 text-xl font-bold text-white">
                      频道 ({filteredChannels.length})
                    </h2>
                    <div className="space-y-2">
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
                            return channel?.language === selectedLanguage && channel?.platform === activeTab;
                          }).length} 个视频
                        </div>
                      </button>

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

                <div className="lg:col-span-3">
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

                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                      视频 ({sortedVideos.length})
                    </h2>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {sortedVideos.map((video) => {
                      const channel = channels.find((c) => c.id === video.channelId);
                      const platform = channel?.platform || activeTab;

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
        </>
      )}

      {/* Placeholder tabs */}
      {activeTab === "books" && <PlaceholderTab icon="📚" title="图书" description="将任何网页或电子书导入到 Language Reactor，配合文字转语音功能学习。" hint="即将推出：上传 EPUB / PDF，支持 TTS 朗读和逐词翻译。" />}
      {activeTab === "fsi-dli" && <PlaceholderTab icon="🎓" title="FSI/DLI 课程" description="美国外交学院（FSI）和国防语言学院（DLI）的经典语言课程。" hint="即将推出：经过验证的政府级语言培训教材，循序渐进的系统化口语练习。" />}
      {activeTab === "media" && <PlaceholderTab icon="📁" title="媒体文件" description="上传本地视频、音频或字幕文件，在线学习。" hint="即将推出：支持 MP4 / MKV / SRT / VTT 上传，同步双语字幕。" badge="NEW" />}
      {activeTab === "podcasts" && <PlaceholderTab icon="🎧" title="播客" description="精选的母语播客节目，按难度和主题分类。" hint="即将推出：订阅 RSS 源，自动生成字幕，配合词典学习。" />}
      {activeTab === "mytext" && (
        <section className="w-full py-12">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mb-6 rounded-2xl border border-white/10 bg-card p-8 text-center">
              <div className="mb-4 text-5xl">📝</div>
              <h2 className="mb-3 text-2xl font-bold text-white">我的文本</h2>
              <p className="mb-6 text-white/70">
                粘贴任意英文文本进行分析，提取词汇、难度评估和阅读时间统计。
              </p>
              <Link
                href="/text"
                className="inline-block rounded-lg bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90"
              >
                打开文本分析工具
              </Link>
            </div>
          </div>
        </section>
      )}
      {activeTab === "resources" && (
        <section className="w-full py-12">
          <div className="mx-auto max-w-4xl px-6 space-y-4">
            <div className="mb-2 flex items-center gap-3">
              <span className="text-3xl">🔗</span>
              <h2 className="text-2xl font-bold text-white">学习资源</h2>
            </div>
            <ResourceCard title="Anki" description="最强大的间隔重复记忆卡片软件" href="https://apps.ankiweb.net/" />
            <ResourceCard title="Forvo" description="真人发音词典，20+ 语言" href="https://forvo.com/" />
            <ResourceCard title="Linguee" description="双语例句词典" href="https://www.linguee.com/" />
            <ResourceCard title="Tatoeba" description="多语种例句库" href="https://tatoeba.org/" />
            <ResourceCard title="YouGlish" description="真实语境下的单词发音视频" href="https://youglish.com/" />
          </div>
        </section>
      )}
    </main>
  );
}

function PlaceholderTab({
  icon,
  title,
  description,
  hint,
  badge,
}: {
  icon: string;
  title: string;
  description: string;
  hint: string;
  badge?: string;
}) {
  return (
    <section className="w-full py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <div className="mb-6 text-6xl">{icon}</div>
        <div className="mb-3 flex items-center justify-center gap-2">
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          {badge && (
            <span className="rounded bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              {badge}
            </span>
          )}
        </div>
        <p className="mb-6 text-lg text-white/70">{description}</p>
        <div className="rounded-xl border border-white/10 bg-card p-6 text-sm text-white/60">
          {hint}
        </div>
      </div>
    </section>
  );
}

function ResourceCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-white/10 bg-card p-5 transition-all hover:border-white/20 hover:bg-white/5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="mb-1 font-semibold text-white">{title}</h3>
          <p className="text-sm text-white/60">{description}</p>
        </div>
        <span className="text-white/40">↗</span>
      </div>
    </a>
  );
}
