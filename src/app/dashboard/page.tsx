"use client";

import Link from "next/link";
import { mockStats, mockActivities, mockDailyGoals } from "@/types/dashboard";

export default function DashboardPage() {
  const progressPercentage = (mockStats.xp / mockStats.nextLevelXp) * 100;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "刚刚";
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays === 1) return "昨天";
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString("zh-CN");
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      video: "🎬",
      phrasepump: "⛽",
      word: "📚",
      text: "📝",
      chatbot: "🤖",
    };
    return icons[type as keyof typeof icons] || "📌";
  };

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      {/* Header */}
      <section className="w-full border-b border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-4xl leading-none">📊</span>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              学习仪表板
            </h1>
          </div>
          <p className="text-white/70">
            追踪您的学习进度，查看统计数据和活动历史
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Level & XP Progress */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{mockStats.level}</h2>
              <p className="text-sm text-white/60">
                {mockStats.xp} / {mockStats.nextLevelXp} XP
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-secondary">
                {mockStats.currentStreak}
              </div>
              <div className="text-sm text-white/60">天连续学习</div>
            </div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-secondary to-purple-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-white/50">
            还需 {mockStats.nextLevelXp - mockStats.xp} XP 升级
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-card p-6">
            <div className="mb-2 text-3xl">📚</div>
            <div className="mb-1 text-3xl font-bold text-white">
              {mockStats.totalWordsLearned}
            </div>
            <div className="text-sm text-white/60">总词汇量</div>
            <div className="mt-2 text-xs text-green-400">
              +{mockStats.wordsThisWeek} 本周
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card p-6">
            <div className="mb-2 text-3xl">🎬</div>
            <div className="mb-1 text-3xl font-bold text-white">
              {mockStats.totalVideosWatched}
            </div>
            <div className="text-sm text-white/60">观看视频</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card p-6">
            <div className="mb-2 text-3xl">⏱️</div>
            <div className="mb-1 text-3xl font-bold text-white">
              {Math.floor(mockStats.totalStudyTime / 60)}
            </div>
            <div className="text-sm text-white/60">学习小时</div>
            <div className="mt-2 text-xs text-white/50">
              {mockStats.totalStudyTime % 60} 分钟
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card p-6">
            <div className="mb-2 text-3xl">🔥</div>
            <div className="mb-1 text-3xl font-bold text-white">
              {mockStats.longestStreak}
            </div>
            <div className="text-sm text-white/60">最长连续</div>
            <div className="mt-2 text-xs text-white/50">天数</div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Daily Goals */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-2xl font-bold text-white">今日目标</h2>
            <div className="space-y-4">
              {mockDailyGoals.map((goal) => {
                const progress = (goal.current / goal.target) * 100;
                const isCompleted = goal.current >= goal.target;

                return (
                  <div
                    key={goal.id}
                    className={`rounded-2xl border p-6 transition-all ${
                      isCompleted
                        ? "border-green-500/50 bg-green-500/10"
                        : "border-white/10 bg-card"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{goal.icon}</span>
                        <div>
                          <h3 className="font-semibold text-white">
                            {goal.name}
                          </h3>
                          <p className="text-sm text-white/60">
                            {goal.current} / {goal.target} {goal.unit}
                          </p>
                        </div>
                      </div>
                      {isCompleted && (
                        <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                          ✓ 已完成
                        </span>
                      )}
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isCompleted ? "bg-green-500" : "bg-secondary"
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
              <h2 className="mb-6 text-2xl font-bold text-white">最近活动</h2>
              <div className="space-y-3">
                {mockActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-4 rounded-xl border border-white/10 bg-card p-4 transition-all hover:border-white/20"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="font-semibold text-white">
                          {activity.title}
                        </h3>
                        {activity.xpGained && (
                          <span className="rounded bg-secondary/20 px-2 py-0.5 text-xs font-semibold text-secondary">
                            +{activity.xpGained} XP
                          </span>
                        )}
                      </div>
                      <p className="mb-1 text-sm text-white/70">
                        {activity.description}
                      </p>
                      <p className="text-xs text-white/50">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  快速开始
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/catalog"
                    className="block rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
                  >
                    📺 浏览内容目录
                  </Link>
                  <Link
                    href="/phrasepump"
                    className="block rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
                  >
                    ⛽ PhrasePump 练习
                  </Link>
                  <Link
                    href="/saved-items"
                    className="block rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
                  >
                    📚 复习词汇
                  </Link>
                  <Link
                    href="/chatbot"
                    className="block rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
                  >
                    🤖 与 Aria 对话
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  学习建议
                </h3>
                <ul className="space-y-3 text-sm text-white/70">
                  <li className="flex gap-2">
                    <span className="text-secondary">•</span>
                    <span>保持每日学习连续性可获得额外 XP</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-secondary">•</span>
                    <span>完成所有每日目标可获得成就徽章</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-secondary">•</span>
                    <span>定期复习已保存词汇提高记忆效果</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-secondary">•</span>
                    <span>尝试不同难度的内容挑战自己</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-secondary/50 bg-secondary/10 p-6">
                <h3 className="mb-2 text-lg font-semibold text-white">
                  升级到 Pro
                </h3>
                <p className="mb-4 text-sm text-white/70">
                  解锁高级统计、个性化学习计划和更多功能
                </p>
                <Link
                  href="/pro-mode"
                  className="block rounded-lg bg-secondary px-4 py-2 text-center font-semibold text-secondary-foreground transition-all hover:opacity-90"
                >
                  了解更多
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
