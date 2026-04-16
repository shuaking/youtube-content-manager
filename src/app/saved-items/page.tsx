"use client";

import { useState } from "react";
import { SearchIcon, ChevronRightIcon } from "@/components/icons";

const mockSavedWords = [
  {
    id: 1,
    word: "weather",
    translation: "天气",
    difficulty: "intermediate",
    partOfSpeech: "noun",
    definition: "the state of the atmosphere at a place and time",
    examples: [
      {
        text: "The weather is beautiful today.",
        translation: "今天天气很好。",
        source: "Netflix - Friends S01E01",
      },
    ],
    savedDate: "2026-04-10",
    reviewCount: 3,
    mastered: false,
  },
  {
    id: 2,
    word: "beautiful",
    translation: "美丽的",
    difficulty: "beginner",
    partOfSpeech: "adjective",
    definition: "pleasing the senses or mind aesthetically",
    examples: [
      {
        text: "The weather is beautiful today.",
        translation: "今天天气很好。",
        source: "Netflix - Friends S01E01",
      },
      {
        text: "What a beautiful sunset!",
        translation: "多么美丽的日落！",
        source: "YouTube - Nature Documentary",
      },
    ],
    savedDate: "2026-04-12",
    reviewCount: 5,
    mastered: true,
  },
  {
    id: 3,
    word: "learning",
    translation: "学习",
    difficulty: "beginner",
    partOfSpeech: "noun/verb",
    definition: "the acquisition of knowledge or skills",
    examples: [
      {
        text: "I'm learning a new language every day.",
        translation: "我每天都在学习一门新语言。",
        source: "YouTube - Language Learning Tips",
      },
    ],
    savedDate: "2026-04-13",
    reviewCount: 2,
    mastered: false,
  },
  {
    id: 4,
    word: "practice",
    translation: "练习",
    difficulty: "beginner",
    partOfSpeech: "noun/verb",
    definition: "repeated exercise in or performance of an activity",
    examples: [
      {
        text: "Practice makes perfect.",
        translation: "熟能生巧。",
        source: "Netflix - The Crown S02E03",
      },
    ],
    savedDate: "2026-04-14",
    reviewCount: 1,
    mastered: false,
  },
];

export default function SavedItemsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "marked" | "phrases">("marked");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterMastered, setFilterMastered] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedWord, setSelectedWord] = useState<typeof mockSavedWords[0] | null>(null);

  const filteredWords = mockSavedWords
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
      if (sortBy === "recent") return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
      if (sortBy === "alphabetical") return a.word.localeCompare(b.word);
      if (sortBy === "difficulty") {
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
      }
      return 0;
    });

  const stats = {
    total: mockSavedWords.length,
    mastered: mockSavedWords.filter((w) => w.mastered).length,
    learning: mockSavedWords.filter((w) => !w.mastered).length,
    beginner: mockSavedWords.filter((w) => w.difficulty === "beginner").length,
    intermediate: mockSavedWords.filter((w) => w.difficulty === "intermediate").length,
    advanced: mockSavedWords.filter((w) => w.difficulty === "advanced").length,
  };

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      {/* Tab Navigation */}
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
              <button className="rounded-lg border border-white/20 p-2 text-white transition-all hover:bg-white/10">
                <span className="text-lg">⚙️</span>
              </button>
              <button className="rounded-lg border border-white/20 p-2 text-white transition-all hover:bg-white/10">
                <span className="text-lg">⛶</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
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
          ) : (
            <>
              {/* Statistics */}
              <div className="mb-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <div className="rounded-xl border border-white/10 bg-card p-4">
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-sm text-white/60">总词汇量</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-card p-4">
                  <div className="text-2xl font-bold text-green-400">{stats.mastered}</div>
                  <div className="text-sm text-white/60">已掌握</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-card p-4">
                  <div className="text-2xl font-bold text-secondary">{stats.learning}</div>
                  <div className="text-sm text-white/60">学习中</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-card p-4">
                  <div className="text-2xl font-bold text-blue-400">{stats.beginner}</div>
                  <div className="text-sm text-white/60">初级</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-card p-4">
                  <div className="text-2xl font-bold text-yellow-400">{stats.intermediate}</div>
                  <div className="text-sm text-white/60">中级</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-card p-4">
                  <div className="text-2xl font-bold text-red-400">{stats.advanced}</div>
                  <div className="text-sm text-white/60">高级</div>
                </div>
              </div>
              <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Panel - Filters & List */}
            <div className="lg:col-span-2">
              {/* Search & Filters */}
              <div className="mb-6 space-y-4">
                {/* Search Bar */}
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

                {/* Filters */}
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

              {/* Word List */}
              <div className="space-y-3">
                {filteredWords.map((word) => (
                  <button
                    key={word.id}
                    onClick={() => setSelectedWord(word)}
                    className={`w-full rounded-xl border p-4 text-left transition-all ${
                      selectedWord?.id === word.id
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
                        <div className="flex items-center gap-3 text-sm text-white/60">
                          <span className="rounded bg-white/10 px-2 py-0.5">
                            {word.partOfSpeech}
                          </span>
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

            {/* Right Panel - Word Details */}
            <div className="lg:col-span-1">
              {selectedWord ? (
                <div className="sticky top-20 space-y-6">
                  {/* Word Details Card */}
                  <div className="rounded-2xl border border-white/10 bg-card p-6">
                    <h2 className="mb-4 text-2xl font-bold text-white">
                      {selectedWord.word}
                    </h2>
                    <div className="mb-4 text-lg text-white/70">
                      {selectedWord.translation}
                    </div>

                    <div className="mb-6 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-white/60">词性:</span>
                        <span className="text-white">{selectedWord.partOfSpeech}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/60">难度:</span>
                        <span className="text-white">
                          {selectedWord.difficulty === "beginner" && "初级"}
                          {selectedWord.difficulty === "intermediate" && "中级"}
                          {selectedWord.difficulty === "advanced" && "高级"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/60">复习次数:</span>
                        <span className="text-white">{selectedWord.reviewCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/60">保存日期:</span>
                        <span className="text-white">{selectedWord.savedDate}</span>
                      </div>
                    </div>

                    <div className="mb-6 border-t border-white/10 pt-6">
                      <h3 className="mb-2 font-semibold text-white">释义</h3>
                      <p className="text-sm leading-relaxed text-white/70">
                        {selectedWord.definition}
                      </p>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                      <h3 className="mb-3 font-semibold text-white">例句</h3>
                      <div className="space-y-4">
                        {selectedWord.examples.map((example, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-white/5 p-3"
                          >
                            <p className="mb-1 text-sm text-white">
                              {example.text}
                            </p>
                            <p className="mb-2 text-sm text-white/60">
                              {example.translation}
                            </p>
                            <p className="text-xs text-white/40">
                              来源: {example.source}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button className="w-full rounded-lg bg-secondary px-4 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90">
                      标记为已掌握
                    </button>
                    <button className="w-full rounded-lg border border-white/20 px-4 py-3 font-semibold text-white transition-all hover:bg-white/10">
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

      {/* Export Section */}
      <section className="w-full border-t border-white/10 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-6 text-2xl font-bold text-white">导出选项</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-card p-6">
              <h3 className="mb-2 font-semibold text-white">导出到 Anki</h3>
              <p className="mb-4 text-sm text-white/60">
                将您的词汇导出为 Anki 卡片，包含例句和音频
              </p>
              <button className="w-full rounded-lg bg-secondary px-4 py-2 font-semibold text-secondary-foreground transition-all hover:opacity-90">
                生成 Anki 卡片包
              </button>
            </div>

            <div className="rounded-xl border border-white/10 bg-card p-6">
              <h3 className="mb-2 font-semibold text-white">导出为 CSV</h3>
              <p className="mb-4 text-sm text-white/60">
                导出为 CSV 文件，方便在其他应用中使用
              </p>
              <button className="w-full rounded-lg border border-white/20 px-4 py-2 font-semibold text-white transition-all hover:bg-white/10">
                下载 CSV 文件
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
