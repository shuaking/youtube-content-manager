"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { isSaved, saveWord, unsaveWord, logActivity } from "@/lib/storage";
import { useSavedWords } from "@/hooks/useStore";

type AnalyzedWord = {
  word: string;
  translation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  frequency: number;
};

type TextAnalysis = {
  totalWords: number;
  uniqueWords: number;
  sentences: number;
  avgDifficulty: string;
  readingTime: number;
  words: AnalyzedWord[];
};

// Basic English frequency list — top CEFR A1/A2 and common words
const BEGINNER_WORDS = new Set([
  "the","a","an","and","or","but","if","of","to","in","on","at","for","with","by",
  "is","are","was","were","be","been","being","am","do","does","did","have","has","had",
  "i","you","he","she","it","we","they","me","him","her","us","them","my","your","his","our","their","its",
  "this","that","these","those","there","here","what","when","where","who","why","how","which","whose",
  "not","no","yes","all","any","some","no","none","each","every",
  "good","bad","big","small","new","old","happy","sad","easy","hard","hot","cold","young","high","low",
  "go","come","see","know","think","get","make","take","want","like","love","need","use","find","give",
  "man","woman","boy","girl","child","people","family","friend","home","house","day","night","year","time","week","month",
  "work","play","run","walk","eat","drink","sleep","talk","read","write","listen","watch","learn","teach",
  "water","food","bread","fish","meat","milk","tea","coffee","juice","wine",
  "red","blue","green","yellow","black","white","orange","pink","purple","brown",
  "one","two","three","four","five","six","seven","eight","nine","ten",
  "very","really","too","much","many","more","most","less","least","first","last","next",
  "weather","beautiful","learning","language","practice","perfect","wonderful","happy","simple","together",
]);

const INTERMEDIATE_WORDS = new Set([
  "however","although","because","therefore","moreover","furthermore","nevertheless","consequently",
  "despite","nonetheless","meanwhile","whereas","whether","regardless","otherwise","somehow",
  "consider","determine","establish","indicate","maintain","provide","require","suggest","demonstrate",
  "significant","essential","specific","particular","relevant","appropriate","adequate","sufficient",
  "opportunity","environment","development","experience","technology","government","education","community",
  "atmosphere","condition","situation","relationship","perspective","assumption","foundation","structure",
]);

function analyzeText(text: string): TextAnalysis {
  const cleaned = text.replace(/[^\w\s'-]/g, " ");
  const tokens = cleaned
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 2 && /[a-z]/.test(w))
    .map((w) => w.replace(/^'+|'+$/g, ""));

  const freq: Record<string, number> = {};
  tokens.forEach((w) => {
    freq[w] = (freq[w] || 0) + 1;
  });

  const classify = (w: string): "beginner" | "intermediate" | "advanced" => {
    if (BEGINNER_WORDS.has(w)) return "beginner";
    if (INTERMEDIATE_WORDS.has(w)) return "intermediate";
    if (w.length >= 10) return "advanced";
    if (w.length >= 7) return "intermediate";
    return "beginner";
  };

  const uniqueWordEntries = Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .map(([word, frequency]) => ({
      word,
      translation: "",
      difficulty: classify(word),
      frequency,
    }));

  const sentenceSplits = text.split(/[.!?。！？]+/).filter((s) => s.trim().length > 0);
  const difficultyScore: Record<string, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
  };
  const avgScore =
    uniqueWordEntries.reduce((acc, w) => acc + difficultyScore[w.difficulty], 0) /
    (uniqueWordEntries.length || 1);

  const avgDifficulty = avgScore < 1.5 ? "初级" : avgScore < 2.3 ? "中级" : "高级";

  return {
    totalWords: tokens.length,
    uniqueWords: uniqueWordEntries.length,
    sentences: sentenceSplits.length,
    avgDifficulty,
    readingTime: Math.max(1, Math.round(tokens.length / 200)),
    words: uniqueWordEntries,
  };
}

export default function TextPage() {
  const savedWords = useSavedWords();
  const [activeTab, setActiveTab] = useState<
    "youtube" | "netflix" | "books" | "fsi" | "media" | "podcast" | "mytext" | "resources"
  >("mytext");
  const [inputText, setInputText] = useState("");
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedWord, setSelectedWord] = useState<AnalyzedWord | null>(null);

  const savedSet = useMemo(
    () => new Set(savedWords.map((w) => w.word.toLowerCase())),
    [savedWords]
  );

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzeText(inputText);
      setAnalysis(result);
      setIsAnalyzing(false);
      logActivity({
        type: "text",
        title: "文本分析",
        description: `分析 ${result.totalWords} 个词汇，${result.uniqueWords} 个独特词`,
        link: "/text",
      });
    }, 600);
  };

  const handleClear = () => {
    setInputText("");
    setAnalysis(null);
    setSelectedWord(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content === "string") {
        setInputText(content);
        setAnalysis(null);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
      setAnalysis(null);
    } catch {
      alert("无法读取剪贴板。请检查浏览器权限。");
    }
  };

  const handleToggleSave = (word: AnalyzedWord) => {
    if (savedSet.has(word.word.toLowerCase())) {
      unsaveWord(word.word);
    } else {
      saveWord({
        word: word.word,
        translation: word.translation,
        difficulty: word.difficulty,
        examples: [],
      });
    }
  };

  const handleSaveAll = () => {
    if (!analysis) return;
    let count = 0;
    analysis.words.forEach((w) => {
      if (!savedSet.has(w.word.toLowerCase())) {
        saveWord({
          word: w.word,
          translation: w.translation,
          difficulty: w.difficulty,
          examples: [],
        });
        count++;
      }
    });
    if (count > 0) {
      logActivity({
        type: "word",
        title: `从文本分析保存 ${count} 个词汇`,
        description: "批量保存未掌握词汇",
        link: "/saved-items",
        metadata: { wordsLearned: count },
      });
    }
  };

  const speak = (word: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = "en-US";
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  };

  const getHighlightedText = () => {
    if (!analysis) return inputText;

    const wordMap = new Map(analysis.words.map((w) => [w.word.toLowerCase(), w]));

    return inputText.replace(/\b([a-zA-Z']+)\b/g, (match) => {
      const data = wordMap.get(match.toLowerCase());
      if (!data) return match;
      const colorClass =
        data.difficulty === "beginner"
          ? "bg-blue-500/20"
          : data.difficulty === "intermediate"
            ? "bg-yellow-500/20"
            : "bg-red-500/20";
      const savedClass = savedSet.has(data.word.toLowerCase()) ? " ring-1 ring-secondary" : "";
      return `<span class="cursor-pointer rounded px-0.5 ${colorClass}${savedClass} hover:opacity-80" data-word="${data.word}">${match}</span>`;
    });
  };

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      <section className="w-full border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex gap-2 overflow-x-auto">
              {([
                { id: "youtube", label: "YouTube" },
                { id: "netflix", label: "Netflix" },
                { id: "books", label: "图书" },
                { id: "fsi", label: "FSI/DLI" },
                { id: "media", label: "媒体文件", badge: "NEW" },
                { id: "podcast", label: "播客" },
                { id: "mytext", label: "我的文本" },
                { id: "resources", label: "学习资源" },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 font-semibold transition-all ${
                    activeTab === tab.id
                      ? "border-b-2 border-secondary text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {tab.label}
                  {"badge" in tab && (
                    <span className="ml-1 text-xs text-secondary">{tab.badge}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
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
                className="rounded-lg border border-white/20 p-2 text-white transition-all hover:bg-white/10"
              >
                <span className="text-lg">⛶</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12">
        <div className="mx-auto max-w-7xl px-6">
          {activeTab !== "mytext" ? (
            <div className="rounded-xl border border-white/10 bg-card p-12 text-center">
              <div className="mb-4 text-4xl">
                {activeTab === "youtube" && "📺"}
                {activeTab === "netflix" && "🎬"}
                {activeTab === "books" && "📚"}
                {activeTab === "fsi" && "🎓"}
                {activeTab === "media" && "🎥"}
                {activeTab === "podcast" && "🎧"}
                {activeTab === "resources" && "📖"}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">
                {activeTab === "youtube" && "YouTube 内容"}
                {activeTab === "netflix" && "Netflix 内容"}
                {activeTab === "books" && "图书内容"}
                {activeTab === "fsi" && "FSI/DLI 课程"}
                {activeTab === "media" && "媒体文件"}
                {activeTab === "podcast" && "播客内容"}
                {activeTab === "resources" && "学习资源"}
              </h3>
              <p className="text-white/60">
                请前往{" "}
                <Link href="/catalog" className="text-secondary hover:underline">
                  媒体内容页面
                </Link>{" "}
                浏览此类内容。
              </p>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="mb-6 rounded-2xl border border-white/10 bg-card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">输入文本</h2>
                    <div className="flex gap-2">
                      <label className="cursor-pointer rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10">
                        上传文件
                        <input
                          type="file"
                          accept=".txt,.md,.srt,.vtt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={handlePasteClipboard}
                        className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10"
                      >
                        粘贴剪贴板
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="在此粘贴或输入您想要分析的英文文本..."
                    className="mb-4 h-64 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-white outline-none placeholder:text-white/40 focus:border-white/20 focus:ring-2 focus:ring-secondary/50"
                  />

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white/60">{inputText.length} 字符</div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleClear}
                        disabled={!inputText}
                        className="rounded-lg border border-white/20 px-6 py-2 font-semibold text-white transition-all hover:bg-white/10 disabled:opacity-30"
                      >
                        清空
                      </button>
                      <button
                        onClick={handleAnalyze}
                        disabled={!inputText.trim() || isAnalyzing}
                        className="group flex items-center gap-2 rounded-lg bg-secondary px-6 py-2 font-semibold text-secondary-foreground transition-all hover:opacity-90 disabled:opacity-30"
                      >
                        <span>{isAnalyzing ? "分析中..." : "开始分析"}</span>
                        {!isAnalyzing && (
                          <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {analysis && (
                  <>
                    <div className="mb-6 grid gap-4 md:grid-cols-5">
                      <StatBox value={analysis.totalWords} label="总词数" />
                      <StatBox value={analysis.uniqueWords} label="不重复词" />
                      <StatBox value={analysis.sentences} label="句子数" />
                      <StatBox
                        value={analysis.avgDifficulty}
                        label="平均难度"
                        color="text-secondary"
                      />
                      <StatBox value={`${analysis.readingTime}`} label="分钟阅读" />
                    </div>

                    <div className="mb-6 rounded-2xl border border-white/10 bg-card p-6">
                      <h2 className="mb-4 text-xl font-bold text-white">高亮文本</h2>
                      <div className="mb-4 flex gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <span className="h-3 w-3 rounded bg-blue-500/30" />
                          <span className="text-white/60">初级</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-3 w-3 rounded bg-yellow-500/30" />
                          <span className="text-white/60">中级</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-3 w-3 rounded bg-red-500/30" />
                          <span className="text-white/60">高级</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-3 w-3 rounded ring-1 ring-secondary" />
                          <span className="text-white/60">已保存</span>
                        </span>
                      </div>
                      <div
                        className="leading-relaxed text-white whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          const word = target.getAttribute("data-word");
                          if (!word) return;
                          const data = analysis.words.find(
                            (w) => w.word.toLowerCase() === word.toLowerCase()
                          );
                          if (data) setSelectedWord(data);
                        }}
                      />
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-card p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">词汇列表</h2>
                        <button
                          onClick={handleSaveAll}
                          className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-all hover:opacity-90"
                        >
                          保存全部到词汇表
                        </button>
                      </div>
                      <div className="space-y-2">
                        {analysis.words.map((word) => {
                          const saved = savedSet.has(word.word.toLowerCase());
                          return (
                            <div
                              key={word.word}
                              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10"
                            >
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleToggleSave(word)}
                                  className={`flex h-6 w-6 items-center justify-center rounded border transition-all ${
                                    saved
                                      ? "border-secondary bg-secondary text-secondary-foreground"
                                      : "border-white/20 text-white/40 hover:border-white/40"
                                  }`}
                                  title={saved ? "已保存 — 点击取消" : "保存到词汇表"}
                                >
                                  {saved && "✓"}
                                </button>
                                <button
                                  onClick={() => setSelectedWord(word)}
                                  className="text-left"
                                >
                                  <span className="font-semibold text-white">{word.word}</span>
                                </button>
                                <button
                                  onClick={() => speak(word.word)}
                                  className="text-white/40 hover:text-white/80"
                                  title="朗读"
                                >
                                  🔊
                                </button>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`rounded px-2 py-0.5 text-xs ${
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
                                <span className="text-sm text-white/40">
                                  出现 {word.frequency} 次
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="lg:col-span-1">
                {selectedWord ? (
                  <div className="sticky top-20 rounded-2xl border border-white/10 bg-card p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <h2 className="text-2xl font-bold text-white">{selectedWord.word}</h2>
                      <button
                        onClick={() => speak(selectedWord.word)}
                        className="rounded-lg border border-white/20 p-2 text-white/80 transition-all hover:bg-white/10"
                        title="朗读"
                      >
                        🔊
                      </button>
                    </div>

                    <div className="mb-6 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-white/60">难度:</span>
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${
                            selectedWord.difficulty === "beginner"
                              ? "bg-blue-500/20 text-blue-400"
                              : selectedWord.difficulty === "intermediate"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {selectedWord.difficulty === "beginner" && "初级"}
                          {selectedWord.difficulty === "intermediate" && "中级"}
                          {selectedWord.difficulty === "advanced" && "高级"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/60">出现频率:</span>
                        <span className="text-white">{selectedWord.frequency} 次</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSave(selectedWord)}
                      className={`w-full rounded-lg px-4 py-3 font-semibold transition-all ${
                        savedSet.has(selectedWord.word.toLowerCase())
                          ? "border border-white/20 text-white hover:bg-white/10"
                          : "bg-secondary text-secondary-foreground hover:opacity-90"
                      }`}
                    >
                      {savedSet.has(selectedWord.word.toLowerCase())
                        ? "已保存到词汇表"
                        : "保存到词汇表"}
                    </button>
                  </div>
                ) : (
                  <div className="sticky top-20 space-y-6">
                    <div className="rounded-2xl border border-white/10 bg-card p-6">
                      <h3 className="mb-4 text-lg font-bold text-white">使用提示</h3>
                      <ul className="space-y-3 text-sm text-white/70">
                        <li className="flex gap-2">
                          <span className="text-secondary">•</span>
                          <span>粘贴任何英文文本进行分析</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-secondary">•</span>
                          <span>点击高亮词汇查看详情并朗读</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-secondary">•</span>
                          <span>勾选保存到词汇表，可在&ldquo;词汇复习&rdquo;中练习</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-secondary">•</span>
                          <span>支持上传 .txt、.srt、.vtt、.md 文件</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-secondary">•</span>
                          <span>难度基于词长和常用词列表自动识别</span>
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-card p-6">
                      <h3 className="mb-2 font-semibold text-white">支持的文本类型</h3>
                      <p className="text-sm text-white/60">
                        文章、新闻、博客、书籍章节、歌词、对话脚本、字幕文件等
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatBox({
  value,
  label,
  color = "text-white",
}: {
  value: string | number;
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
