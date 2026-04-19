"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { useSavedWords } from "@/hooks/useStore";
import { recordReview, logActivity, SavedWord } from "@/lib/storage";

type ReviewMode = "flashcard" | "typing" | "listening";

function previewInterval(card: SavedWord, rating: "again" | "hard" | "good" | "easy"): number {
  const { interval, repetitions, easeFactor } = card.srs;
  if (rating === "again") return 1;
  if (rating === "hard") return Math.max(1, Math.round(interval * 1.2));
  if (rating === "good") {
    const newReps = repetitions + 1;
    if (newReps === 1) return 1;
    if (newReps === 2) return 6;
    return Math.round(interval * easeFactor);
  }
  const newReps = repetitions + 1;
  if (newReps === 1) return 4;
  return Math.round(interval * easeFactor * 1.3);
}

export default function ReviewPage() {
  const savedWords = useSavedWords();
  const [reviewMode, setReviewMode] = useState<ReviewMode | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [sessionQueue, setSessionQueue] = useState<SavedWord[]>([]);

  const dueCards = useMemo(
    () =>
      savedWords.filter(
        // eslint-disable-next-line
        (w) => new Date(w.srs.nextReviewDate).getTime() <= Date.now()
      ),
    [savedWords]
  );

  const mastered = useMemo(
    () => savedWords.filter((w) => w.mastered).length,
    [savedWords]
  );
  const learning = savedWords.length - mastered;

  const currentCard = sessionQueue[currentCardIndex];
  const progress =
    sessionQueue.length > 0
      ? ((currentCardIndex + 1) / sessionQueue.length) * 100
      : 0;

  const startSession = (mode: ReviewMode) => {
    setSessionQueue([...dueCards]);
    setStartTime(new Date());
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 });
    setIsComplete(false);
    setReviewMode(mode);
  };

  const handleRating = (rating: "again" | "hard" | "good" | "easy") => {
    if (!currentCard) return;

    recordReview(currentCard.word, rating);
    setSessionStats((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));

    if (currentCardIndex < sessionQueue.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      const reviewed = currentCardIndex + 1;
      logActivity({
        type: "word",
        title: `完成词汇复习（${reviewed} 个）`,
        description: `本次复习了 ${reviewed} 个单词`,
        link: "/review",
        metadata: { wordsLearned: reviewed },
      });
      setIsComplete(true);
    }
  };

  const handleFlipCard = () => setShowAnswer(!showAnswer);

  useEffect(() => {
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

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showAnswer, currentCardIndex, reviewMode, isComplete]);

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

            <div className="mb-12 grid gap-6 md:grid-cols-3">
              <Stat label="待复习词汇" value={dueCards.length} icon="📚" />
              <Stat label="已掌握词汇" value={mastered} icon="✅" color="text-green-400" />
              <Stat label="学习中" value={learning} icon="🔄" color="text-secondary" />
            </div>

            <div className="space-y-4">
              <h2 className="mb-6 text-2xl font-bold text-white">选择复习模式</h2>

              <ModeButton
                icon="🎴"
                title="闪卡模式"
                description="经典的闪卡复习，翻转查看答案"
                disabled={dueCards.length === 0}
                onClick={() => startSession("flashcard")}
                tags={["适合快速复习", "支持键盘快捷键", "SRS 算法优化"]}
              />

              <ModeButton
                icon="⌨️"
                title="拼写模式"
                description="输入单词拼写，加强记忆"
                disabled={dueCards.length === 0}
                onClick={() => startSession("typing")}
                tags={["强化记忆", "自动评分", "支持回车提交"]}
              />

              <ModeButton
                icon="🎧"
                title="听力模式"
                description="听音频，输入或辨识单词"
                disabled={dueCards.length === 0}
                onClick={() => startSession("listening")}
                tags={["浏览器 TTS", "强化听力", "配合闪卡使用"]}
              />
            </div>

            {savedWords.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-white/10 bg-card p-6 text-center">
                <div className="mb-2 text-4xl">📭</div>
                <h3 className="mb-2 text-xl font-bold text-white">词汇库是空的</h3>
                <p className="mb-4 text-white/70">
                  从播放器、文本分析或字幕中先保存一些单词吧
                </p>
                <Link
                  href="/catalog"
                  className="inline-block rounded-lg bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90"
                >
                  浏览内容
                </Link>
              </div>
            ) : dueCards.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-green-500/50 bg-green-500/10 p-6 text-center">
                <div className="mb-2 text-4xl">🎉</div>
                <h3 className="mb-2 text-xl font-bold text-white">太棒了！</h3>
                <p className="text-white/70">
                  您已完成今天的所有复习任务。明天再来吧！
                </p>
              </div>
            ) : null}

            <div className="mt-8 text-center">
              <Link href="/saved-items" className="text-secondary hover:underline">
                ← 返回词汇列表
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (isComplete) {
    const endTime = new Date();
    const duration = Math.max(
      1,
      Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60)
    );
    const totalReviewed = Object.values(sessionStats).reduce((a, b) => a + b, 0);

    return (
      <main className="min-h-screen bg-background pt-[56px]">
        <section className="w-full py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <div className="mb-8">
              <div className="mb-4 text-6xl">🎉</div>
              <h1 className="mb-4 text-4xl font-bold text-white">复习完成！</h1>
              <p className="text-xl text-white/70">您已完成本次复习，继续保持！</p>
            </div>

            <div className="mb-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <div className="text-3xl font-bold text-white">{totalReviewed}</div>
                <div className="text-sm text-white/60">复习词汇数</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <div className="text-3xl font-bold text-white">{duration}</div>
                <div className="text-sm text-white/60">用时（分钟）</div>
              </div>
            </div>

            <div className="mb-8 rounded-2xl border border-white/10 bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">评分分布</h3>
              <div className="grid grid-cols-4 gap-4">
                <StatCell color="text-red-400" value={sessionStats.again} label="重来" />
                <StatCell color="text-yellow-400" value={sessionStats.hard} label="困难" />
                <StatCell color="text-green-400" value={sessionStats.good} label="良好" />
                <StatCell color="text-blue-400" value={sessionStats.easy} label="简单" />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setReviewMode(null);
                }}
                className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
              >
                返回
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

  if (!currentCard) {
    return (
      <main className="min-h-screen bg-background pt-[56px]">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center text-white/60">
          加载中...
        </div>
      </main>
    );
  }

  if (reviewMode === "flashcard") {
    return (
      <FlashcardUI
        card={currentCard}
        index={currentCardIndex}
        total={sessionQueue.length}
        progress={progress}
        showAnswer={showAnswer}
        onFlip={handleFlipCard}
        onRate={handleRating}
      />
    );
  }

  if (reviewMode === "typing") {
    return (
      <TypingUI
        key={currentCard.word}
        card={currentCard}
        index={currentCardIndex}
        total={sessionQueue.length}
        progress={progress}
        onRate={handleRating}
      />
    );
  }

  if (reviewMode === "listening") {
    return (
      <ListeningUI
        key={currentCard.word}
        card={currentCard}
        index={currentCardIndex}
        total={sessionQueue.length}
        progress={progress}
        onRate={handleRating}
      />
    );
  }

  return null;
}

function Stat({
  label,
  value,
  icon,
  color = "text-white",
}: {
  label: string;
  value: number;
  icon: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-6">
      <div className="mb-2 text-3xl">{icon}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-white/60">{label}</div>
    </div>
  );
}

function StatCell({ color, value, label }: { color: string; value: number; label: string }) {
  return (
    <div>
      <div className={`mb-1 text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-white/60">{label}</div>
    </div>
  );
}

function ModeButton({
  icon,
  title,
  description,
  disabled,
  onClick,
  tags,
}: {
  icon: string;
  title: string;
  description: string;
  disabled: boolean;
  onClick: () => void;
  tags: string[];
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group w-full rounded-2xl border border-white/10 bg-card p-6 text-left transition-all hover:border-secondary hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-white/10"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{icon}</span>
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-secondary">
              {title}
            </h3>
            <p className="text-sm text-white/60">{description}</p>
          </div>
        </div>
        <ChevronRightIcon className="h-6 w-6 text-white/40 transition-transform group-hover:translate-x-1" />
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-white/50">
        {tags.map((t) => (
          <span key={t}>• {t}</span>
        ))}
      </div>
    </button>
  );
}

function ProgressBar({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: number;
}) {
  return (
    <section className="w-full border-b border-white/10 py-4">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-2 flex items-center justify-between text-sm text-white/60">
          <span>复习进度</span>
          <span>
            {index + 1} / {total}
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
  );
}

function RatingButtons({
  card,
  onRate,
}: {
  card: SavedWord;
  onRate: (r: "again" | "hard" | "good" | "easy") => void;
}) {
  return (
    <div className="mt-8 grid grid-cols-4 gap-4">
      <button
        onClick={() => onRate("again")}
        className="group rounded-xl border border-red-500/50 bg-red-500/10 p-4 transition-all hover:bg-red-500/20"
      >
        <div className="mb-1 text-2xl font-bold text-red-400">重来</div>
        <div className="text-xs text-red-400/70">&lt; 1 天</div>
        <div className="mt-2 text-xs text-white/40">按键: 1</div>
      </button>
      <button
        onClick={() => onRate("hard")}
        className="group rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-4 transition-all hover:bg-yellow-500/20"
      >
        <div className="mb-1 text-2xl font-bold text-yellow-400">困难</div>
        <div className="text-xs text-yellow-400/70">{previewInterval(card, "hard")} 天</div>
        <div className="mt-2 text-xs text-white/40">按键: 2</div>
      </button>
      <button
        onClick={() => onRate("good")}
        className="group rounded-xl border border-green-500/50 bg-green-500/10 p-4 transition-all hover:bg-green-500/20"
      >
        <div className="mb-1 text-2xl font-bold text-green-400">良好</div>
        <div className="text-xs text-green-400/70">{previewInterval(card, "good")} 天</div>
        <div className="mt-2 text-xs text-white/40">按键: 3</div>
      </button>
      <button
        onClick={() => onRate("easy")}
        className="group rounded-xl border border-blue-500/50 bg-blue-500/10 p-4 transition-all hover:bg-blue-500/20"
      >
        <div className="mb-1 text-2xl font-bold text-blue-400">简单</div>
        <div className="text-xs text-blue-400/70">{previewInterval(card, "easy")} 天</div>
        <div className="mt-2 text-xs text-white/40">按键: 4</div>
      </button>
    </div>
  );
}

function FlashcardUI({
  card,
  index,
  total,
  progress,
  showAnswer,
  onFlip,
  onRate,
}: {
  card: SavedWord;
  index: number;
  total: number;
  progress: number;
  showAnswer: boolean;
  onFlip: () => void;
  onRate: (r: "again" | "hard" | "good" | "easy") => void;
}) {
  return (
    <main className="min-h-screen bg-background pt-[56px]">
      <ProgressBar index={index} total={total} progress={progress} />

      <section className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-2xl px-6">
          <div
            onClick={onFlip}
            className="cursor-pointer rounded-3xl border-2 border-white/20 bg-card p-12 shadow-2xl transition-all"
            style={{ minHeight: "400px" }}
          >
            {!showAnswer ? (
              <div className="flex h-full flex-col items-center justify-center">
                {card.partOfSpeech && (
                  <div className="mb-4 text-sm text-white/50">{card.partOfSpeech}</div>
                )}
                <h2 className="mb-8 text-center text-5xl font-bold text-white">
                  {card.word}
                </h2>
                <p className="text-center text-white/60">
                  点击或按空格键查看答案
                </p>
              </div>
            ) : (
              <div>
                {card.partOfSpeech && (
                  <div className="mb-4 text-center text-sm text-white/50">
                    {card.partOfSpeech}
                  </div>
                )}
                <h2 className="mb-4 text-center text-4xl font-bold text-white">
                  {card.word}
                </h2>
                <p className="mb-6 text-center text-2xl text-secondary">
                  {card.translation}
                </p>
                {card.definition && (
                  <p className="mb-6 text-center leading-relaxed text-white/70">
                    {card.definition}
                  </p>
                )}
                {card.examples[0] && (
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="mb-1 text-sm text-white">{card.examples[0].text}</p>
                    {card.examples[0].translation && (
                      <p className="text-sm text-white/60">
                        {card.examples[0].translation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {showAnswer && <RatingButtons card={card} onRate={onRate} />}
        </div>
      </section>
    </main>
  );
}

function TypingUI({
  card,
  index,
  total,
  progress,
  onRate,
}: {
  card: SavedWord;
  index: number;
  total: number;
  progress: number;
  onRate: (r: "again" | "hard" | "good" | "easy") => void;
}) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"input" | "correct" | "wrong">("input");

  const submit = () => {
    if (status !== "input") return;
    const correct = input.trim().toLowerCase() === card.word.toLowerCase();
    setStatus(correct ? "correct" : "wrong");
  };

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      <ProgressBar index={index} total={total} progress={progress} />

      <section className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-2xl px-6">
          <div className="rounded-3xl border-2 border-white/20 bg-card p-12 text-center">
            <div className="mb-6 text-lg text-white/60">拼写这个单词：</div>
            <div className="mb-4 text-3xl font-bold text-secondary">{card.translation}</div>
            {card.definition && (
              <p className="mb-6 text-sm text-white/60">{card.definition}</p>
            )}

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              disabled={status !== "input"}
              autoFocus
              placeholder="输入单词..."
              className={`mb-4 w-full rounded-xl border-2 bg-background px-4 py-3 text-center text-xl font-semibold text-white outline-none transition-all ${
                status === "correct"
                  ? "border-green-500"
                  : status === "wrong"
                    ? "border-red-500"
                    : "border-white/20 focus:border-secondary"
              }`}
            />

            {status === "input" ? (
              <button
                onClick={submit}
                disabled={!input.trim()}
                className="rounded-lg bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90 disabled:opacity-30"
              >
                检查
              </button>
            ) : (
              <div className="space-y-4">
                <div className={`text-lg font-semibold ${status === "correct" ? "text-green-400" : "text-red-400"}`}>
                  {status === "correct" ? "✓ 正确！" : `✗ 正确答案：${card.word}`}
                </div>
              </div>
            )}
          </div>

          {status !== "input" && <RatingButtons card={card} onRate={onRate} />}
        </div>
      </section>
    </main>
  );
}

function ListeningUI({
  card,
  index,
  total,
  progress,
  onRate,
}: {
  card: SavedWord;
  index: number;
  total: number;
  progress: number;
  onRate: (r: "again" | "hard" | "good" | "easy") => void;
}) {
  const [revealed, setRevealed] = useState(false);

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(card.word);
    utter.lang = "en-US";
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  };

  useEffect(() => {
    const t = setTimeout(speak, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      <ProgressBar index={index} total={total} progress={progress} />

      <section className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-2xl px-6">
          <div className="rounded-3xl border-2 border-white/20 bg-card p-12 text-center">
            <div className="mb-8 text-lg text-white/60">听音频，辨识单词</div>

            <button
              onClick={speak}
              className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-4xl text-secondary-foreground transition-all hover:scale-110 mx-auto"
              title="播放"
            >
              🔊
            </button>

            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
              >
                显示答案
              </button>
            ) : (
              <div>
                <div className="mb-2 text-4xl font-bold text-white">{card.word}</div>
                <div className="mb-4 text-xl text-secondary">{card.translation}</div>
                {card.definition && (
                  <p className="text-sm text-white/60">{card.definition}</p>
                )}
              </div>
            )}
          </div>

          {revealed && <RatingButtons card={card} onRate={onRate} />}
        </div>
      </section>
    </main>
  );
}
