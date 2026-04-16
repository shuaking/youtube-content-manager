import { mockVideos, mockChannels } from "./catalog";

export interface SearchResult {
  id: string;
  type: "video" | "channel" | "word" | "article";
  title: string;
  description: string;
  thumbnail?: string;
  link: string;
  metadata?: {
    views?: string;
    subscribers?: string;
    difficulty?: string;
    translation?: string;
  };
}

export const mockSearchResults: SearchResult[] = [
  // Videos
  {
    id: "v1",
    type: "video",
    title: "What makes you happy? | Easy English 168",
    description: "We asked people on the streets of Brighton what makes them happy in life",
    thumbnail: "/images/hero/hero-image.webp",
    link: "/catalog/en/youtube/video/b14IFe4an5k",
    metadata: {
      views: "125K",
      difficulty: "beginner",
    },
  },
  {
    id: "v2",
    type: "video",
    title: "British vs American English | Easy English 172",
    description: "Exploring the differences between British and American English",
    thumbnail: "/images/hero/hero-image.webp",
    link: "/catalog/en/youtube/video/dQw4w9WgXcQ",
    metadata: {
      views: "89K",
      difficulty: "intermediate",
    },
  },
  // Channels
  {
    id: "c1",
    type: "channel",
    title: "Easy English",
    description: "Learn English through real conversations with native speakers on the streets",
    thumbnail: "/images/hero/hero-image.webp",
    link: "/catalog/en/youtube/channel/UCWOA1ZGywLbqmigxE4Qlvuw",
    metadata: {
      subscribers: "2.5M",
    },
  },
  {
    id: "c2",
    type: "channel",
    title: "TED-Ed",
    description: "Educational videos covering science, history, and philosophy",
    thumbnail: "/images/hero/hero-image.webp",
    link: "/catalog/en/youtube/channel/UCsooa4yRKGN_zEE8iknghZA",
    metadata: {
      subscribers: "18M",
    },
  },
  // Words
  {
    id: "w1",
    type: "word",
    title: "happy",
    description: "feeling pleasure and enjoyment",
    link: "/saved-items",
    metadata: {
      translation: "快乐的",
      difficulty: "beginner",
    },
  },
  {
    id: "w2",
    type: "word",
    title: "wonderful",
    description: "extremely good or pleasant",
    link: "/saved-items",
    metadata: {
      translation: "美好的",
      difficulty: "intermediate",
    },
  },
  // Articles
  {
    id: "a1",
    type: "article",
    title: "如何安装 Language Reactor？",
    description: "详细的安装步骤和系统要求说明",
    link: "/help/basic",
  },
  {
    id: "a2",
    type: "article",
    title: "PhrasePump 使用指南",
    description: "了解如何使用 PhrasePump 进行听力练习",
    link: "/help/basic",
  },
];

export function searchContent(query: string, filters: string[] = []): SearchResult[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();

  return mockSearchResults.filter((result) => {
    // Filter by type if specified
    if (filters.length > 0 && !filters.includes(result.type)) {
      return false;
    }

    // Search in title and description
    return (
      result.title.toLowerCase().includes(lowerQuery) ||
      result.description.toLowerCase().includes(lowerQuery) ||
      result.metadata?.translation?.toLowerCase().includes(lowerQuery)
    );
  });
}
