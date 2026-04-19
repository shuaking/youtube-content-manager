"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRightIcon } from "@/components/icons";
import { useChat } from "@/hooks/useStore";
import { logActivity, ChatMessage } from "@/lib/storage";

const topicCards = [
  { id: "famous", label: "著名人物", icon: "🎭" },
  { id: "psychology", label: "心理学家", icon: "🧠" },
  { id: "games", label: "游戏", icon: "🎮" },
  { id: "situations", label: "情况", icon: "💼" },
  { id: "aria", label: "只是咏叹调", icon: "🎵" },
  { id: "vocab", label: "词汇故事", icon: "📖" },
];

const topicOpeners: Record<string, string> = {
  famous: "Let's talk about famous people! Who would you like to learn about? For example: Steve Jobs, Marie Curie, or Leonardo da Vinci. Pick someone and I'll share an interesting fact in simple English.",
  psychology: "Psychology is fascinating! Would you like to explore: (1) cognitive biases (2) motivation (3) emotions (4) memory? Tell me which one interests you most.",
  games: "Games are great for language practice! What genre do you enjoy: RPG, puzzle, simulation, or multiplayer? Let's discuss your favorite.",
  situations: "Let's practice real-life situations. Choose one: ordering food at a restaurant, asking for directions, a job interview, or booking a hotel. Which shall we start with?",
  aria: "Hi! I'm Aria. We can chat about anything you like — your day, your hobbies, your dreams. What's on your mind?",
  vocab: "Great, let's learn through stories! Give me a topic (travel, food, technology, nature...) and I'll craft a short story with useful vocabulary highlighted.",
};

function generateResponse(userText: string, history: ChatMessage[]): string {
  const t = userText.toLowerCase().trim();

  if (/^(hi|hello|hey|你好|哈喽)/.test(t)) {
    return "Hi there! 👋 Great to hear from you. How would you like to practice English today — chat freely, talk about a specific topic, or practice a real-life situation?";
  }
  if (/(\?|吗$|what|how|why|when|where|who)/i.test(t)) {
    return `That's a thoughtful question. Let me think...\n\nA good way to express "${userText}" in English might involve clarifying: Are you asking about a specific example, or a general pattern?\n\nTry rephrasing more specifically, and I'll give you a concrete answer with example phrases.`;
  }
  if (/练习|practice/.test(t)) {
    return "Let's practice! I'll ask you three questions. Take your time answering each in English:\n\n1. What's your favorite way to spend a weekend?\n2. Describe a place you'd love to visit.\n3. What's a small habit that improved your life?\n\nAnswer whichever you like first!";
  }
  if (/bye|再见|拜拜/.test(t)) {
    return "Goodbye! Great chatting with you. Come back anytime to continue practicing. 👋";
  }

  const turn = history.filter((m) => m.role === "user").length;
  const encouragements = [
    "Nice! Tell me more about that.",
    "Interesting — can you give an example?",
    "I see. What made you feel that way?",
    "Got it! Try adding a detail or two.",
    "Good effort! Here's a smoother way to say it: ",
  ];
  const tip = encouragements[turn % encouragements.length];

  return `${tip}\n\nA natural way to express your idea: "${userText}" works, and you could also try:\n\n"Actually, I think ${userText.toLowerCase().replace(/\.$/, "")} because..."\n\nWant to keep going?`;
}

export default function ChatbotPage() {
  const [messages, persist] = useChat();
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<unknown>(null);
  const idCounterRef = useRef(1);
  const nextId = () => {
    idCounterRef.current += 1;
    return idCounterRef.current;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: nextId(),
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMessage];
    persist(updated);
    const submitted = inputValue;
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const assistant: ChatMessage = {
        id: nextId(),
        role: "assistant",
        content: generateResponse(submitted, updated),
        timestamp: new Date().toISOString(),
      };
      const finalList = [...updated, assistant];
      persist(finalList);
      setIsTyping(false);

      if (finalList.filter((m) => m.role === "user").length === 1) {
        logActivity({
          type: "chatbot",
          title: "开始 Aria 对话",
          description: submitted.slice(0, 60),
          link: "/chatbot",
        });
      }
    }, 900);
  };

  const handleTopicClick = (topic: string) => {
    const opener = topicOpeners[topic] || "Let's start a conversation!";
    const assistant: ChatMessage = {
      id: nextId(),
      role: "assistant",
      content: opener,
      timestamp: new Date().toISOString(),
    };
    persist([assistant]);
  };

  const handleClear = () => {
    if (messages.length > 0 && !confirm("清空当前对话？")) return;
    persist([]);
  };

  const handleRecordToggle = () => {
    if (typeof window === "undefined") return;
    const Recognition =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;
    if (!Recognition) {
      alert("您的浏览器不支持语音识别。请使用 Chrome 或 Edge。");
      return;
    }
    if (isRecording) {
      (recognitionRef.current as { stop: () => void } | null)?.stop();
      setIsRecording(false);
      return;
    }
    const rec = new (Recognition as unknown as new () => {
      lang: string;
      interimResults: boolean;
      continuous: boolean;
      onresult: (e: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void;
      onend: () => void;
      onerror: () => void;
      start: () => void;
      stop: () => void;
    })();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    rec.onend = () => setIsRecording(false);
    rec.onerror = () => setIsRecording(false);
    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true);
  };

  const handleExport = () => {
    if (messages.length === 0) return;
    const lines = messages.map((m) => {
      const ts = new Date(m.timestamp).toLocaleString("zh-CN");
      const role = m.role === "user" ? "You" : "Aria";
      return `[${ts}] ${role}:\n${m.content}\n`;
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aria-chat-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const speakMessage = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  };

  return (
    <main className="flex min-h-screen flex-col bg-background pt-[56px]">
      <section className="w-full border-b border-white/10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center gap-4 py-4">
            <button className="rounded-lg border-b-2 border-secondary px-4 py-2 font-semibold text-white">
              Aria
            </button>
            <div className="ml-auto flex gap-2">
              <button
                onClick={handleClear}
                disabled={messages.length === 0}
                title="清空对话"
                className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                🗑️ 清空
              </button>
              <button
                onClick={handleExport}
                disabled={messages.length === 0}
                title="导出对话"
                className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <span className="mr-1">📤</span>导出
              </button>
              <button
                title="设置"
                className="rounded-lg border border-white/20 p-2 text-white transition-all hover:bg-white/10"
              >
                <span className="text-lg">⚙️</span>
              </button>
              <button
                onClick={handleFullscreen}
                title="全屏"
                className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition-all hover:bg-white/10"
              >
                <span className="mr-1">⛶</span>Fullscreen
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="flex-1 overflow-hidden">
        <div className="mx-auto flex h-full max-w-5xl flex-col px-6 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              <div className="mb-8 text-center">
                <h2 className="mb-3 text-2xl font-bold text-white">
                  嗨，我是 Aria，一个虚拟对话伙伴。
                </h2>
                <p className="text-white/70">
                  如果你不知道用英语说什么，你可以用中文（简体）写。
                </p>
              </div>

              <div className="mb-8">
                <h3 className="mb-4 text-center text-lg font-semibold text-white">
                  你想谈什么？
                </h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {topicCards.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic.id)}
                      className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-card p-6 transition-all hover:border-white/20 hover:bg-white/5"
                    >
                      <span className="text-3xl">{topic.icon}</span>
                      <span className="text-sm font-medium text-white">{topic.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`group max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-secondary text-secondary-foreground"
                          : "border border-white/10 bg-card text-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                        <span className="text-white/40">
                          {new Date(message.timestamp).toLocaleTimeString("zh-CN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.role === "assistant" && (
                          <button
                            onClick={() => speakMessage(message.content)}
                            className="opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
                            title="朗读"
                          >
                            🔊
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl border border-white/10 bg-card px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/60" />
                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-white/60"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-white/60"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-card p-4">
            <div className="mb-3 flex items-center gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="您的消息"
                className="flex-1 bg-transparent text-white outline-none placeholder:text-white/40"
              />
              <button
                onClick={handleRecordToggle}
                title={isRecording ? "停止录音" : "语音输入（需 Chrome/Edge）"}
                className={`rounded-lg p-2 transition-all ${
                  isRecording
                    ? "bg-red-500 text-white"
                    : "border border-white/20 text-white hover:bg-white/10"
                }`}
              >
                <span className="text-lg">{isRecording ? "⏹" : "🎤"}</span>
              </button>
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="group flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 font-semibold text-secondary-foreground transition-all hover:opacity-90 disabled:opacity-30"
              >
                <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>按 Enter 发送 · Shift+Enter 换行</span>
              <span>对话自动保存到本地</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
