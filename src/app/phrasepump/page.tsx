"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { PlayIcon } from "@/components/icons";
import { useSavedWords } from "@/hooks/useStore";
import { logActivity, SavedWord } from "@/lib/storage";

type Sentence = {
  id: string;
  text: string;
  translation: string;
  words: string[];
  source: string;
};

function buildSentences(savedWords: SavedWord[]): Sentence[] {
  const result: Sentence[] = [];
  savedWords.forEach((w) => {
    w.examples.forEach((ex, idx) => {
      result.push({
        id: `${w.word}-${idx}`,
        text: ex.text,
        translation: ex.translation,
        words: [w.word],
        source: ex.source || "已保存词汇",
      });
    });
  });
  return result;
}

export default function PhrasePumpPage() {
  const savedWords = useSavedWords();
  const sentences = useMemo(() => buildSentences(savedWords), [savedWords]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const loggedRef = useRef(false);

  const currentSentence = sentences[currentIndex];
  const progress = sentences.length > 0 ? ((currentIndex + 1) / sentences.length) * 100 : 0;

  useEffect(() => {
    if (currentIndex >= sentences.length && sentences.length > 0 && !loggedRef.current) {
      loggedRef.current = true;
      logActivity({
        type: "phrasepump",
        title: `完成 PhrasePump 练习（${sentences.length} 句）`,
        description: "听力练习完成",
        link: "/phrasepump",
        metadata: { wordsLearned: sentences.length },
      });
    }
  }, [currentIndex, sentences.length]);

  const handlePlay = () => {
    if (!currentSentence) return;
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("您的浏览器不支持语音合成。");
      return;
    }
    setIsPlaying(true);
    const utter = new SpeechSynthesisUtterance(currentSentence.text);
    utter.lang = "en-US";
    utter.rate = 0.9;
    utter.onend = () => setIsPlaying(false);
    utter.onerror = () => setIsPlaying(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      setCompletedCount(completedCount + 1);
      setCurrentIndex(currentIndex + 1);
      setShowTranslation(false);
      setIsPlaying(false);
    } else {
      setCompletedCount(completedCount + 1);
      setCurrentIndex(sentences.length);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowTranslation(false);
      setIsPlaying(false);
    }
  };

  const handleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Empty state
  if (sentences.length === 0) {
    return (
      <main className="min-h-screen bg-background pt-[56px]">
        <section className="w-full border-b border-white/10 py-8">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-4xl leading-none">⛽</span>
                  <h1 className="text-3xl font-bold text-white md:text-4xl">PhrasePump</h1>
                </div>
                <p className="text-white/70">
                  听力练习工具 - 通过包含已保存词汇的句子来提升您的听力理解能力
                </p>
              </div>
              <button
                onClick={handleFullscreen}
                title="全屏"
                className="shrink-0 rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition-all hover:bg-white/10"
              >
                <span className="mr-1">⛶</span>Fullscreen
              </button>
            </div>
          </div>
        </section>

        <section className="w-full py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <div className="mb-6 text-6xl">📭</div>
            <h2 className="mb-3 text-2xl font-bold text-white">尚无可练习的句子</h2>
            <p className="mb-6 text-white/70">
              在播放器观看视频时保存带例句的词汇，或在视频详情页保存学习列表。
              PhrasePump 会自动从你的词汇库挑选包含例句的词汇生成练习。
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/catalog"
                className="rounded-lg bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90"
              >
                浏览视频内容
              </Link>
              <Link
                href="/saved-items"
                className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
              >
                查看词汇库
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Completion state
  if (currentIndex >= sentences.length) {
    return (
      <main className="min-h-screen bg-background pt-[56px]">
        <section className="w-full py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <div className="mb-6 text-6xl">🎉</div>
            <h1 className="mb-4 text-4xl font-bold text-white">练习完成！</h1>
            <p className="mb-8 text-xl text-white/70">
              您完成了本次 {sentences.length} 句的听力练习
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setCompletedCount(0);
                  setShowTranslation(false);
                  loggedRef.current = false;
                }}
                className="rounded-lg bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90"
              >
                再次练习
              </button>
              <Link
                href="/dashboard"
                className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
              >
                查看仪表板
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      <section className="w-full border-b border-white/10 py-8">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="text-4xl leading-none">⛽</span>
                <h1 className="text-3xl font-bold text-white md:text-4xl">PhrasePump</h1>
              </div>
              <p className="text-white/70">
                {sentences.length} 句听力练习 · 使用浏览器 TTS 朗读
              </p>
            </div>
            <button
              onClick={handleFullscreen}
              title="全屏"
              className="shrink-0 rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition-all hover:bg-white/10"
            >
              <span className="mr-1">⛶</span>Fullscreen
            </button>
          </div>
        </div>
      </section>

      <section className="w-full border-b border-white/10 py-4">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-2 flex items-center justify-between text-sm text-white/60">
            <span>进度</span>
            <span>
              {currentIndex + 1} / {sentences.length}
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

      <section className="w-full py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-8 rounded-2xl border border-white/10 bg-card p-8">
            <div className="mb-6 text-sm text-white/50">来源: {currentSentence.source}</div>

            <div className="mb-8 flex items-center justify-center">
              <button
                onClick={handlePlay}
                className={`flex h-20 w-20 items-center justify-center rounded-full transition-all ${
                  isPlaying ? "bg-secondary/80" : "bg-secondary hover:bg-secondary/90"
                }`}
                title="播放"
              >
                <PlayIcon className="h-10 w-10 text-secondary-foreground" />
              </button>
            </div>

            <div className="mb-6 text-center">
              <p className="mb-4 text-2xl leading-relaxed text-white">
                {currentSentence.text.split(/\s+/).map((word, idx) => {
                  const cleaned = word.replace(/[.,!?]/g, "").toLowerCase();
                  const highlighted = currentSentence.words.some((w) => w.toLowerCase() === cleaned);
                  return (
                    <span
                      key={idx}
                      className={
                        highlighted
                          ? "cursor-pointer rounded bg-secondary/30 px-1 hover:bg-secondary/50"
                          : ""
                      }
                    >
                      {word}{" "}
                    </span>
                  );
                })}
              </p>

              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="text-sm text-white/60 hover:text-white"
              >
                {showTranslation ? "隐藏翻译" : "显示翻译"}
              </button>

              {showTranslation && currentSentence.translation && (
                <p className="mt-4 text-lg text-white/70">{currentSentence.translation}</p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="rounded-lg border border-white/20 px-6 py-2 font-semibold text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                ← 上一句
              </button>
              <div className="text-sm text-white/50">
                完成 {completedCount} / {sentences.length}
              </div>
              <button
                onClick={handleNext}
                className="rounded-lg bg-secondary px-6 py-2 font-semibold text-secondary-foreground transition-all hover:opacity-90"
              >
                {currentIndex === sentences.length - 1 ? "完成" : "下一句 →"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-card p-4 text-center text-sm text-white/60">
            💡 点击播放按钮听句子，不看翻译先理解，点击&ldquo;显示翻译&rdquo;对照检查。
          </div>
        </div>
      </section>
    </main>
  );
}
