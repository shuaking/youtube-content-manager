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
