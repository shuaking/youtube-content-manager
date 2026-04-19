"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchIcon, ChevronRightIcon } from "@/components/icons";
import { useSavedWords } from "@/hooks/useStore";
import { unsaveWord, updateSavedWord, SavedWord } from "@/lib/storage";

function exportCsv(words: SavedWord[]): void {
  const header = "word,translation,difficulty,definition,mastered,savedDate\n";
  const rows = words
    .map((w) =>
      [
        w.word,
        w.translation,
        w.difficulty,
        (w.definition || "").replace(/"/g, '""'),
        w.mastered ? "1" : "0",
        w.savedDate,
      ]
        .map((v) => `"${v}"`)
        .join(",")
    )
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `saved-words-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportAnkiTsv(words: SavedWord[]): void {
  const rows = words
    .map((w) => {
      const example = w.examples[0];
      const back = [
        w.translation,
        w.partOfSpeech ? `<i>(${w.partOfSpeech})</i>` : "",
        w.definition || "",
        example ? `<br><hr>${example.text}<br><small>${example.translation}</small>` : "",
      ]
        .filter(Boolean)
        .join("<br>");
      return `${w.word}\t${back}`;
    })
    .join("\n");
  const blob = new Blob([rows], { type: "text/tab-separated-values;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `anki-cards-${Date.now()}.tsv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function SavedItemsPage() {
  const savedWords = useSavedWords();
  const [activeTab, setActiveTab] = useState<"all" | "marked" | "phrases">("marked");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterMastered, setFilterMastered] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedWord, setSelectedWord] = useState<SavedWord | null>(null);

  const filteredWords = savedWords
    .filter((word) => {
      const matchesSearch =
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.translation.includes(searchQuery);
      const matchesDifficulty =
        filterDifficulty === "all" || word.difficulty === filterDifficulty;
      const matchesMastered =
        filterMastered === "all" ||
        (filterMastered === "mastered" && word.mastered) ||
        (filterMastered === "learning" && !word.mastered);
      return matchesSearch && matchesDifficulty && matchesMastered;
    })
    .sort((a, b) => {
      if (sortBy === "recent")
        return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
      if (sortBy === "alphabetical") return a.word.localeCompare(b.word);
      if (sortBy === "difficulty") {
        const order = { beginner: 1, intermediate: 2, advanced: 3 };
        return order[a.difficulty] - order[b.difficulty];
      }
      return 0;
    });

  const stats = {
    total: savedWords.length,
    mastered: savedWords.filter((w) => w.mastered).length,
    learning: savedWords.filter((w) => !w.mastered).length,
    beginner: savedWords.filter((w) => w.difficulty === "beginner").length,
    intermediate: savedWords.filter((w) => w.difficulty === "intermediate").length,
    advanced: savedWords.filter((w) => w.difficulty === "advanced").length,
  };

  const handleRemove = (word: string) => {
    unsaveWord(word);
    if (selectedWord?.word === word) setSelectedWord(null);
  };

  const handleToggleMastered = (word: SavedWord) => {
    updateSavedWord(word.word, { mastered: !word.mastered });
    setSelectedWord({ ...word, mastered: !word.mastered });
  };

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      <section className="w-full border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`rounded-lg px-4 py-2 font-semibold transition-all ${
                  activeTab === "all"
                    ? "border-b-2 border-secondary text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                所有单词
              </button>
              <button
                onClick={() => setActiveTab("marked")}
                className={`rounded-lg px-4 py-2 font-semibold transition-all ${
                  activeTab === "marked"
                    ? "border-b-2 border-secondary text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                标记的词语
              </button>
              <button
                onClick={() => setActiveTab("phrases")}
                className={`rounded-lg px-4 py-2 font-semibold transition-all ${
                  activeTab === "phrases"
                    ? "border-b-2 border-secondary text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                保存的短语
              </button>
            </div>
            <div className="flex gap-2">
              <button
                title="设置"
                aria-label="设置"
                className="rounded-lg border border-white/20 p-2 text-white transition-all hover:bg-white/10"
              >
                <span className="text-lg">⚙️</span>
              </button>
              <button
                onClick={() => {
                  if (typeof document === "undefined") return;
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  } else {
                    document.exitFullscreen().catch(() => {});
                  }
                }}
                title="全屏"
                aria-label="Fullscreen"
                className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition-all hover:bg-white/10"
              >
                <span className="mr-1">⛶</span>Fullscreen
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12">
        <div className="mx-auto max-w-7xl px-6">
          {activeTab === "phrases" ? (
            <div className="rounded-xl border border-white/10 bg-card p-12 text-center">
              <div className="mb-4 text-4xl">📝</div>
              <h3 className="mb-2 text-xl font-semibold text-white">
                保存的短语
              </h3>
              <p className="text-white/60">
                此功能即将推出。您可以保存完整的句子和短语以供日后复习。
              </p>
            </div>
          ) : savedWords.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-card p-12 text-center">
              <div className="mb-4 text-4xl">📚</div>
              <h3 className="mb-2 text-xl font-semibold text-white">
                还没有保存的词汇
              </h3>
              <p className="mb-6 text-white/60">
                在播放器、文本分析或字幕中点击单词即可保存到词汇表。
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/catalog"
                  className="rounded-lg bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90"
                >
                  浏览内容
                </Link>
                <Link
                  href="/text"
                  className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
                >
                  分析文本
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <StatCard value={stats.total} label="总词汇量" />
                <StatCard value={stats.mastered} label="已掌握" color="text-green-400" />
                <StatCard value={stats.learning} label="学习中" color="text-secondary" />
                <StatCard value={stats.beginner} label="初级" color="text-blue-400" />
                <StatCard value={stats.intermediate} label="中级" color="text-yellow-400" />
                <StatCard value={stats.advanced} label="高级" color="text-red-400" />
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="mb-6 space-y-4">
                    <div className="relative">
                      <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        placeholder="搜索词汇..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-card py-3 pl-12 pr-4 text-white placeholder-white/40 outline-none transition-all focus:border-white/20 focus:ring-2 focus:ring-secondary/50"
                      />
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <select
                        value={filterDifficulty}
                        onChange={(e) => setFilterDifficulty(e.target.value)}
                        className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white outline-none transition-all focus:border-secondary"
                      >
                        <option value="all">所有难度</option>
                        <option value="beginner">初级</option>
                        <option value="intermediate">中级</option>
                        <option value="advanced">高级</option>
                      </select>

                      <select
                        value={filterMastered}
                        onChange={(e) => setFilterMastered(e.target.value)}
                        className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white outline-none transition-all focus:border-secondary"
                      >
                        <option value="all">所有状态</option>
                        <option value="learning">学习中</option>
                        <option value="mastered">已掌握</option>
                      </select>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white outline-none transition-all focus:border-secondary"
                      >
                        <option value="recent">最近添加</option>
                        <option value="alphabetical">字母顺序</option>
                        <option value="difficulty">难度排序</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredWords.map((word) => (
                      <button
                        key={word.word}
                        onClick={() => setSelectedWord(word)}
                        className={`w-full rounded-xl border p-4 text-left transition-all ${
                          selectedWord?.word === word.word
                            ? "border-secondary bg-secondary/10"
                            : "border-white/10 bg-card hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-3">
                              <h3 className="text-xl font-semibold text-white">
                                {word.word}
                              </h3>
                              <span className="text-lg text-white/70">
                                {word.translation}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-white/60">
                              {word.partOfSpeech && (
                                <span className="rounded bg-white/10 px-2 py-0.5">
                                  {word.partOfSpeech}
                                </span>
                              )}
                              <span
                                className={`rounded px-2 py-0.5 ${
                                  word.difficulty === "beginner"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : word.difficulty === "intermediate"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {word.difficulty === "beginner" && "初级"}
                                {word.difficulty === "intermediate" && "中级"}
                                {word.difficulty === "advanced" && "高级"}
                              </span>
                              {word.mastered && (
                                <span className="rounded bg-green-500/20 px-2 py-0.5 text-green-400">
                                  ✓ 已掌握
                                </span>
                              )}
                              {word.reviewCount > 0 && (
                                <span className="text-white/40">
                                  复习 {word.reviewCount} 次
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-white/40" />
                        </div>
                      </button>
                    ))}
                  </div>

                  {filteredWords.length === 0 && (
                    <div className="rounded-xl border border-white/10 bg-card p-12 text-center">
                      <p className="text-white/60">没有找到匹配的词汇</p>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-1">
                  {selectedWord ? (
                    <div className="sticky top-20 space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-card p-6">
                        <h2 className="mb-4 text-2xl font-bold text-white">
                          {selectedWord.word}
                        </h2>
                        <div className="mb-4 text-lg text-white/70">
                          {selectedWord.translation}
                        </div>

                        <div className="mb-6 space-y-2 text-sm">
                          {selectedWord.partOfSpeech && (
                            <Row label="词性" value={selectedWord.partOfSpeech} />
                          )}
                          <Row
                            label="难度"
                            value={
                              selectedWord.difficulty === "beginner"
                                ? "初级"
                                : selectedWord.difficulty === "intermediate"
                                  ? "中级"
                                  : "高级"
                            }
                          />
                          <Row label="复习次数" value={String(selectedWord.reviewCount)} />
                          <Row
                            label="保存日期"
                            value={new Date(selectedWord.savedDate).toLocaleDateString("zh-CN")}
                          />
                          <Row
                            label="下次复习"
                            value={new Date(selectedWord.srs.nextReviewDate).toLocaleDateString("zh-CN")}
                          />
                        </div>

                        {selectedWord.definition && (
                          <div className="mb-6 border-t border-white/10 pt-6">
                            <h3 className="mb-2 font-semibold text-white">释义</h3>
                            <p className="text-sm leading-relaxed text-white/70">
                              {selectedWord.definition}
                            </p>
                          </div>
                        )}

                        {selectedWord.examples.length > 0 && (
                          <div className="border-t border-white/10 pt-6">
                            <h3 className="mb-3 font-semibold text-white">例句</h3>
                            <div className="space-y-3">
                              {selectedWord.examples.map((example, idx) => (
                                <div key={idx} className="rounded-lg bg-white/5 p-3">
                                  <p className="mb-1 text-sm text-white">{example.text}</p>
                                  {example.translation && (
                                    <p className="mb-2 text-sm text-white/60">
                                      {example.translation}
                                    </p>
                                  )}
                                  {example.source && (
                                    <p className="text-xs text-white/40">
                                      来源: {example.source}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={() => handleToggleMastered(selectedWord)}
                          className="w-full rounded-lg bg-secondary px-4 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90"
                        >
                          {selectedWord.mastered ? "标记为学习中" : "标记为已掌握"}
                        </button>
                        <button
                          onClick={() => handleRemove(selectedWord.word)}
                          className="w-full rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 font-semibold text-red-400 transition-all hover:bg-red-500/20"
                        >
                          从列表中移除
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="sticky top-20 rounded-2xl border border-white/10 bg-card p-12 text-center">
                      <p className="text-white/60">选择一个词汇查看详情</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {savedWords.length > 0 && (
        <section className="w-full border-t border-white/10 py-12">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="mb-6 text-2xl font-bold text-white">导出选项</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-card p-6">
                <h3 className="mb-2 font-semibold text-white">导出到 Anki</h3>
                <p className="mb-4 text-sm text-white/60">
                  导出 TSV 文件，Anki 中使用&ldquo;导入文件&rdquo;导入（分隔符：Tab，允许 HTML）
                </p>
                <button
                  onClick={() => exportAnkiTsv(savedWords)}
                  className="w-full rounded-lg bg-secondary px-4 py-2 font-semibold text-secondary-foreground transition-all hover:opacity-90"
                >
                  生成 Anki TSV 文件
                </button>
              </div>

              <div className="rounded-xl border border-white/10 bg-card p-6">
                <h3 className="mb-2 font-semibold text-white">导出为 CSV</h3>
                <p className="mb-4 text-sm text-white/60">
                  导出为 CSV 文件，方便在 Excel 或其他应用中使用
                </p>
                <button
                  onClick={() => exportCsv(savedWords)}
                  className="w-full rounded-lg border border-white/20 px-4 py-2 font-semibold text-white transition-all hover:bg-white/10"
                >
                  下载 CSV 文件
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function StatCard({
  value,
  label,
  color = "text-white",
}: {
  value: number;
  label: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-card p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-white/60">{label}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-white/60">{label}:</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
