export interface HistoryItem {
  id: string;
  type: "video" | "phrasepump" | "word" | "text" | "chatbot";
  title: string;
  description: string;
  timestamp: Date;
  thumbnail?: string;
  metadata?: {
    duration?: string;
    progress?: number;
    wordsLearned?: number;
    source?: string;
  };
  link: string;
}

export const mockHistory: HistoryItem[] = [
  {
    id: "h1",
    type: "video",
    title: "What makes you happy? | Easy English 168",
    description: "观看了 12 分钟，学习了 8 个新词汇",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    thumbnail: "/images/hero/hero-image.webp",
    metadata: {
      duration: "15:30",
      progress: 80,
      wordsLearned: 8,
    },
    link: "/player/b14IFe4an5k",
  },
  {
    id: "h2",
    type: "word",
    title: "保存了 5 个新词汇",
    description: "wonderful, important, spending, family, happy",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    metadata: {
      wordsLearned: 5,
    },
    link: "/saved-items",
  },
  {
    id: "h3",
    type: "phrasepump",
    title: "PhrasePump 练习",
    description: "完成了 15 个句子的听力练习",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    metadata: {
      wordsLearned: 12,
    },
    link: "/phrasepump",
  },
  {
    id: "h4",
    type: "video",
    title: "British vs American English | Easy English 172",
    description: "观看了 8 分钟，学习了 6 个新词汇",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    thumbnail: "/images/hero/hero-image.webp",
    metadata: {
      duration: "12:45",
      progress: 65,
      wordsLearned: 6,
    },
    link: "/player/dQw4w9WgXcQ",
  },
  {
    id: "h5",
    type: "text",
    title: "分析了文本",
    description: "导入并分析了一篇文章（245 词）",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    metadata: {
      wordsLearned: 18,
    },
    link: "/text",
  },
  {
    id: "h6",
    type: "chatbot",
    title: "与 Aria 对话",
    description: "练习了 10 轮对话，学习了语法和词汇",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    link: "/chatbot",
  },
  {
    id: "h7",
    type: "video",
    title: "How does the brain learn? | TED-Ed",
    description: "观看了 10 分钟，学习了 5 个新词汇",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    thumbnail: "/images/hero/hero-image.webp",
    metadata: {
      duration: "5:12",
      progress: 70,
      wordsLearned: 5,
    },
    link: "/player/xyz123abc",
  },
  {
    id: "h8",
    type: "phrasepump",
    title: "PhrasePump 练习",
    description: "完成了 20 个句子的听力练习",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    metadata: {
      wordsLearned: 15,
    },
    link: "/phrasepump",
  },
];
