export interface ReviewCard {
  id: string;
  word: string;
  translation: string;
  definition: string;
  partOfSpeech: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  examples: {
    text: string;
    translation: string;
    source: string;
  }[];
  srsData: {
    interval: number; // days until next review
    repetitions: number; // number of successful reviews
    easeFactor: number; // difficulty multiplier (1.3 - 2.5)
    nextReviewDate: Date;
    lastReviewDate: Date;
  };
  reviewHistory: {
    date: Date;
    rating: "again" | "hard" | "good" | "easy";
  }[];
}

export interface ReviewSession {
  totalCards: number;
  reviewedCards: number;
  correctCards: number;
  startTime: Date;
  endTime?: Date;
}

export const mockReviewCards: ReviewCard[] = [
  {
    id: "r1",
    word: "weather",
    translation: "天气",
    definition: "the state of the atmosphere at a place and time",
    partOfSpeech: "noun",
    difficulty: "intermediate",
    examples: [
      {
        text: "The weather is beautiful today.",
        translation: "今天天气很好。",
        source: "Netflix - Friends S01E01",
      },
    ],
    srsData: {
      interval: 1,
      repetitions: 2,
      easeFactor: 2.5,
      nextReviewDate: new Date(),
      lastReviewDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    reviewHistory: [
      {
        date: new Date(Date.now() - 48 * 60 * 60 * 1000),
        rating: "good",
      },
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        rating: "easy",
      },
    ],
  },
  {
    id: "r2",
    word: "beautiful",
    translation: "美丽的",
    definition: "pleasing the senses or mind aesthetically",
    partOfSpeech: "adjective",
    difficulty: "beginner",
    examples: [
      {
        text: "She has a beautiful smile.",
        translation: "她有美丽的笑容。",
        source: "YouTube - Easy English 168",
      },
    ],
    srsData: {
      interval: 3,
      repetitions: 4,
      easeFactor: 2.6,
      nextReviewDate: new Date(),
      lastReviewDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    reviewHistory: [
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        rating: "good",
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        rating: "easy",
      },
    ],
  },
  {
    id: "r3",
    word: "practice",
    translation: "练习",
    definition: "repeated exercise in or performance of an activity",
    partOfSpeech: "noun/verb",
    difficulty: "beginner",
    examples: [
      {
        text: "Practice makes perfect.",
        translation: "熟能生巧。",
        source: "Netflix - The Crown S02E03",
      },
    ],
    srsData: {
      interval: 7,
      repetitions: 5,
      easeFactor: 2.5,
      nextReviewDate: new Date(),
      lastReviewDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    reviewHistory: [
      {
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        rating: "good",
      },
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        rating: "good",
      },
    ],
  },
  {
    id: "r4",
    word: "language",
    translation: "语言",
    definition: "a system of communication used by a particular country or community",
    partOfSpeech: "noun",
    difficulty: "intermediate",
    examples: [
      {
        text: "I'm learning a new language every day.",
        translation: "我每天都在学习一门新语言。",
        source: "YouTube - Language Learning Tips",
      },
    ],
    srsData: {
      interval: 1,
      repetitions: 1,
      easeFactor: 2.5,
      nextReviewDate: new Date(),
      lastReviewDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    reviewHistory: [
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        rating: "hard",
      },
    ],
  },
  {
    id: "r5",
    word: "wonderful",
    translation: "美好的",
    definition: "extremely good or pleasant",
    partOfSpeech: "adjective",
    difficulty: "intermediate",
    examples: [
      {
        text: "What a wonderful day!",
        translation: "多么美好的一天！",
        source: "YouTube - Nature Documentary",
      },
    ],
    srsData: {
      interval: 14,
      repetitions: 6,
      easeFactor: 2.7,
      nextReviewDate: new Date(),
      lastReviewDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    reviewHistory: [
      {
        date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        rating: "easy",
      },
      {
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        rating: "easy",
      },
    ],
  },
];

// SM-2 Algorithm for calculating next review interval
export function calculateNextReview(
  rating: "again" | "hard" | "good" | "easy",
  currentInterval: number,
  repetitions: number,
  easeFactor: number
): { interval: number; repetitions: number; easeFactor: number } {
  let newEaseFactor = easeFactor;
  let newRepetitions = repetitions;
  let newInterval = currentInterval;

  // Adjust ease factor based on rating
  if (rating === "again") {
    newEaseFactor = Math.max(1.3, easeFactor - 0.2);
    newRepetitions = 0;
    newInterval = 1;
  } else if (rating === "hard") {
    newEaseFactor = Math.max(1.3, easeFactor - 0.15);
    newRepetitions = repetitions + 1;
    newInterval = Math.max(1, currentInterval * 1.2);
  } else if (rating === "good") {
    newRepetitions = repetitions + 1;
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * easeFactor);
    }
  } else if (rating === "easy") {
    newEaseFactor = Math.min(2.5, easeFactor + 0.15);
    newRepetitions = repetitions + 1;
    if (newRepetitions === 1) {
      newInterval = 4;
    } else {
      newInterval = Math.round(currentInterval * easeFactor * 1.3);
    }
  }

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
  };
}
