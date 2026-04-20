"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchIcon } from "@/components/icons";
import { languages, Video, Channel } from "@/types/catalog";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { parseSubtitleFile, formatCueTime, ParsedSubtitleCue } from "@/lib/subtitle-parser";

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
      {activeTab === "books" && <BooksTab />}
      {activeTab === "fsi-dli" && <FsiDliTab />}
      {activeTab === "media" && <MediaFileTab />}
      {activeTab === "podcasts" && <PodcastsTab />}
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

function MediaFileTab() {
  const [cues, setCues] = useState<ParsedSubtitleCue[]>([]);
  const [filename, setFilename] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = typeof ev.target?.result === "string" ? ev.target.result : "";
      try {
        const parsed = parseSubtitleFile(file.name, content);
        if (parsed.length === 0) {
          setError("未识别到字幕条目，请确认文件格式正确。");
          return;
        }
        setCues(parsed);
        setFilename(file.name);
      } catch {
        setError("解析失败");
      }
    };
    reader.readAsText(file);
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="text-3xl">📁</span>
          <h2 className="text-2xl font-bold text-white">媒体文件</h2>
          <span className="rounded bg-red-500 px-2 py-0.5 text-xs font-bold text-white">NEW</span>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-card p-6">
          <p className="mb-4 text-white/70">
            上传本地字幕文件（SRT / WebVTT），在浏览器内解析并浏览每一条字幕，可点击朗读。
          </p>
          <label className="inline-block cursor-pointer rounded-lg bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90">
            选择文件 (.srt / .vtt)
            <input
              type="file"
              accept=".srt,.vtt,text/plain"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
          {filename && (
            <span className="ml-4 text-sm text-white/60">已加载: {filename}</span>
          )}
          {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
        </div>

        {cues.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                字幕条目 ({cues.length})
              </h3>
              <Link
                href="/text"
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                一键跳转文本分析 →
              </Link>
            </div>
            <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-2">
              {cues.map((cue) => (
                <div
                  key={cue.id}
                  className="rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div className="mb-1 flex items-center justify-between text-xs text-white/50">
                    <span>
                      #{cue.id} · {formatCueTime(cue.startTime)} - {formatCueTime(cue.endTime)}
                    </span>
                    <button
                      onClick={() => speak(cue.text)}
                      className="text-white/60 hover:text-white"
                      title="朗读"
                    >
                      🔊
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-white">{cue.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

type BookChapter = { title: string; body: string };

function splitChapters(text: string): BookChapter[] {
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  const lines = cleaned.split("\n");
  const chapters: BookChapter[] = [];
  let current: BookChapter | null = null;
  const headingRe = /^(Chapter|第)\s*[\dIVXLCDM一二三四五六七八九十百]+[\s:：.、\-]?\s*(.*)$/i;

  for (const line of lines) {
    if (headingRe.test(line.trim())) {
      if (current) chapters.push(current);
      current = { title: line.trim(), body: "" };
    } else {
      if (!current) current = { title: "开始", body: "" };
      current.body += line + "\n";
    }
  }
  if (current) chapters.push(current);
  if (chapters.length === 0) {
    chapters.push({ title: "全文", body: cleaned });
  }
  return chapters;
}

function BooksTab() {
  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [selected, setSelected] = useState<number>(0);
  const [filename, setFilename] = useState<string>("");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = typeof ev.target?.result === "string" ? ev.target.result : "";
      setChapters(splitChapters(content));
      setSelected(0);
      setFilename(file.name);
    };
    reader.readAsText(file);
  };

  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="text-3xl">📚</span>
          <h2 className="text-2xl font-bold text-white">图书</h2>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-card p-6">
          <p className="mb-4 text-white/70">
            上传纯文本（.txt / .md）格式的书籍或长文章。按「Chapter」或「第N章」自动切分章节。
          </p>
          <label className="inline-block cursor-pointer rounded-lg bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90">
            选择文件 (.txt / .md)
            <input
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
          {filename && (
            <span className="ml-4 text-sm text-white/60">已加载: {filename}</span>
          )}
        </div>

        {chapters.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <h3 className="mb-3 text-sm font-semibold text-white/80">
                章节 ({chapters.length})
              </h3>
              <div className="sticky top-20 max-h-[70vh] space-y-1 overflow-y-auto pr-2">
                {chapters.map((ch, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className={`w-full rounded-lg border p-3 text-left text-sm transition-all ${
                      selected === i
                        ? "border-secondary bg-secondary/10 text-white"
                        : "border-white/10 bg-card text-white/70 hover:bg-white/5"
                    }`}
                  >
                    <div className="line-clamp-2 font-semibold">{ch.title}</div>
                  </button>
                ))}
              </div>
            </aside>
            <article className="rounded-2xl border border-white/10 bg-card p-8 lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{chapters[selected]?.title}</h3>
                <Link
                  href="/text"
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10"
                  title="跳转到文本分析"
                >
                  分析本章 →
                </Link>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-white/80">
                {chapters[selected]?.body}
              </pre>
            </article>
          </div>
        )}
      </div>
    </section>
  );
}

type PodcastEpisode = {
  title: string;
  description: string;
  pubDate: string;
  audioUrl: string;
  duration: string;
  link: string;
};

type PodcastFeed = {
  title: string;
  description: string;
  image?: string;
  episodes: PodcastEpisode[];
};

const SUGGESTED_FEEDS = [
  { name: "NPR News Now", url: "https://feeds.npr.org/500005/podcast.xml" },
  { name: "BBC Learning English", url: "https://podcasts.files.bbci.co.uk/p02pc9tn.rss" },
  { name: "TED Talks Daily", url: "https://feeds.feedburner.com/TEDTalks_audio" },
];

function PodcastsTab() {
  const [url, setUrl] = useState("");
  const [feed, setFeed] = useState<PodcastFeed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFeed = async (target?: string) => {
    const u = (target || url).trim();
    if (!u) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/rss?url=${encodeURIComponent(u)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `HTTP ${res.status}`);
        setFeed(null);
      } else {
        setFeed(await res.json());
        if (target) setUrl(target);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="text-3xl">🎧</span>
          <h2 className="text-2xl font-bold text-white">播客</h2>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-card p-6">
          <p className="mb-4 text-white/70">
            输入 RSS 源 URL 订阅播客节目，或从下方推荐选择。
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="url"
              placeholder="https://example.com/podcast.rss"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchFeed();
              }}
              className="flex-1 rounded-lg border border-white/10 bg-background px-4 py-2 text-white placeholder-white/40 outline-none transition-all focus:border-white/20 focus:ring-2 focus:ring-secondary/50"
            />
            <button
              onClick={() => fetchFeed()}
              disabled={!url.trim() || loading}
              className="rounded-lg bg-secondary px-6 py-2 font-semibold text-secondary-foreground transition-all hover:opacity-90 disabled:opacity-30"
            >
              {loading ? "加载中..." : "订阅"}
            </button>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-sm text-white/60">推荐播客:</div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_FEEDS.map((s) => (
                <button
                  key={s.url}
                  onClick={() => fetchFeed(s.url)}
                  className="rounded-lg bg-white/5 px-3 py-1 text-sm text-white/80 transition-all hover:bg-white/10"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="mt-3 text-sm text-red-400">错误：{error}</div>}
        </div>

        {feed && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-card p-6">
              <h3 className="mb-2 text-xl font-bold text-white">{feed.title}</h3>
              <p className="text-sm text-white/60 line-clamp-3">{feed.description}</p>
            </div>

            <div className="space-y-3">
              {feed.episodes.map((ep, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-card p-5">
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h4 className="font-semibold text-white">{ep.title}</h4>
                    {ep.duration && (
                      <span className="shrink-0 rounded bg-white/10 px-2 py-0.5 text-xs text-white/70">
                        {ep.duration}
                      </span>
                    )}
                  </div>
                  {ep.description && (
                    <p className="mb-3 line-clamp-3 text-sm text-white/60">
                      {ep.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    {ep.audioUrl && (
                      <audio
                        controls
                        preload="none"
                        src={ep.audioUrl}
                        className="h-9 flex-1"
                      />
                    )}
                    {ep.link && (
                      <a
                        href={ep.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs text-secondary hover:underline"
                      >
                        详情 ↗
                      </a>
                    )}
                  </div>
                  {ep.pubDate && (
                    <div className="mt-2 text-xs text-white/40">{ep.pubDate}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function FsiDliTab() {
  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-4xl px-6 space-y-4">
        <div className="mb-2 flex items-center gap-3">
          <span className="text-3xl">🎓</span>
          <h2 className="text-2xl font-bold text-white">FSI / DLI 课程</h2>
        </div>
        <p className="mb-4 text-white/70">
          美国外交学院（FSI）和国防语言学院（DLI）的经典公开语言课程。以下为官方或社区维护的公开资源。
        </p>
        <ResourceCard
          title="Live Lingua — FSI 课程汇总"
          description="FSI 全套免费语言课程（40+ 语言），含音频 + PDF"
          href="https://www.livelingua.com/fsi"
        />
        <ResourceCard
          title="DLI — Defense Language Institute"
          description="DLI 官方，美军语言培训"
          href="https://www.dliflc.edu/"
        />
        <ResourceCard
          title="GLOSS — DLI 的在线学习平台"
          description="1000+ 可免费访问的多语种学习单元"
          href="https://gloss.dliflc.edu/"
        />
        <ResourceCard
          title="Yojik's Website — FSI/DLI 归档"
          description="社区整理的 FSI/DLI 历史课程下载"
          href="https://www.yojik.eu/languages/FSI_English.html"
        />
        <ResourceCard
          title="Archive.org — FSI Language Courses"
          description="Internet Archive 上的 FSI 课程存档"
          href="https://archive.org/details/languagecourses"
        />
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
