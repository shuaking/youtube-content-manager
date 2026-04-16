"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { mockReviewCards, calculateNextReview, ReviewCard } from "@/types/review";

type ReviewMode = "flashcard" | "typing" | "listening";

export default function ReviewPage() {
  const [reviewMode, setReviewMode] = useState<ReviewMode | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<string[]>([]);
  const [sessionStats, setSessionStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState(new Date());

  // Filter cards that are due for review
  const dueCards = mockReviewCards.filter(
    (card) => new Date(card.srsData.nextReviewDate) <= new Date()
  );

  const currentCard = dueCards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / dueCards.length) * 100;

  const handleRating = (rating: "again" | "hard" | "good" | "easy") => {
    if (!currentCard) return;

    // Update session stats
    setSessionStats((prev) => ({
      ...prev,
      [rating]: prev[rating] + 1,
    }));

    // Mark card as reviewed
    setReviewedCards((prev) => [...prev, currentCard.id]);

    // Calculate next review (in real app, this would update the database)
    const nextReview = calculateNextReview(
      rating,
      currentCard.srsData.interval,
      currentCard.srsData.repetitions,
      currentCard.srsData.easeFactor
    );

    console.log(`Next review for "${currentCard.word}":`, nextReview);

    // Move to next card
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleFlipCard = () => {
    setShowAnswer(!showAnswer);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!reviewMode || isComplete) return;

    if (e.key === " " && !showAnswer) {
      e.preventDefault();
      handleFlipCard();
    } else if (showAnswer) {
      if (e.key === "1") handleRating("again");
      else if (e.key === "2") handleRating("hard");
      else if (e.key === "3") handleRating("good");
      else if (e.key === "4") handleRating("easy");
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showAnswer, currentCardIndex, reviewMode, isComplete]);

  // Mode selection screen
  if (!reviewMode) {
    return (
      <main className="min-h-screen bg-background pt-[56px]">
        <section className="w-full py-20">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mb-8 text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <span className="text-5xl leading-none">🎴</span>
                <h1 className="text-4xl font-bold text-white md:text-5xl">
                  词汇复习
                </h1>
              </div>
              <p className="text-xl text-white/70">
                使用间隔重复系统（SRS）高效记忆词汇
              </p>
            </div>

            {/* Statistics */}
            <div className="mb-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <div className="mb-2 text-3xl">📚</div>
                <div className="text-3xl font-bold text-white">
                  {dueCards.length}
                </div>
                <div className="text-sm text-white/60">待复习词汇</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <div className="mb-2 text-3xl">✅</div>
                <div className="text-3xl font-bold text-green-400">
                  {mockReviewCards.filter((c) => c.srsData.repetitions >= 5).length}
                </div>
                <div className="text-sm text-white/60">已掌握词汇</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <div className="mb-2 text-3xl">🔄</div>
                <div className="text-3xl font-bold text-secondary">
                  {mockReviewCards.filter((c) => c.srsData.repetitions < 5).length}
                </div>
                <div className="text-sm text-white/60">学习中</div>
              </div>
            </div>

            {/* Mode Selection */}
            <div className="space-y-4">
              <h2 className="mb-6 text-2xl font-bold text-white">
                选择复习模式
              </h2>

              <button
                onClick={() => setReviewMode("flashcard")}
                disabled={dueCards.length === 0}
                className="group w-full rounded-2xl border border-white/10 bg-card p-6 text-left transition-all hover:border-secondary hover:shadow-lg disabled:opacity-50 disabled:hover:border-white/10"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">🎴</span>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-secondary">
                        闪卡模式
                      </h3>
                      <p className="text-sm text-white/60">
                        经典的闪卡复习，翻转查看答案
                      </p>
                    </div>
                  </div>
                  <ChevronRightIcon className="h-6 w-6 text-white/40 transition-transform group-hover:translate-x-1" />
                </div>
                <div className="flex gap-2 text-xs text-white/50">
                  <span>• 适合快速复习</span>
                  <span>• 支持键盘快捷键</span>
                  <span>• SRS 算法优化</span>
                </div>
              </button>

              <button
                disabled
                className="w-full rounded-2xl border border-white/10 bg-card p-6 text-left opacity-50"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">⌨️</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        拼写模式
                      </h3>
                      <p className="text-sm text-white/60">
                        输入单词拼写，加强记忆
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-secondary">
                    即将推出
                  </span>
                </div>
              </button>

              <button
                disabled
                className="w-full rounded-2xl border border-white/10 bg-card p-6 text-left opacity-50"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">🎧</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        听力模式
                      </h3>
                      <p className="text-sm text-white/60">
                        听音频，测试听力理解
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-secondary">
                    即将推出
                  </span>
                </div>
              </button>
            </div>

            {dueCards.length === 0 && (
              <div className="mt-8 rounded-2xl border border-green-500/50 bg-green-500/10 p-6 text-center">
                <div className="mb-2 text-4xl">🎉</div>
                <h3 className="mb-2 text-xl font-bold text-white">
                  太棒了！
                </h3>
                <p className="text-white/70">
                  您已完成今天的所有复习任务。明天再来吧！
                </p>
              </div>
            )}

            <div className="mt-8 text-center">
              <Link
                href="/saved-items"
                className="text-secondary hover:underline"
              >
                ← 返回词汇列表
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Review complete screen
  if (isComplete) {
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);
    const totalReviewed = Object.values(sessionStats).reduce((a, b) => a + b, 0);

    return (
      <main className="min-h-screen bg-background pt-[56px]">
        <section className="w-full py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <div className="mb-8">
              <div className="mb-4 text-6xl">🎉</div>
              <h1 className="mb-4 text-4xl font-bold text-white">
                复习完成！
              </h1>
              <p className="text-xl text-white/70">
                您已完成本次复习，继续保持！
              </p>
            </div>

            {/* Session Stats */}
            <div className="mb-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <div className="text-3xl font-bold text-white">
                  {totalReviewed}
                </div>
                <div className="text-sm text-white/60">复习词汇数</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <div className="text-3xl font-bold text-white">{duration}</div>
                <div className="text-sm text-white/60">用时（分钟）</div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="mb-8 rounded-2xl border border-white/10 bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                评分分布
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="mb-1 text-2xl font-bold text-red-400">
                    {sessionStats.again}
                  </div>
                  <div className="text-xs text-white/60">重来</div>
                </div>
                <div>
                  <div className="mb-1 text-2xl font-bold text-yellow-400">
                    {sessionStats.hard}
                  </div>
                  <div className="text-xs text-white/60">困难</div>
                </div>
                <div>
                  <div className="mb-1 text-2xl font-bold text-green-400">
                    {sessionStats.good}
                  </div>
                  <div className="text-xs text-white/60">良好</div>
                </div>
                <div>
                  <div className="mb-1 text-2xl font-bold text-blue-400">
                    {sessionStats.easy}
                  </div>
                  <div className="text-xs text-white/60">简单</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setReviewMode(null);
                  setCurrentCardIndex(0);
                  setShowAnswer(false);
                  setReviewedCards([]);
                  setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 });
                  setIsComplete(false);
                }}
                className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
              >
                返回首页
              </button>
              <Link
                href="/dashboard"
                className="rounded-lg bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90"
              >
                查看仪表板
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Flashcard review mode
  if (reviewMode === "flashcard" && currentCard) {
    return (
      <main className="min-h-screen bg-background pt-[56px]">
        {/* Progress Bar */}
        <section className="w-full border-b border-white/10 py-4">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mb-2 flex items-center justify-between text-sm text-white/60">
              <span>复习进度</span>
              <span>
                {currentCardIndex + 1} / {dueCards.length}
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

        {/* Flashcard */}
        <section className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
          <div className="mx-auto w-full max-w-2xl px-6">
            <div
              onClick={handleFlipCard}
              className={`group relative cursor-pointer transition-all duration-500 ${
                showAnswer ? "[transform:rotateY(180deg)]" : ""
              }`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front of card */}
              <div
                className={`rounded-3xl border-2 border-white/20 bg-card p-12 shadow-2xl transition-all ${
                  showAnswer ? "invisible" : "visible"
                }`}
                style={{
                  backfaceVisibility: "hidden",
                  minHeight: "400px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div className="mb-4 text-sm text-white/50">
                  {currentCard.partOfSpeech}
                </div>
                <h2 className="mb-8 text-center text-5xl font-bold text-white">
                  {currentCard.word}
                </h2>
                <p className="text-center text-white/60">
                  点击或按空格键查看答案
                </p>
              </div>

              {/* Back of card */}
              <div
                className={`absolute inset-0 rounded-3xl border-2 border-secondary bg-card p-12 shadow-2xl ${
                  showAnswer ? "visible" : "invisible"
                }`}
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  minHeight: "400px",
                }}
              >
                <div className="mb-4 text-center text-sm text-white/50">
                  {currentCard.partOfSpeech}
                </div>
                <h2 className="mb-4 text-center text-4xl font-bold text-white">
                  {currentCard.word}
                </h2>
                <p className="mb-6 text-center text-2xl text-secondary">
                  {currentCard.translation}
                </p>
                <p className="mb-6 text-center leading-relaxed text-white/70">
                  {currentCard.definition}
                </p>
                {currentCard.examples[0] && (
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="mb-1 text-sm text-white">
                      {currentCard.examples[0].text}
                    </p>
                    <p className="text-sm text-white/60">
                      {currentCard.examples[0].translation}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Rating Buttons */}
            {showAnswer && (
              <div className="mt-8 grid grid-cols-4 gap-4">
                <button
                  onClick={() => handleRating("again")}
                  className="group rounded-xl border border-red-500/50 bg-red-500/10 p-4 transition-all hover:bg-red-500/20"
                >
                  <div className="mb-1 text-2xl font-bold text-red-400">
                    重来
                  </div>
                  <div className="text-xs text-red-400/70">&lt; 1 天</div>
                  <div className="mt-2 text-xs text-white/40">按键: 1</div>
                </button>
                <button
                  onClick={() => handleRating("hard")}
                  className="group rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-4 transition-all hover:bg-yellow-500/20"
                >
                  <div className="mb-1 text-2xl font-bold text-yellow-400">
                    困难
                  </div>
                  <div className="text-xs text-yellow-400/70">
                    {Math.round(currentCard.srsData.interval * 1.2)} 天
                  </div>
                  <div className="mt-2 text-xs text-white/40">按键: 2</div>
                </button>
                <button
                  onClick={() => handleRating("good")}
                  className="group rounded-xl border border-green-500/50 bg-green-500/10 p-4 transition-all hover:bg-green-500/20"
                >
                  <div className="mb-1 text-2xl font-bold text-green-400">
                    良好
                  </div>
                  <div className="text-xs text-green-400/70">
                    {Math.round(
                      currentCard.srsData.interval * currentCard.srsData.easeFactor
                    )}{" "}
                    天
                  </div>
                  <div className="mt-2 text-xs text-white/40">按键: 3</div>
                </button>
                <button
                  onClick={() => handleRating("easy")}
                  className="group rounded-xl border border-blue-500/50 bg-blue-500/10 p-4 transition-all hover:bg-blue-500/20"
                >
                  <div className="mb-1 text-2xl font-bold text-blue-400">
                    简单
                  </div>
                  <div className="text-xs text-blue-400/70">
                    {Math.round(
                      currentCard.srsData.interval *
                        currentCard.srsData.easeFactor *
                        1.3
                    )}{" "}
                    天
                  </div>
                  <div className="mt-2 text-xs text-white/40">按键: 4</div>
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }

  return null;
}
