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

export const staticSearchResults: SearchResult[] = [
  // Words (sourced from saved-items until a words API exists)
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

export function searchContent(
  query: string,
  results: SearchResult[],
  filters: string[] = []
): SearchResult[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();

  return results.filter((result) => {
    if (filters.length > 0 && !filters.includes(result.type)) {
      return false;
    }

    return (
      result.title.toLowerCase().includes(lowerQuery) ||
      result.description.toLowerCase().includes(lowerQuery) ||
      result.metadata?.translation?.toLowerCase().includes(lowerQuery)
    );
  });
}
