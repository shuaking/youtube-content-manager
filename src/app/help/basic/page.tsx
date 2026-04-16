"use client";

import { useState } from "react";
import { ChevronRightIcon, SearchIcon } from "@/components/icons";

const helpCategories = [
  {
    id: "basic",
    title: "基础使用",
    articles: [
      { id: "install", title: "如何安装 Language Reactor？" },
      { id: "netflix", title: "在 Netflix 上使用" },
      { id: "youtube", title: "在 YouTube 上使用" },
      { id: "subtitles", title: "双语字幕设置" },
    ],
  },
  {
    id: "features",
    title: "功能说明",
    articles: [
      { id: "phrasepump", title: "PhrasePump 使用指南" },
      { id: "save-words", title: "保存和管理词汇" },
      { id: "export-anki", title: "导出到 Anki" },
      { id: "chatbot", title: "使用 Aria 聊天机器人" },
    ],
  },
  {
    id: "pro",
    title: "Pro 模式",
    articles: [
      { id: "pro-features", title: "Pro 功能介绍" },
      { id: "subscribe", title: "如何订阅 Pro" },
      { id: "cancel", title: "取消订阅" },
    ],
  },
  {
    id: "troubleshooting",
    title: "故障排除",
    articles: [
      { id: "not-working", title: "扩展无法正常工作" },
      { id: "subtitles-missing", title: "字幕不显示" },
      { id: "sync-issues", title: "同步问题" },
    ],
  },
];

const articleContent = {
  install: {
    title: "如何安装 Language Reactor？",
    content: `
## 安装步骤

1. **访问 Chrome 网上应用店**
   - 打开 [Language Reactor 扩展页面](https://chrome.google.com/webstore/detail/language-learning-with-ne/hoombieeljmmljlkjmnheibnpciblicm)

2. **点击"添加至 Chrome"**
   - 在扩展页面点击蓝色的"添加至 Chrome"按钮
   - 在弹出的确认对话框中点击"添加扩展程序"

3. **确认安装成功**
   - 安装完成后，您会在浏览器右上角看到 Language Reactor 图标
   - 如果没有看到，点击拼图图标查看所有扩展

4. **开始使用**
   - 访问 Netflix 或 YouTube
   - 扩展会自动激活并显示双语字幕

## 系统要求

- Chrome 浏览器版本 88 或更高
- 稳定的网络连接
- Netflix 或 YouTube 账号

## 常见问题

**Q: 支持其他浏览器吗？**
A: 目前仅支持 Chrome 和基于 Chromium 的浏览器（如 Edge、Brave）。

**Q: 需要付费吗？**
A: 基础功能完全免费。Pro 模式提供额外的 AI 功能。
    `,
  },
};

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState("basic");
  const [selectedArticle, setSelectedArticle] = useState("install");
  const [searchQuery, setSearchQuery] = useState("");

  const currentArticle = articleContent[selectedArticle as keyof typeof articleContent] || {
    title: "文章标题",
    content: "文章内容加载中...",
  };

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">帮助中心</h1>
          <p className="text-lg text-white/70">
            查找答案，学习如何使用 Language Reactor
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative mx-auto max-w-2xl">
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="搜索帮助文章..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-card py-4 pl-12 pr-4 text-white placeholder-white/40 outline-none transition-all focus:border-white/20 focus:ring-2 focus:ring-secondary/50"
            />
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="space-y-2">
              {helpCategories.map((category) => (
                <div key={category.id}>
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full rounded-lg px-4 py-2 text-left font-semibold transition-colors ${
                      selectedCategory === category.id
                        ? "bg-secondary text-secondary-foreground"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {category.title}
                  </button>
                  {selectedCategory === category.id && (
                    <div className="ml-4 mt-2 space-y-1">
                      {category.articles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => setSelectedArticle(article.id)}
                          className={`flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-sm transition-colors ${
                            selectedArticle === article.id
                              ? "bg-white/10 text-white"
                              : "text-white/60 hover:bg-white/5 hover:text-white/80"
                          }`}
                        >
                          <ChevronRightIcon className="h-4 w-4 flex-shrink-0" />
                          <span>{article.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <article className="rounded-2xl border border-white/10 bg-card p-8">
              <h2 className="mb-6 text-3xl font-bold text-white">
                {currentArticle.title}
              </h2>
              <div className="prose prose-invert max-w-none">
                <div
                  className="space-y-4 text-white/70 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: currentArticle.content
                      .split("\n")
                      .map((line) => {
                        if (line.startsWith("## ")) {
                          return `<h2 class="text-2xl font-bold text-white mt-8 mb-4">${line.slice(3)}</h2>`;
                        }
                        if (line.startsWith("**Q:")) {
                          return `<p class="font-semibold text-white mt-4">${line}</p>`;
                        }
                        if (line.startsWith("A:")) {
                          return `<p class="text-white/70 ml-4">${line}</p>`;
                        }
                        if (line.match(/^\d+\./)) {
                          return `<p class="text-white/80 ml-4">${line}</p>`;
                        }
                        if (line.startsWith("   -")) {
                          return `<p class="text-white/70 ml-8">${line}</p>`;
                        }
                        return line ? `<p>${line}</p>` : "";
                      })
                      .join(""),
                  }}
                />
              </div>

              {/* Helpful Section */}
              <div className="mt-12 border-t border-white/10 pt-8">
                <p className="mb-4 text-center text-white/70">
                  这篇文章有帮助吗？
                </p>
                <div className="flex justify-center gap-4">
                  <button className="rounded-lg border border-white/20 px-6 py-2 text-white transition-all hover:bg-white/10">
                    👍 有帮助
                  </button>
                  <button className="rounded-lg border border-white/20 px-6 py-2 text-white transition-all hover:bg-white/10">
                    👎 没帮助
                  </button>
                </div>
              </div>
            </article>

            {/* Related Articles */}
            <div className="mt-8">
              <h3 className="mb-4 text-xl font-semibold text-white">
                相关文章
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <a
                  href="#"
                  className="group rounded-xl border border-white/10 bg-card p-4 transition-all hover:border-white/20 hover:shadow-lg"
                >
                  <h4 className="mb-2 font-semibold text-white group-hover:text-secondary">
                    在 Netflix 上使用
                  </h4>
                  <p className="text-sm text-white/60">
                    了解如何在 Netflix 上激活和使用 Language Reactor
                  </p>
                </a>
                <a
                  href="#"
                  className="group rounded-xl border border-white/10 bg-card p-4 transition-all hover:border-white/20 hover:shadow-lg"
                >
                  <h4 className="mb-2 font-semibold text-white group-hover:text-secondary">
                    双语字幕设置
                  </h4>
                  <p className="text-sm text-white/60">
                    自定义字幕显示方式和语言选择
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
