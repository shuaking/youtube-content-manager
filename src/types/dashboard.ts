export interface LearningStats {
  totalWordsLearned: number;
  wordsThisWeek: number;
  totalVideosWatched: number;
  totalStudyTime: number; // minutes
  currentStreak: number; // days
  longestStreak: number; // days
  level: string;
  xp: number;
  nextLevelXp: number;
}

export interface Activity {
  id: number;
  type: "video" | "phrasepump" | "word" | "text" | "chatbot";
  title: string;
  description: string;
  timestamp: Date;
  xpGained?: number;
}

export interface DailyGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  icon: string;
}

export const mockStats: LearningStats = {
  totalWordsLearned: 1247,
  wordsThisWeek: 89,
  totalVideosWatched: 156,
  totalStudyTime: 3420, // 57 hours
  currentStreak: 12,
  longestStreak: 28,
  level: "中级学习者",
  xp: 3450,
  nextLevelXp: 5000,
};

export const mockActivities: Activity[] = [
  {
    id: 1,
    type: "video",
    title: "观看了视频",
    description: "What makes you happy? | Easy English 168",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    xpGained: 50,
  },
  {
    id: 2,
    type: "word",
    title: "保存了 5 个新词汇",
    description: "wonderful, important, spending, family, happy",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    xpGained: 25,
  },
  {
    id: 3,
    type: "phrasepump",
    title: "完成 PhrasePump 练习",
    description: "练习了 15 个句子",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    xpGained: 75,
  },
  {
    id: 4,
    type: "text",
    title: "分析了文本",
    description: "导入并分析了一篇文章（245 词）",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    xpGained: 30,
  },
  {
    id: 5,
    type: "chatbot",
    title: "与 Aria 对话",
    description: "练习了 10 轮对话",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    xpGained: 40,
  },
];

export const mockDailyGoals: DailyGoal[] = [
  {
    id: "words",
    name: "学习新词汇",
    target: 20,
    current: 15,
    unit: "个",
    icon: "📚",
  },
  {
    id: "videos",
    name: "观看视频",
    target: 2,
    current: 1,
    unit: "个",
    icon: "🎬",
  },
  {
    id: "time",
    name: "学习时长",
    target: 30,
    current: 22,
    unit: "分钟",
    icon: "⏱️",
  },
  {
    id: "phrasepump",
    name: "PhrasePump 练习",
    target: 10,
    current: 10,
    unit: "句",
    icon: "⛽",
  },
];
