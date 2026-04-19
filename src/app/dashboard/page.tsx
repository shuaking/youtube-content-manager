"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useHistory, useSavedWords } from "@/hooks/useStore";

function computeStreak(activityDates: string[]): { current: number; longest: number } {
  if (activityDates.length === 0) return { current: 0, longest: 0 };

  const days = new Set(activityDates.map((d) => d.slice(0, 10)));
  const sorted = Array.from(days).sort().reverse();

  const todayKey = new Date().toISOString().slice(0, 10);
  const yesterdayKey = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let current = 0;
  const cursor = sorted.includes(todayKey)
    ? todayKey
    : sorted.includes(yesterdayKey)
      ? yesterdayKey
      : null;

  if (cursor) {
    const cursorDate = new Date(cursor);
    for (;;) {
      const key = cursorDate.toISOString().slice(0, 10);
      if (days.has(key)) {
        current++;
        cursorDate.setDate(cursorDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  Array.from(days)
    .sort()
    .forEach((d) => {
      const date = new Date(d);
      if (prev && date.getTime() - prev.getTime() === 86400000) {
        run++;
      } else {
        run = 1;
      }
      if (run > longest) longest = run;
      prev = date;
    });

  return { current, longest };
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "刚刚";
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString("zh-CN");
}

const ACTIVITY_ICONS = {
  video: "🎬",
  phrasepump: "⛽",
  word: "📚",
  text: "📝",
  chatbot: "🤖",
} as const;

export default function DashboardPage() {
  const history = useHistory();
  const savedWords = useSavedWords();

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400 * 1000).toISOString();

    const wordsThisWeek = savedWords.filter((w) => w.savedDate >= weekAgo).length;
    const videosWatched = history.filter((h) => h.type === "video").length;
    const xp =
      savedWords.length * 10 +
      history.filter((h) => h.type === "phrasepump").length * 5 +
      history.filter((h) => h.type === "word").length * 15 +
      history.filter((h) => h.type === "video").length * 20;

    const level = Math.floor(xp / 500) + 1;
    const xpInLevel = xp % 500;
    const nextLevelXp = 500;

    const studyMinutes = history.reduce((acc, h) => {
      if (h.metadata?.duration) {
        const parts = h.metadata.duration.split(":").map(Number);
        if (parts.length === 2) return acc + parts[0] + parts[1] / 60;
      }
      return acc;
    }, 0);

    const { current, longest } = computeStreak(history.map((h) => h.timestamp));

    return {
      level: `Level ${level}`,
      xp: xpInLevel,
      nextLevelXp,
      totalXp: xp,
      wordsTotal: savedWords.length,
      wordsThisWeek,
      videosWatched,
      studyMinutes: Math.round(studyMinutes),
      currentStreak: current,
      longestStreak: longest,
    };
  }, [history, savedWords]);

  const dailyGoals = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayHistory = history.filter((h) => h.timestamp.startsWith(todayKey));
    const todayWords = savedWords.filter((w) => w.savedDate.startsWith(todayKey));

    return [
      {
        id: "words",
        name: "学习新词汇",
        icon: "📚",
        current: todayWords.length,
        target: 10,
        unit: "个",
      },
      {
        id: "video",
        name: "观看视频",
        icon: "🎬",
        current: todayHistory.filter((h) => h.type === "video").length,
        target: 2,
        unit: "个",
      },
      {
        id: "review",
        name: "复习词汇",
        icon: "🎴",
        current: todayHistory.filter((h) => h.type === "word").length,
        target: 1,
        unit: "次",
      },
    ];
  }, [history, savedWords]);

  const progressPercent = (stats.xp / stats.nextLevelXp) * 100;
  const recentActivities = history.slice(0, 8);

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      <section className="w-full border-b border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-4xl leading-none">📊</span>
            <h1 className="text-3xl font-bold text-white md:text-4xl">学习仪表板</h1>
          </div>
          <p className="text-white/70">追踪您的学习进度，查看统计数据和活动历史</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 rounded-2xl border border-white/10 bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{stats.level}</h2>
              <p className="text-sm text-white/60">
                {stats.xp} / {stats.nextLevelXp} XP（总 {stats.totalXp} XP）
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-secondary">{stats.currentStreak}</div>
              <div className="text-sm text-white/60">天连续学习</div>
            </div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-secondary to-purple-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-white/50">
            还需 {stats.nextLevelXp - stats.xp} XP 升级
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatBlock
            icon="📚"
            value={stats.wordsTotal}
            label="总词汇量"
            sub={stats.wordsThisWeek > 0 ? `+${stats.wordsThisWeek} 本周` : undefined}
            subColor="text-green-400"
          />
          <StatBlock icon="🎬" value={stats.videosWatched} label="观看视频" />
          <StatBlock
            icon="⏱️"
            value={Math.floor(stats.studyMinutes / 60)}
            label="学习小时"
            sub={`${stats.studyMinutes % 60} 分钟`}
          />
          <StatBlock icon="🔥" value={stats.longestStreak} label="最长连续" sub="天数" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-2xl font-bold text-white">今日目标</h2>
            <div className="space-y-4">
              {dailyGoals.map((goal) => {
                const progress = goal.target === 0 ? 0 : (goal.current / goal.target) * 100;
                const isCompleted = goal.current >= goal.target;
                return (
                  <div
                    key={goal.id}
                    className={`rounded-2xl border p-6 transition-all ${
                      isCompleted ? "border-green-500/50 bg-green-500/10" : "border-white/10 bg-card"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{goal.icon}</span>
                        <div>
                          <h3 className="font-semibold text-white">{goal.name}</h3>
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
                        className={`h-full transition-all duration-500 ${isCompleted ? "bg-green-500" : "bg-secondary"}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <h2 className="mb-6 text-2xl font-bold text-white">最近活动</h2>
              {recentActivities.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-card p-8 text-center text-white/60">
                  暂无活动记录。开始学习后会自动记录到这里。
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <Link
                      key={activity.id}
                      href={activity.link}
                      className="flex gap-4 rounded-xl border border-white/10 bg-card p-4 transition-all hover:border-white/20"
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl">
                        {ACTIVITY_ICONS[activity.type] || "📌"}
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <h3 className="font-semibold text-white">{activity.title}</h3>
                        </div>
                        <p className="mb-1 text-sm text-white/70">{activity.description}</p>
                        <p className="text-xs text-white/50">
                          {formatTimeAgo(new Date(activity.timestamp))}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">快速开始</h3>
                <div className="space-y-3">
                  <QuickLink href="/catalog" emoji="📺" label="浏览内容目录" />
                  <QuickLink href="/phrasepump" emoji="⛽" label="PhrasePump 练习" />
                  <QuickLink href="/review" emoji="🎴" label="复习词汇" />
                  <QuickLink href="/chatbot" emoji="🤖" label="与 Aria 对话" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">学习建议</h3>
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
                <h3 className="mb-2 text-lg font-semibold text-white">升级到 Pro</h3>
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

function StatBlock({
  icon,
  value,
  label,
  sub,
  subColor = "text-white/50",
}: {
  icon: string;
  value: number;
  label: string;
  sub?: string;
  subColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-6">
      <div className="mb-2 text-3xl">{icon}</div>
      <div className="mb-1 text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-white/60">{label}</div>
      {sub && <div className={`mt-2 text-xs ${subColor}`}>{sub}</div>}
    </div>
  );
}

function QuickLink({ href, emoji, label }: { href: string; emoji: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
    >
      {emoji} {label}
    </Link>
  );
}
