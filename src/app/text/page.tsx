"use client";

import { useState } from "react";
import { ChevronRightIcon } from "@/components/icons";

type AnalyzedWord = {
  word: string;
  translation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  frequency: number;
  saved: boolean;
};

type TextAnalysis = {
  totalWords: number;
  uniqueWords: number;
  sentences: number;
  avgDifficulty: string;
  readingTime: number;
  words: AnalyzedWord[];
};

const mockAnalysis: TextAnalysis = {
  totalWords: 45,
  uniqueWords: 32,
  sentences: 3,
  avgDifficulty: "中级",
  readingTime: 2,
  words: [
    { word: "weather", translation: "天气", difficulty: "intermediate", frequency: 1, saved: false },
    { word: "beautiful", translation: "美丽的", difficulty: "beginner", frequency: 1, saved: false },
    { word: "learning", translation: "学习", difficulty: "beginner", frequency: 1, saved: false },
    { word: "language", translation: "语言", difficulty: "intermediate", frequency: 2, saved: false },
    { word: "practice", translation: "练习", difficulty: "beginner", frequency: 1, saved: false },
    { word: "perfect", translation: "完美的", difficulty: "intermediate", frequency: 1, saved: false },
  ],
};

export default function TextPage() {
  const [activeTab, setActiveTab] = useState<"youtube" | "netflix" | "books" | "fsi" | "media" | "podcast" | "mytext" | "resources">("mytext");
  const [inputText, setInputText] = useState("");
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedWord, setSelectedWord] = useState<AnalyzedWord | null>(null);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());

  const handleAnalyze = () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleClear = () => {
    setInputText("");
    setAnalysis(null);
    setSelectedWord(null);
  };

  const handleSaveWord = (word: string) => {
    setSavedWords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(word)) {
        newSet.delete(word);
      } else {
        newSet.add(word);
      }
      return newSet;
    });
  };

  const handleWordClick = (word: AnalyzedWord) => {
    setSelectedWord(word);
  };

  const getHighlightedText = () => {
    if (!analysis) return inputText;

    let highlighted = inputText;
    analysis.words.forEach((wordData) => {
      const regex = new RegExp(`\\b${wordData.word}\\b`, "gi");
      const colorClass =
        wordData.difficulty === "beginner"
          ? "bg-blue-500/30"
          : wordData.difficulty === "intermediate"
            ? "bg-yellow-500/30"
            : "bg-red-500/30";
      highlighted = highlighted.replace(
        regex,
        `<span class="cursor-pointer rounded px-1 ${colorClass} hover:opacity-80" data-word="${wordData.word}">$&</span>`
      );
    });
    return highlighted;
  };

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      {/* Tab Navigation */}
      <section className="w-full border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab("youtube")}
                className={`whitespace-nowrap rounded-lg px-4 py-2 font-semibold transition-all ${
                  activeTab === "youtube"
                    ? "border-b-2 border-secondary text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                YouTube
              </button>
              <button
                onClick={() => setActiveTab("netflix")}
                className={`whitespace-nowrap rounded-lg px-4 py-2 font-semibold transition-all ${
                  activeTab === "netflix"
                    ? "border-b-2 border-secondary text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Netflix
              </button>
              <button
                onClick={() => setActiveTab("books")}
                className={`whitespace-nowrap rounded-lg px-4 py-2 font-semibold transition-all ${
                  activeTab === "books"
                    ? "border-b-2 border-secondary text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                图书
              </button>
              <button
                onClick={() => setActiveTab("fsi")}
                className={`whitespace-nowrap rounded-lg px-4 py-2 font-semibold transition-all ${
                  activeTab === "fsi"
                    ? "border-b-2 border-secondary text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                FSI/DLI
              </button>
              <button
                onClick={() => setActiveTab("media")}
                className={`whitespace-nowrap rounded-lg px-4 py-2 font-semibold transition-all ${
                  activeTab === "media"
                    ? "border-b-2 border-secondary text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                媒体文件 <span className="text-xs text-secondary">NEW</span>
              </button>
              <button
                onClick={() => setActiveTab("podcast")}
                className={`whitespace-nowrap rounded-lg px-4 py-2 font-semibold transition-all ${
                  activeTab === "podcast"
                    ? "border-b-2 border-secondary text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                播客
              </button>
              <button
                onClick={() => setActiveTab("mytext")}
                className={`whitespace-nowrap rounded-lg px-4 py-2 font-semibold transition-all ${
                  activeTab === "mytext"
                    ? "border-b-2 border-secondary text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                我的文本
              </button>
              <button
                onClick={() => setActiveTab("resources")}
                className={`whitespace-nowrap rounded-lg px-4 py-2 font-semibold transition-all ${
                  activeTab === "resources"
                    ? "border-b-2 border-secondary text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                学习资源
              </button>
            </div>
            <div className="flex gap-2">
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
                此功能即将推出。您可以从各种来源导入学习材料。
              </p>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Panel - Input & Analysis */}
            <div className="lg:col-span-2">
              {/* Input Area */}
              <div className="mb-6 rounded-2xl border border-white/10 bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">输入文本</h2>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10">
                      上传文件
                    </button>
                    <button className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10">
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
                  <div className="text-sm text-white/60">
                    {inputText.length} 字符
                  </div>
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

              {/* Analysis Results */}
              {analysis && (
                <>
                  {/* Statistics */}
                  <div className="mb-6 grid gap-4 md:grid-cols-5">
                    <div className="rounded-xl border border-white/10 bg-card p-4">
                      <div className="text-2xl font-bold text-white">
                        {analysis.totalWords}
                      </div>
                      <div className="text-sm text-white/60">总词数</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-card p-4">
                      <div className="text-2xl font-bold text-white">
                        {analysis.uniqueWords}
                      </div>
                      <div className="text-sm text-white/60">不重复词</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-card p-4">
                      <div className="text-2xl font-bold text-white">
                        {analysis.sentences}
                      </div>
                      <div className="text-sm text-white/60">句子数</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-card p-4">
                      <div className="text-2xl font-bold text-secondary">
                        {analysis.avgDifficulty}
                      </div>
                      <div className="text-sm text-white/60">平均难度</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-card p-4">
                      <div className="text-2xl font-bold text-white">
                        {analysis.readingTime}
                      </div>
                      <div className="text-sm text-white/60">分钟阅读</div>
                    </div>
                  </div>

                  {/* Highlighted Text */}
                  <div className="mb-6 rounded-2xl border border-white/10 bg-card p-6">
                    <h2 className="mb-4 text-xl font-bold text-white">
                      文本分析
                    </h2>
                    <div className="mb-4 flex gap-2 text-xs">
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
                    </div>
                    <div
                      className="leading-relaxed text-white"
                      dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        const word = target.getAttribute("data-word");
                        if (word) {
                          const wordData = analysis.words.find(
                            (w) => w.word.toLowerCase() === word.toLowerCase()
                          );
                          if (wordData) handleWordClick(wordData);
                        }
                      }}
                    />
                  </div>

                  {/* Vocabulary List */}
                  <div className="rounded-2xl border border-white/10 bg-card p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white">
                        词汇列表
                      </h2>
                      <button className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-all hover:opacity-90">
                        保存全部到词汇表
                      </button>
                    </div>
                    <div className="space-y-2">
                      {analysis.words.map((word, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleSaveWord(word.word)}
                              className={`flex h-6 w-6 items-center justify-center rounded border transition-all ${
                                savedWords.has(word.word)
                                  ? "border-secondary bg-secondary text-secondary-foreground"
                                  : "border-white/20 text-white/40 hover:border-white/40"
                              }`}
                            >
                              {savedWords.has(word.word) && "✓"}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">
                                  {word.word}
                                </span>
                                <span className="text-sm text-white/60">
                                  {word.translation}
                                </span>
                              </div>
                            </div>
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
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Panel - Word Details / Tips */}
            <div className="lg:col-span-1">
              {selectedWord ? (
                <div className="sticky top-20 rounded-2xl border border-white/10 bg-card p-6">
                  <h2 className="mb-4 text-2xl font-bold text-white">
                    {selectedWord.word}
                  </h2>
                  <div className="mb-4 text-lg text-white/70">
                    {selectedWord.translation}
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
                      <span className="text-white">
                        {selectedWord.frequency} 次
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveWord(selectedWord.word)}
                    className={`w-full rounded-lg px-4 py-3 font-semibold transition-all ${
                      savedWords.has(selectedWord.word)
                        ? "border border-white/20 text-white hover:bg-white/10"
                        : "bg-secondary text-secondary-foreground hover:opacity-90"
                    }`}
                  >
                    {savedWords.has(selectedWord.word)
                      ? "已保存到词汇表"
                      : "保存到词汇表"}
                  </button>
                </div>
              ) : (
                <div className="sticky top-20 space-y-6">
                  <div className="rounded-2xl border border-white/10 bg-card p-6">
                    <h3 className="mb-4 text-lg font-bold text-white">
                      使用提示
                    </h3>
                    <ul className="space-y-3 text-sm text-white/70">
                      <li className="flex gap-2">
                        <span className="text-secondary">•</span>
                        <span>粘贴任何英文文本进行分析</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-secondary">•</span>
                        <span>点击高亮词汇查看详细信息</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-secondary">•</span>
                        <span>选择性保存生词到学习列表</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-secondary">•</span>
                        <span>支持上传 .txt 文件</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-secondary">•</span>
                        <span>自动识别词汇难度等级</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-card p-6">
                    <h3 className="mb-2 font-semibold text-white">
                      支持的文本类型
                    </h3>
                    <p className="text-sm text-white/60">
                      文章、新闻、博客、书籍章节、歌词、对话脚本等任何英文文本内容
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
