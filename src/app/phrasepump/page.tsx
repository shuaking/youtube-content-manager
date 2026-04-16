"use client";

import { useState } from "react";
import { PlayIcon, ChevronRightIcon } from "@/components/icons";

const mockSentences = [
  {
    id: 1,
    text: "The weather is beautiful today.",
    translation: "今天天气很好。",
    words: [
      { text: "weather", saved: true, difficulty: "intermediate" },
      { text: "beautiful", saved: true, difficulty: "beginner" },
    ],
    audio: "/audio/sentence1.mp3",
    source: "Netflix - Friends S01E01",
  },
  {
    id: 2,
    text: "I'm learning a new language every day.",
    translation: "我每天都在学习一门新语言。",
    words: [
      { text: "learning", saved: true, difficulty: "beginner" },
      { text: "language", saved: true, difficulty: "intermediate" },
    ],
    audio: "/audio/sentence2.mp3",
    source: "YouTube - Language Learning Tips",
  },
  {
    id: 3,
    text: "Practice makes perfect.",
    translation: "熟能生巧。",
    words: [
      { text: "practice", saved: true, difficulty: "beginner" },
      { text: "perfect", saved: false, difficulty: "intermediate" },
    ],
    audio: "/audio/sentence3.mp3",
    source: "Netflix - The Crown S02E03",
  },
];

export default function PhrasePumpPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const currentSentence = mockSentences[currentIndex];
  const progress = ((currentIndex + 1) / mockSentences.length) * 100;

  const handleNext = () => {
    if (currentIndex < mockSentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowTranslation(false);
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowTranslation(false);
      setIsPlaying(false);
    }
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    // Mock audio playback
    setTimeout(() => setIsPlaying(false), 2000);
  };

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      {/* Header */}
      <section className="w-full border-b border-white/10 py-8">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-4xl leading-none">⛽</span>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              PhrasePump
            </h1>
          </div>
          <p className="text-white/70">
            听力练习工具 - 通过包含已保存词汇的句子来提升您的听力理解能力
          </p>
        </div>
      </section>

      {/* Progress Bar */}
      <section className="w-full border-b border-white/10 py-4">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-2 flex items-center justify-between text-sm text-white/60">
            <span>进度</span>
            <span>
              {currentIndex + 1} / {mockSentences.length}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-secondary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </section>

      {/* Main Practice Area */}
      <section className="w-full py-12">
        <div className="mx-auto max-w-4xl px-6">
          {/* Sentence Card */}
          <div className="mb-8 rounded-2xl border border-white/10 bg-card p-8">
            {/* Source */}
            <div className="mb-6 text-sm text-white/50">
              来源: {currentSentence.source}
            </div>

            {/* Audio Player */}
            <div className="mb-8 flex items-center justify-center">
              <button
                onClick={handlePlay}
                className={`flex h-20 w-20 items-center justify-center rounded-full transition-all ${
                  isPlaying
                    ? "bg-secondary/80"
                    : "bg-secondary hover:bg-secondary/90"
                }`}
              >
                <PlayIcon className="h-10 w-10 text-secondary-foreground" />
              </button>
            </div>

            {/* Sentence Text */}
            <div className="mb-6 text-center">
              <p className="mb-4 text-2xl leading-relaxed text-white">
                {currentSentence.text.split(" ").map((word, idx) => {
                  const savedWord = currentSentence.words.find(
                    (w) => w.text.toLowerCase() === word.toLowerCase().replace(/[.,!?]/g, "")
                  );
                  return (
                    <span
                      key={idx}
                      className={`${
                        savedWord
                          ? "cursor-pointer rounded bg-secondary/30 px-1 hover:bg-secondary/50"
                          : ""
                      }`}
                    >
                      {word}{" "}
                    </span>
                  );
                })}
              </p>

              {/* Translation Toggle */}
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="text-sm text-white/60 hover:text-white"
              >
                {showTranslation ? "隐藏翻译" : "显示翻译"}
              </button>

              {showTranslation && (
                <p className="mt-4 text-lg text-white/70">
                  {currentSentence.translation}
                </p>
              )}
            </div>

            {/* Vocabulary List */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="mb-4 text-sm font-semibold text-white/80">
                本句中的已保存词汇
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentSentence.words
                  .filter((w) => w.saved)
                  .map((word, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-white/10 px-3 py-1 text-sm text-white"
                    >
                      {word.text}
                      <span className="ml-2 text-xs text-white/50">
                        {word.difficulty === "beginner" && "初级"}
                        {word.difficulty === "intermediate" && "中级"}
                        {word.difficulty === "advanced" && "高级"}
                      </span>
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              ← 上一句
            </button>

            <div className="flex gap-4">
              <button className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10">
                跳过
              </button>
              <button className="rounded-lg bg-white/10 px-6 py-3 font-semibold text-white transition-all hover:bg-white/20">
                标记为困难
              </button>
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === mockSentences.length - 1}
              className="group rounded-lg bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90 disabled:opacity-30"
            >
              <span className="flex items-center gap-2">
                下一句
                <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Settings Panel */}
      <section className="w-full border-t border-white/10 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-6 text-2xl font-bold text-white">练习设置</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-card p-6">
              <h3 className="mb-2 font-semibold text-white">难度级别</h3>
              <p className="mb-4 text-sm text-white/60">
                选择句子的难度范围
              </p>
              <select className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white outline-none">
                <option>所有级别</option>
                <option>初级</option>
                <option>中级</option>
                <option>高级</option>
              </select>
            </div>

            <div className="rounded-xl border border-white/10 bg-card p-6">
              <h3 className="mb-2 font-semibold text-white">播放速度</h3>
              <p className="mb-4 text-sm text-white/60">
                调整音频播放速度
              </p>
              <select className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white outline-none">
                <option>0.5x</option>
                <option>0.75x</option>
                <option selected>1.0x</option>
                <option>1.25x</option>
              </select>
            </div>

            <div className="rounded-xl border border-white/10 bg-card p-6">
              <h3 className="mb-2 font-semibold text-white">自动播放</h3>
              <p className="mb-4 text-sm text-white/60">
                切换到下一句时自动播放音频
              </p>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="h-5 w-5" />
                <span className="text-white/80">启用自动播放</span>
              </label>
            </div>

            <div className="rounded-xl border border-white/10 bg-card p-6">
              <h3 className="mb-2 font-semibold text-white">每日目标</h3>
              <p className="mb-4 text-sm text-white/60">
                设置每天要练习的句子数量
              </p>
              <input
                type="number"
                defaultValue="20"
                min="5"
                max="100"
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white outline-none"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
