"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PlayIcon } from "@/components/icons";
import { Video, Channel } from "@/types/catalog";
import { Subtitle } from "@/types/subtitles";
import { use, useEffect, useState } from "react";

export default function VideoDetailPage({
  params,
}: {
  params: Promise<{ lang: string; platform: string; videoId: string }>;
}) {
  const { lang, platform, videoId } = use(params);
  const [video, setVideo] = useState<Video | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    total: number;
    beginner: number;
    intermediate: number;
    advanced: number;
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [vRes, cRes] = await Promise.all([
          fetch("/api/catalog/videos"),
          fetch("/api/catalog/channels"),
        ]);
        const { videos = [] }: { videos: Video[] } = vRes.ok ? await vRes.json() : { videos: [] };
        const { channels = [] }: { channels: Channel[] } = cRes.ok ? await cRes.json() : { channels: [] };
        if (cancelled) return;

        const v = videos.find((x) => x.id === videoId);
        if (!v) {
          setMissing(true);
          return;
        }
        const c = channels.find((x) => x.id === v.channelId) ?? null;
        setVideo(v);
        setChannel(c);
        setRelatedVideos(videos.filter((x) => x.channelId === v.channelId && x.id !== videoId));
      } catch {
        if (!cancelled) setMissing(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-[56px]">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center text-white/60">
          加载中...
        </div>
      </main>
    );
  }

  if (missing || !video) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      {/* Breadcrumb */}
      <section className="w-full border-b border-white/10 py-4">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Link href="/catalog" className="hover:text-white">
              内容目录
            </Link>
            <span>/</span>
            <Link
              href={`/catalog?lang=${lang}&platform=${platform}`}
              className="hover:text-white"
            >
              {lang.toUpperCase()}
            </Link>
            {channel && (
              <>
                <span>/</span>
                <Link
                  href={`/catalog/${lang}/${platform}/channel/${channel.id}`}
                  className="hover:text-white"
                >
                  {channel.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-white">视频</span>
          </div>
        </div>
      </section>

      {/* Video Player Section */}
      <section className="w-full py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Video Player Placeholder */}
              <div className="relative mb-6 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-card">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary transition-all hover:scale-110"
                  >
                    <PlayIcon className="h-10 w-10 text-secondary-foreground" />
                  </a>
                </div>
                <div className="absolute bottom-4 right-4 rounded bg-black/80 px-3 py-1 text-sm text-white">
                  {video.duration}
                </div>
              </div>

              {/* Video Info */}
              <div className="mb-6">
                <h1 className="mb-3 text-2xl font-bold text-white md:text-3xl">
                  {video.title}
                </h1>

                <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-white/60">
                  <span>{video.views} 观看</span>
                  <span
                    className={`rounded px-2 py-1 ${
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

                <p className="mb-4 leading-relaxed text-white/70">
                  {video.description}
                </p>

                {/* Topics */}
                <div className="mb-6">
                  <h3 className="mb-2 text-sm font-semibold text-white/80">主题</h3>
                  <div className="flex flex-wrap gap-2">
                    {video.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-lg bg-white/10 px-3 py-1 text-sm text-white"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/player/${video.id}`}
                    className="rounded-lg bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90"
                  >
                    使用 Language Reactor 播放
                  </Link>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
                  >
                    在 YouTube 上观看
                  </a>
                  <button className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10">
                    保存到学习列表
                  </button>
                </div>
              </div>

              {/* Channel Info */}
              {channel && (
                <div className="rounded-2xl border border-white/10 bg-card p-6">
                  <Link
                    href={`/catalog/${lang}/${platform}/channel/${channel.id}`}
                    className="group flex items-center gap-4"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={channel.thumbnail}
                        alt={channel.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold text-white group-hover:text-secondary">
                        {channel.name}
                      </h3>
                      <p className="text-sm text-white/60">
                        {channel.subscriberCount} 订阅者
                      </p>
                    </div>
                    <button className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-all hover:opacity-90">
                      查看频道
                    </button>
                  </Link>
                </div>
              )}

              {/* Vocabulary Difficulty Analysis */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-white">词汇难度分析</h3>
                  {!analysis && (
                    <button
                      onClick={async () => {
                        if (!video) return;
                        setAnalyzing(true);
                        try {
                          const res = await fetch(`/api/subtitles/${video.id}`);
                          if (!res.ok) throw new Error("字幕获取失败");
                          const data = (await res.json()) as { subtitles: Subtitle[] };
                          const allText = data.subtitles.map((s) => s.originalText).join(" ");
                          const tokens = allText
                            .toLowerCase()
                            .replace(/[^\w\s'-]/g, " ")
                            .split(/\s+/)
                            .filter((w) => w.length >= 2 && /[a-z]/.test(w));
                          const unique = Array.from(new Set(tokens));
                          let b = 0, i = 0, a = 0;
                          for (const w of unique) {
                            if (w.length >= 10) a++;
                            else if (w.length >= 7) i++;
                            else b++;
                          }
                          setAnalysis({ total: unique.length, beginner: b, intermediate: i, advanced: a });
                        } catch {
                          setAnalysis({ total: 0, beginner: 0, intermediate: 0, advanced: 0 });
                        } finally {
                          setAnalyzing(false);
                        }
                      }}
                      disabled={analyzing}
                      className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white transition-all hover:bg-white/10 disabled:opacity-30"
                    >
                      {analyzing ? "分析中..." : "开始分析"}
                    </button>
                  )}
                </div>
                {analysis ? (
                  analysis.total === 0 ? (
                    <p className="text-sm text-white/60">字幕不可用或为空。</p>
                  ) : (
                    <div>
                      <div className="mb-3 flex h-4 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="bg-blue-400"
                          style={{ width: `${(analysis.beginner / analysis.total) * 100}%` }}
                          title={`初级 ${analysis.beginner}`}
                        />
                        <div
                          className="bg-yellow-400"
                          style={{
                            width: `${(analysis.intermediate / analysis.total) * 100}%`,
                          }}
                          title={`中级 ${analysis.intermediate}`}
                        />
                        <div
                          className="bg-red-400"
                          style={{ width: `${(analysis.advanced / analysis.total) * 100}%` }}
                          title={`高级 ${analysis.advanced}`}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <div className="text-blue-400 font-bold">{analysis.beginner}</div>
                          <div className="text-white/50">初级</div>
                        </div>
                        <div>
                          <div className="text-yellow-400 font-bold">{analysis.intermediate}</div>
                          <div className="text-white/50">中级</div>
                        </div>
                        <div>
                          <div className="text-red-400 font-bold">{analysis.advanced}</div>
                          <div className="text-white/50">高级</div>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-white/50">
                        共 {analysis.total} 个独特词汇
                      </p>
                    </div>
                  )
                ) : (
                  <p className="text-sm text-white/60">
                    点击&ldquo;开始分析&rdquo;，根据字幕估算本视频的词汇难度分布。
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar - Related Videos */}
            <div className="lg:col-span-1">
              <h2 className="mb-4 text-xl font-bold text-white">相关视频</h2>
              <div className="space-y-4">
                {relatedVideos.length > 0 ? (
                  relatedVideos.map((relatedVideo) => (
                    <Link
                      key={relatedVideo.id}
                      href={`/catalog/${lang}/${platform}/video/${relatedVideo.id}`}
                      className="group block"
                    >
                      <div className="flex gap-3 rounded-xl border border-white/10 bg-card p-3 transition-all hover:border-white/20 hover:bg-white/5">
                        <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={relatedVideo.thumbnail}
                            alt={relatedVideo.title}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                          <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-xs text-white">
                            {relatedVideo.duration}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-white group-hover:text-secondary">
                            {relatedVideo.title}
                          </h3>
                          <p className="text-xs text-white/50">
                            {relatedVideo.views} 观看
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-xl border border-white/10 bg-card p-6 text-center">
                    <p className="text-sm text-white/60">暂无相关视频</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
