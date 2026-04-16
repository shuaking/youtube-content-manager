export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  channelId: string;
  channelName: string;
  views: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  topics: string[];
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  subscriberCount: string;
  videoCount: number;
  language: string;
  platform: "youtube" | "netflix";
  topics: string[];
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
];

export const mockChannels: Channel[] = [
  {
    id: "UCWOA1ZGywLbqmigxE4Qlvuw",
    name: "Easy English",
    description: "Learn English through real conversations with native speakers on the streets",
    thumbnail: "https://placehold.co/400x400/3b82f6/ffffff?text=Easy+English",
    subscriberCount: "2.5M",
    videoCount: 450,
    language: "en",
    platform: "youtube",
    topics: ["conversation", "street interviews", "culture"],
  },
  {
    id: "UCsooa4yRKGN_zEE8iknghZA",
    name: "TED-Ed",
    description: "Educational videos covering science, history, and philosophy",
    thumbnail: "https://placehold.co/400x400/ef4444/ffffff?text=TED-Ed",
    subscriberCount: "18M",
    videoCount: 1800,
    language: "en",
    platform: "youtube",
    topics: ["education", "science", "philosophy"],
  },
  {
    id: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
    name: "Google Developers",
    description: "Technical talks and tutorials from Google engineers",
    thumbnail: "https://placehold.co/400x400/10b981/ffffff?text=Google+Dev",
    subscriberCount: "2.3M",
    videoCount: 5000,
    language: "en",
    platform: "youtube",
    topics: ["technology", "programming", "tutorials"],
  },
];

export const mockVideos: Video[] = [
  {
    id: "HQjMa28UsrI",
    title: "Learn English with TV Series | Friends",
    description: "Improve your English listening and speaking skills with this Friends episode",
    thumbnail: "https://img.youtube.com/vi/HQjMa28UsrI/hqdefault.jpg",
    duration: "22:30",
    channelId: "UCWOA1ZGywLbqmigxE4Qlvuw",
    channelName: "Easy English",
    views: "1.2M",
    difficulty: "intermediate",
    topics: ["tv series", "conversation", "comedy"],
  },
  {
    id: "b14IFe4an5k",
    title: "What makes you happy? | Easy English 168",
    description: "We asked people on the streets of Brighton what makes them happy in life",
    thumbnail: "https://img.youtube.com/vi/b14IFe4an5k/hqdefault.jpg",
    duration: "8:45",
    channelId: "UCWOA1ZGywLbqmigxE4Qlvuw",
    channelName: "Easy English",
    views: "125K",
    difficulty: "beginner",
    topics: ["happiness", "conversation", "daily life"],
  },
  {
    id: "dQw4w9WgXcQ",
    title: "British vs American English | Easy English 172",
    description: "Exploring the differences between British and American English with native speakers",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    duration: "10:23",
    channelId: "UCWOA1ZGywLbqmigxE4Qlvuw",
    channelName: "Easy English",
    views: "89K",
    difficulty: "intermediate",
    topics: ["accents", "vocabulary", "culture"],
  },
  {
    id: "LnJwH_PZXnM",
    title: "How does the brain learn? | TED-Ed",
    description: "Understanding the neuroscience behind learning and memory formation",
    thumbnail: "https://img.youtube.com/vi/LnJwH_PZXnM/hqdefault.jpg",
    duration: "5:12",
    channelId: "UCsooa4yRKGN_zEE8iknghZA",
    channelName: "TED-Ed",
    views: "2.1M",
    difficulty: "advanced",
    topics: ["neuroscience", "education", "psychology"],
  },
  {
    id: "YE7VzlLtp-4",
    title: "What's new in Chrome DevTools | Google I/O 2023",
    description: "Learn about the latest features and improvements in Chrome DevTools",
    thumbnail: "https://img.youtube.com/vi/YE7VzlLtp-4/hqdefault.jpg",
    duration: "28:15",
    channelId: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
    channelName: "Google Developers",
    views: "85K",
    difficulty: "intermediate",
    topics: ["devtools", "debugging", "chrome"],
  },
  {
    id: "cuoMatKjOwc",
    title: "Web Performance Tips | Chrome Dev Summit",
    description: "Essential tips for optimizing web performance and Core Web Vitals",
    thumbnail: "https://img.youtube.com/vi/cuoMatKjOwc/hqdefault.jpg",
    duration: "32:45",
    channelId: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
    channelName: "Google Developers",
    views: "120K",
    difficulty: "advanced",
    topics: ["performance", "optimization", "web vitals"],
  },
];
