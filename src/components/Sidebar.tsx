"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "./icons";

const navigationItems = [
  { name: "首页", path: "/", icon: "🏠" },
  { name: "学习仪表板", path: "/dashboard", icon: "📊" },
  { name: "内容目录", path: "/catalog", icon: "📺" },
  { name: "内容管理", path: "/admin", icon: "🔧" },
  { name: "PhrasePump", path: "/phrasepump", icon: "⛽" },
  { name: "已保存词汇", path: "/saved-items", icon: "📚" },
  { name: "词汇复习", path: "/review", icon: "🎴" },
  { name: "历史记录", path: "/history", icon: "📜" },
  { name: "Aria 助手", path: "/chatbot", icon: "🤖" },
  { name: "文本分析", path: "/text", icon: "📝" },
  { name: "Pro 模式", path: "/pro-mode", icon: "💎" },
  { name: "帮助中心", path: "/help/basic", icon: "❓" },
  { name: "设置", path: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-[56px] h-[calc(100vh-56px)] bg-card/95 backdrop-blur-md border-r border-white/10 transition-all duration-300 z-[1000] ${
          isCollapsed ? "w-[60px]" : "w-[240px]"
        } hidden md:block`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-4 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-card transition-all hover:bg-white/10"
          aria-label={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          <ChevronRightIcon
            className={`h-4 w-4 text-white transition-transform ${
              isCollapsed ? "" : "rotate-180"
            }`}
          />
        </button>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-3 pt-8">
          {navigationItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Menu Button (visible on mobile) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed bottom-6 right-6 z-[1050] flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg md:hidden"
        aria-label="打开菜单"
      >
        <span className="text-2xl">☰</span>
      </button>

      {/* Mobile Sidebar Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-[1040] bg-black/50 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-[56px] h-[calc(100vh-56px)] w-[280px] bg-card backdrop-blur-md border-r border-white/10 transition-transform duration-300 z-[1045] md:hidden ${
          isCollapsed ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <nav className="flex flex-col gap-1 p-4">
          {navigationItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsCollapsed(true)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
