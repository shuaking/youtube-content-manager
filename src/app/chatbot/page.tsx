"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRightIcon } from "@/components/icons";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const topicCards = [
  { id: "famous", label: "著名人物", icon: "🎭" },
  { id: "psychology", label: "心理学家", icon: "🧠" },
  { id: "games", label: "游戏", icon: "🎮" },
  { id: "situations", label: "情况", icon: "💼" },
  { id: "aria", label: "只是咏叹调", icon: "🎵" },
  { id: "vocab", label: "词汇故事", icon: "📖" },
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: generateMockResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleTopicClick = (topic: string) => {
    const topicMessages: Record<string, string> = {
      famous: "让我们聊聊著名人物！你想了解哪位名人？",
      psychology: "心理学是个有趣的话题！你对哪方面的心理学感兴趣？",
      games: "游戏时间！你最喜欢玩什么类型的游戏？",
      situations: "让我们练习一些实际情况。你想练习什么场景？",
      aria: "嗨！我是 Aria。我们可以聊任何你想聊的话题。",
      vocab: "让我们通过故事学习词汇！你想学习哪个主题的词汇？",
    };

    const message: Message = {
      id: messages.length + 1,
      role: "assistant",
      content: topicMessages[topic] || "让我们开始对话吧！",
      timestamp: new Date(),
    };

    setMessages([message]);
  };

  const handleRecordToggle = () => {
    setIsRecording(!isRecording);
    // 实际录音功能需要集成 Web Speech API
  };

  const handleExport = () => {
    if (messages.length === 0) return;
    const lines = messages.map((m) => {
      const ts = m.timestamp.toISOString();
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
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const generateMockResponse = (input: string): string => {
    return `很好的问题！关于"${input}"，让我来帮你。\n\n在英语中，你可以这样表达：\n"That's a great question about ${input}."\n\n这是一个很自然的表达方式。你想继续练习吗？`;
  };

  return (
    <main className="flex min-h-screen flex-col bg-background pt-[56px]">
      {/* Header with Tab */}
      <section className="w-full border-b border-white/10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center gap-4 py-4">
            <button className="rounded-lg border-b-2 border-secondary px-4 py-2 font-semibold text-white">
              Aria
            </button>
            <div className="ml-auto flex gap-2">
              <button
                onClick={handleExport}
                disabled={messages.length === 0}
                title="导出对话"
                aria-label="导出对话"
                className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <span className="mr-1">📤</span>导出
              </button>
              <button
                title="设置"
                aria-label="设置"
                className="rounded-lg border border-white/20 p-2 text-white transition-all hover:bg-white/10"
              >
                <span className="text-lg">⚙️</span>
              </button>
              <button
                onClick={handleFullscreen}
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

      {/* Chat Area */}
      <section className="flex-1 overflow-hidden">
        <div className="mx-auto flex h-full max-w-5xl flex-col px-6 py-6">
          {/* Messages or Welcome Screen */}
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
                      <span className="text-sm font-medium text-white">
                        {topic.label}
                      </span>
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
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-secondary text-secondary-foreground"
                          : "border border-white/10 bg-card text-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </p>
                      <div className="mt-2 text-xs text-white/40">
                        {message.timestamp.toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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

          {/* Input Area */}
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
              <span>按 [ESC] 切换快捷键/输入模式</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
