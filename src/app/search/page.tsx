"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SearchIcon } from "@/components/icons";
import { searchContent, SearchResult } from "@/types/search";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true);
      // Simulate search delay
      const timer = setTimeout(() => {
        const searchResults = searchContent(query, activeFilters);
        setResults(searchResults);
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [query, activeFilters]);

  const filterOptions = [
    { id: "video", label: "视频", icon: "🎬" },
    { id: "channel", label: "频道", icon: "📺" },
    { id: "word", label: "词汇", icon: "📚" },
    { id: "article", label: "文章", icon: "📄" },
  ];

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  const getResultIcon = (type: string) => {
    const icons = {
      video: "🎬",
      channel: "📺",
      word: "📚",
      article: "📄",
    };
    return icons[type as keyof typeof icons] || "📌";
  };

  const getResultTypeLabel = (type: string) => {
    const labels = {
      video: "视频",
      channel: "频道",
      word: "词汇",
      article: "文章",
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      {/* Header */}
      <section className="w-full border-b border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-4xl leading-none">🔍</span>
            <h1 className="text-3xl font-bold text-white md:text-4xl">搜索</h1>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="搜索视频、频道、词汇或文章..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-card py-4 pl-14 pr-4 text-lg text-white placeholder-white/40 outline-none transition-all focus:border-white/20 focus:ring-2 focus:ring-secondary/50"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all ${
                  activeFilters.includes(filter.id)
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            ))}
            {activeFilters.length > 0 && (
              <button
                onClick={() => setActiveFilters([])}
                className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white/70 transition-all hover:bg-white/10"
              >
                清除筛选
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="w-full py-12">
        <div className="mx-auto max-w-7xl px-6">
          {!query.trim() ? (
            <div className="rounded-2xl border border-white/10 bg-card p-12 text-center">
              <div className="mb-4 text-6xl">🔍</div>
              <h2 className="mb-2 text-xl font-semibold text-white">
                开始搜索
              </h2>
              <p className="text-white/60">
                输入关键词搜索视频、频道、词汇或帮助文章
              </p>
            </div>
          ) : isSearching ? (
            <div className="rounded-2xl border border-white/10 bg-card p-12 text-center">
              <div className="mb-4 text-4xl">⏳</div>
              <p className="text-white/60">搜索中...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-card p-12 text-center">
              <div className="mb-4 text-6xl">😕</div>
              <h2 className="mb-2 text-xl font-semibold text-white">
                未找到结果
              </h2>
              <p className="text-white/60">
                尝试使用不同的关键词或清除筛选条件
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-white/60">
                找到 {results.length} 个结果
              </div>
              <div className="space-y-4">
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={result.link}
                    className="group block"
                  >
                    <div className="flex gap-4 rounded-2xl border border-white/10 bg-card p-4 transition-all hover:border-white/20 hover:shadow-lg">
                      {/* Thumbnail or Icon */}
                      {result.thumbnail ? (
                        <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={result.thumbnail}
                            alt={result.title}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        </div>
                      ) : (
                        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-4xl">
                          {getResultIcon(result.type)}
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/70">
                            {getResultTypeLabel(result.type)}
                          </span>
                          {result.metadata?.difficulty && (
                            <span
                              className={`rounded px-2 py-0.5 text-xs ${
                                result.metadata.difficulty === "beginner"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : result.metadata.difficulty === "intermediate"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {result.metadata.difficulty === "beginner" && "初级"}
                              {result.metadata.difficulty === "intermediate" && "中级"}
                              {result.metadata.difficulty === "advanced" && "高级"}
                            </span>
                          )}
                        </div>

                        <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-secondary">
                          {result.title}
                        </h3>

                        <p className="mb-2 line-clamp-2 text-sm text-white/70">
                          {result.description}
                        </p>

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-3 text-xs text-white/50">
                          {result.metadata?.views && (
                            <span>{result.metadata.views} 观看</span>
                          )}
                          {result.metadata?.subscribers && (
                            <span>{result.metadata.subscribers} 订阅者</span>
                          )}
                          {result.metadata?.translation && (
                            <span>翻译: {result.metadata.translation}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background pt-[56px]">
        <section className="w-full border-b border-white/10 py-8">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-6 flex items-center gap-3">
              <span className="text-4xl leading-none">🔍</span>
              <h1 className="text-3xl font-bold text-white md:text-4xl">搜索</h1>
            </div>
            <div className="rounded-2xl border border-white/10 bg-card p-12 text-center">
              <div className="mb-4 text-4xl">⏳</div>
              <p className="text-white/60">加载中...</p>
            </div>
          </div>
        </section>
      </main>
    }>
      <SearchContent />
    </Suspense>
  );
}
