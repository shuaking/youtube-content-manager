"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { mockHistory, HistoryItem } from "@/types/history";

export default function HistoryPage() {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = mockHistory.filter((item) => {
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "刚刚";
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays === 1) return "昨天";
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString("zh-CN");
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      video: "🎬",
      phrasepump: "⛽",
      word: "📚",
      text: "📝",
      chatbot: "🤖",
    };
    return icons[type as keyof typeof icons] || "📌";
  };

  const getActivityTypeLabel = (type: string) => {
    const labels = {
      video: "视频",
      phrasepump: "PhrasePump",
      word: "词汇",
      text: "文本分析",
      chatbot: "聊天",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const groupByDate = (items: HistoryItem[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups: { [key: string]: HistoryItem[] } = {
      今天: [],
      昨天: [],
      本周: [],
      更早: [],
    };

    items.forEach((item) => {
      const itemDate = new Date(item.timestamp);
      if (itemDate >= today) {
        groups["今天"].push(item);
      } else if (itemDate >= yesterday) {
        groups["昨天"].push(item);
      } else if (itemDate >= weekAgo) {
        groups["本周"].push(item);
      } else {
        groups["更早"].push(item);
      }
    });

    return groups;
  };

  const groupedHistory = groupByDate(filteredHistory);

  const filterOptions = [
    { id: "all", label: "全部", icon: "📋" },
    { id: "video", label: "视频", icon: "🎬" },
    { id: "phrasepump", label: "PhrasePump", icon: "⛽" },
    { id: "word", label: "词汇", icon: "📚" },
    { id: "text", label: "文本", icon: "📝" },
    { id: "chatbot", label: "聊天", icon: "🤖" },
  ];

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      {/* Header */}
      <section className="w-full border-b border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl leading-none">📜</span>
              <h1 className="text-3xl font-bold text-white md:text-4xl">
                学习历史
              </h1>
            </div>
            <button className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20">
              清除历史
            </button>
          </div>
          <p className="text-white/70">
            查看您的学习活动记录，追踪学习进度
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="w-full border-b border-white/10 py-6">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all ${
                  filterType === filter.id
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="搜索历史记录..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-card py-3 px-4 text-white placeholder-white/40 outline-none transition-all focus:border-white/20 focus:ring-2 focus:ring-secondary/50"
          />
        </div>
      </section>

      {/* History List */}
      <section className="w-full py-12">
        <div className="mx-auto max-w-7xl px-6">
          {filteredHistory.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-card p-12 text-center">
              <div className="mb-4 text-6xl">🔍</div>
              <h2 className="mb-2 text-xl font-semibold text-white">
                没有找到记录
              </h2>
              <p className="text-white/60">
                尝试调整筛选条件或搜索关键词
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedHistory).map(([dateLabel, items]) => {
                if (items.length === 0) return null;
                return (
                  <div key={dateLabel}>
                    <h2 className="mb-4 text-xl font-bold text-white">
                      {dateLabel}
                    </h2>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <Link
                          key={item.id}
                          href={item.link}
                          className="group block"
                        >
                          <div className="flex gap-4 rounded-2xl border border-white/10 bg-card p-4 transition-all hover:border-white/20 hover:shadow-lg">
                            {/* Icon or Thumbnail */}
                            {item.thumbnail ? (
                              <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                                <Image
                                  src={item.thumbnail}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                  sizes="128px"
                                />
                                {item.metadata?.progress && (
                                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                    <div
                                      className="h-full bg-secondary"
                                      style={{
                                        width: `${item.metadata.progress}%`,
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-4xl">
                                {getActivityIcon(item.type)}
                              </div>
                            )}

                            {/* Content */}
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/70">
                                  {getActivityTypeLabel(item.type)}
                                </span>
                                {item.metadata?.duration && (
                                  <span className="text-xs text-white/50">
                                    {item.metadata.duration}
                                  </span>
                                )}
                                {item.metadata?.wordsLearned && (
                                  <span className="rounded bg-secondary/20 px-2 py-0.5 text-xs text-secondary">
                                    +{item.metadata.wordsLearned} 词汇
                                  </span>
                                )}
                              </div>

                              <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-secondary">
                                {item.title}
                              </h3>

                              <p className="mb-2 text-sm text-white/70">
                                {item.description}
                              </p>

                              <p className="text-xs text-white/50">
                                {formatTimeAgo(item.timestamp)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Statistics */}
      <section className="w-full border-t border-white/10 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-6 text-2xl font-bold text-white">统计概览</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-card p-6">
              <div className="mb-2 text-3xl">🎬</div>
              <div className="text-3xl font-bold text-white">
                {mockHistory.filter((h) => h.type === "video").length}
              </div>
              <div className="text-sm text-white/60">观看视频</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-card p-6">
              <div className="mb-2 text-3xl">📚</div>
              <div className="text-3xl font-bold text-white">
                {mockHistory
                  .filter((h) => h.metadata?.wordsLearned)
                  .reduce((sum, h) => sum + (h.metadata?.wordsLearned || 0), 0)}
              </div>
              <div className="text-sm text-white/60">学习词汇</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-card p-6">
              <div className="mb-2 text-3xl">⛽</div>
              <div className="text-3xl font-bold text-white">
                {mockHistory.filter((h) => h.type === "phrasepump").length}
              </div>
              <div className="text-sm text-white/60">PhrasePump 练习</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-card p-6">
              <div className="mb-2 text-3xl">📝</div>
              <div className="text-3xl font-bold text-white">
                {mockHistory.filter((h) => h.type === "text").length}
              </div>
              <div className="text-sm text-white/60">文本分析</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
