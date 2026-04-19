"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useHistory, useSavedWords } from "@/hooks/useStore";
import { clearHistory, HistoryEntry } from "@/lib/storage";

const TYPE_META = {
  video: { icon: "🎬", label: "视频" },
  phrasepump: { icon: "⛽", label: "PhrasePump" },
  word: { icon: "📚", label: "词汇" },
  text: { icon: "📝", label: "文本分析" },
  chatbot: { icon: "🤖", label: "聊天" },
} as const;

const filterOptions = [
  { id: "all", label: "全部", icon: "📋" },
  { id: "video", label: "视频", icon: "🎬" },
  { id: "phrasepump", label: "PhrasePump", icon: "⛽" },
  { id: "word", label: "词汇", icon: "📚" },
  { id: "text", label: "文本", icon: "📝" },
  { id: "chatbot", label: "聊天", icon: "🤖" },
];

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "刚刚";
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString("zh-CN");
}

function groupByDate(items: HistoryEntry[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: Record<string, HistoryEntry[]> = {
    今天: [],
    昨天: [],
    本周: [],
    更早: [],
  };

  items.forEach((item) => {
    const itemDate = new Date(item.timestamp);
    if (itemDate >= today) groups["今天"].push(item);
    else if (itemDate >= yesterday) groups["昨天"].push(item);
    else if (itemDate >= weekAgo) groups["本周"].push(item);
    else groups["更早"].push(item);
  });

  return groups;
}

export default function HistoryPage() {
  const history = useHistory();
  const savedWords = useSavedWords();
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = history.filter((item) => {
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const grouped = groupByDate(filtered);

  const handleClear = () => {
    if (confirm("确定清空所有历史记录吗？此操作不可撤销。")) {
      clearHistory();
    }
  };

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      <section className="w-full border-b border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl leading-none">📜</span>
              <h1 className="text-3xl font-bold text-white md:text-4xl">学习历史</h1>
            </div>
            <button
              onClick={handleClear}
              disabled={history.length === 0}
              className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-30"
            >
              清除历史
            </button>
          </div>
          <p className="text-white/70">查看您的学习活动记录，追踪学习进度</p>
        </div>
      </section>

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

          <input
            type="text"
            placeholder="搜索历史记录..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-card py-3 px-4 text-white placeholder-white/40 outline-none transition-all focus:border-white/20 focus:ring-2 focus:ring-secondary/50"
          />
        </div>
      </section>

      <section className="w-full py-12">
        <div className="mx-auto max-w-7xl px-6">
          {history.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-card p-12 text-center">
              <div className="mb-4 text-6xl">📭</div>
              <h2 className="mb-2 text-xl font-semibold text-white">暂无学习记录</h2>
              <p className="mb-6 text-white/60">
                开始学习视频、练习词汇或使用 Aria 对话后会自动记录。
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/catalog"
                  className="rounded-lg bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90"
                >
                  浏览内容
                </Link>
                <Link
                  href="/chatbot"
                  className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
                >
                  和 Aria 对话
                </Link>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-card p-12 text-center">
              <div className="mb-4 text-6xl">🔍</div>
              <h2 className="mb-2 text-xl font-semibold text-white">没有找到记录</h2>
              <p className="text-white/60">尝试调整筛选条件或搜索关键词</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([label, items]) => {
                if (items.length === 0) return null;
                return (
                  <div key={label}>
                    <h2 className="mb-4 text-xl font-bold text-white">{label}</h2>
                    <div className="space-y-3">
                      {items.map((item) => {
                        const meta = TYPE_META[item.type] || { icon: "📌", label: item.type };
                        return (
                          <Link key={item.id} href={item.link} className="group block">
                            <div className="flex gap-4 rounded-2xl border border-white/10 bg-card p-4 transition-all hover:border-white/20 hover:shadow-lg">
                              {item.thumbnail ? (
                                <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                                  <Image
                                    src={item.thumbnail}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    sizes="128px"
                                  />
                                  {typeof item.metadata?.progress === "number" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                      <div
                                        className="h-full bg-secondary"
                                        style={{ width: `${item.metadata.progress}%` }}
                                      />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-4xl">
                                  {meta.icon}
                                </div>
                              )}

                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/70">
                                    {meta.label}
                                  </span>
                                  {item.metadata?.duration && (
                                    <span className="text-xs text-white/50">{item.metadata.duration}</span>
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
                                <p className="mb-2 text-sm text-white/70">{item.description}</p>
                                <p className="text-xs text-white/50">
                                  {formatTimeAgo(new Date(item.timestamp))}
                                </p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="w-full border-t border-white/10 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-6 text-2xl font-bold text-white">统计概览</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <StatCard
              icon="🎬"
              value={history.filter((h) => h.type === "video").length}
              label="观看视频"
            />
            <StatCard
              icon="📚"
              value={savedWords.length}
              label="已保存词汇"
            />
            <StatCard
              icon="⛽"
              value={history.filter((h) => h.type === "phrasepump").length}
              label="PhrasePump 练习"
            />
            <StatCard
              icon="📝"
              value={history.filter((h) => h.type === "text").length}
              label="文本分析"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-card p-6">
      <div className="mb-2 text-3xl">{icon}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-white/60">{label}</div>
    </div>
  );
}
