"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { mockChannels, mockVideos } from "@/types/catalog";
import { use } from "react";

export default function ChannelDetailPage({
  params,
}: {
  params: Promise<{ lang: string; platform: string; channelId: string }>;
}) {
  const { lang, platform, channelId } = use(params);
  const channel = mockChannels.find((c) => c.id === channelId);

  if (!channel) {
    notFound();
  }

  const channelVideos = mockVideos.filter((v) => v.channelId === channelId);

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
            <span>/</span>
            <span className="text-white">{channel.name}</span>
          </div>
        </div>
      </section>

      {/* Channel Header */}
      <section className="w-full border-b border-white/10 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            {/* Channel Thumbnail */}
            <div className="w-full max-w-[200px] flex-shrink-0">
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <Image
                  src={channel.thumbnail}
                  alt={channel.name}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
            </div>

            {/* Channel Info */}
            <div className="flex-1">
              <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">
                {channel.name}
              </h1>
              <p className="mb-4 text-lg leading-relaxed text-white/70">
                {channel.description}
              </p>

              <div className="mb-6 flex flex-wrap gap-4 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  <span>{channel.subscriberCount} 订阅者</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎬</span>
                  <span>{channel.videoCount} 视频</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {channel.platform === "youtube" ? "📺" : "🎥"}
                  </span>
                  <span className="capitalize">{channel.platform}</span>
                </div>
              </div>

              {/* Topics */}
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-white/80">主题</h3>
                <div className="flex flex-wrap gap-2">
                  {channel.topics.map((topic) => (
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
              <div className="flex gap-3">
                <a
                  href={`https://www.youtube.com/channel/${channel.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90"
                >
                  在 YouTube 上查看
                </a>
                <button className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10">
                  订阅频道
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="w-full py-12">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-6 text-2xl font-bold text-white">
            频道视频 ({channelVideos.length})
          </h2>

          {channelVideos.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {channelVideos.map((video) => (
                <Link
                  key={video.id}
                  href={`/catalog/${lang}/${platform}/video/${video.id}`}
                  className="group block"
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
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-card p-12 text-center">
              <p className="text-white/60">该频道暂无视频</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
