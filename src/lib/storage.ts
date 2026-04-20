"use client";

export type WordStage = "known" | "learning" | "ignore" | "uncommon";
export type WordTag = "none" | "red" | "green" | "yellow" | "blue";

export interface SavedWord {
  word: string;
  translation: string;
  definition?: string;
  partOfSpeech?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  stage: WordStage;
  tag: WordTag;
  examples: { text: string; translation: string; source: string }[];
  savedDate: string;
  reviewCount: number;
  mastered: boolean;
  srs: {
    interval: number;
    repetitions: number;
    easeFactor: number;
    nextReviewDate: string;
    lastReviewDate: string;
  };
  reviewHistory: { date: string; rating: "again" | "hard" | "good" | "easy" }[];
}

export interface SavedPhrase {
  id: string;
  text: string;
  translation: string;
  source: string;
  videoId?: string;
  subtitleId?: number;
  startTime?: number;
  savedDate: string;
  tag: WordTag;
}

export interface HistoryEntry {
  id: string;
  type: "video" | "phrasepump" | "word" | "text" | "chatbot";
  title: string;
  description: string;
  timestamp: string;
  link: string;
  thumbnail?: string;
  metadata?: { duration?: string; wordsLearned?: number; progress?: number };
}

export interface UserSettings {
  learningLang: string;
  translationLang: string;
  uiLang: string;
  showMiniDict: boolean;
  speakOnClick: boolean;
  customDictUrl: string;
  autoPause: boolean;
  hideSubtitles: boolean;
  smartHighlight: boolean;
  showFurigana: boolean;
  vocabSize: number;
  colorUnderlines: boolean;
  showMachineTranslation: boolean;
  showHumanTranslation: boolean;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const KEYS = {
  savedWords: "lr.savedWords",
  savedPhrases: "lr.savedPhrases",
  history: "lr.history",
  settings: "lr.settings",
  chat: "lr.chat",
} as const;

type Topic = "savedWords" | "savedPhrases" | "history" | "settings" | "chat";

const listeners: Record<Topic, Set<() => void>> = {
  savedWords: new Set(),
  savedPhrases: new Set(),
  history: new Set(),
  settings: new Set(),
  chat: new Set(),
};

const cache: {
  savedWords: SavedWord[] | null;
  savedPhrases: SavedPhrase[] | null;
  history: HistoryEntry[] | null;
  settings: UserSettings | null;
  chat: ChatMessage[] | null;
} = {
  savedWords: null,
  savedPhrases: null,
  history: null,
  settings: null,
  chat: null,
};

function notify(topic: Topic) {
  cache[topic] = null; // Invalidate cache
  listeners[topic].forEach((fn) => fn());
}

export function subscribe(topic: Topic, fn: () => void): () => void {
  listeners[topic].add(fn);
  return () => {
    listeners[topic].delete(fn);
  };
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silent fail
  }
}

// Saved Words
export function readSavedWords(): SavedWord[] {
  if (cache.savedWords) return cache.savedWords;
  const data = read<SavedWord[]>(KEYS.savedWords, []);
  cache.savedWords = data;
  return data;
}

function writeSavedWords(words: SavedWord[]): void {
  write(KEYS.savedWords, words);
  cache.savedWords = words;
  notify("savedWords");
}

export function saveWord(
  input: Partial<SavedWord> & { word: string; translation: string }
): SavedWord {
  const all = readSavedWords();
  const existing = all.find((w) => w.word.toLowerCase() === input.word.toLowerCase());
  if (existing) return existing;

  const now = new Date().toISOString();
  const newWord: SavedWord = {
    word: input.word,
    translation: input.translation,
    definition: input.definition || "",
    partOfSpeech: input.partOfSpeech || "",
    difficulty: input.difficulty || "intermediate",
    stage: input.stage || "learning",
    tag: input.tag || "none",
    examples: input.examples || [],
    savedDate: now,
    reviewCount: 0,
    mastered: false,
    srs: {
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
      nextReviewDate: now,
      lastReviewDate: now,
    },
    reviewHistory: [],
  };
  writeSavedWords([...all, newWord]);
  return newWord;
}

export function unsaveWord(word: string): void {
  writeSavedWords(
    readSavedWords().filter((w) => w.word.toLowerCase() !== word.toLowerCase())
  );
}

export function isSaved(word: string): boolean {
  return readSavedWords().some((w) => w.word.toLowerCase() === word.toLowerCase());
}

export function updateSavedWord(word: string, patch: Partial<SavedWord>): void {
  const all = readSavedWords();
  const idx = all.findIndex((w) => w.word.toLowerCase() === word.toLowerCase());
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...patch };
  writeSavedWords(all);
}

export function bulkUpdateStage(words: string[], stage: WordStage): void {
  if (words.length === 0) return;
  const set = new Set(words.map((w) => w.toLowerCase()));
  const all = readSavedWords();
  const updated = all.map((w) => (set.has(w.word.toLowerCase()) ? { ...w, stage } : w));
  writeSavedWords(updated);
}

export function bulkUpdateTag(words: string[], tag: WordTag): void {
  if (words.length === 0) return;
  const set = new Set(words.map((w) => w.toLowerCase()));
  const all = readSavedWords();
  const updated = all.map((w) => (set.has(w.word.toLowerCase()) ? { ...w, tag } : w));
  writeSavedWords(updated);
}

// Saved Phrases
export function readSavedPhrases(): SavedPhrase[] {
  if (cache.savedPhrases) return cache.savedPhrases;
  const data = read<SavedPhrase[]>(KEYS.savedPhrases, []);
  cache.savedPhrases = data;
  return data;
}

function writeSavedPhrases(phrases: SavedPhrase[]): void {
  write(KEYS.savedPhrases, phrases);
  cache.savedPhrases = phrases;
  notify("savedPhrases");
}

export function savePhrase(input: Omit<SavedPhrase, "id" | "savedDate" | "tag"> & { tag?: WordTag }): SavedPhrase {
  const all = readSavedPhrases();
  const existing = all.find(
    (p) => p.text.trim() === input.text.trim() && p.videoId === input.videoId
  );
  if (existing) return existing;
  const now = new Date().toISOString();
  const phrase: SavedPhrase = {
    id: `p_${now}_${Math.random().toString(36).slice(2, 6)}`,
    text: input.text,
    translation: input.translation,
    source: input.source,
    videoId: input.videoId,
    subtitleId: input.subtitleId,
    startTime: input.startTime,
    savedDate: now,
    tag: input.tag || "none",
  };
  writeSavedPhrases([...all, phrase]);
  return phrase;
}

export function unsavePhrase(id: string): void {
  writeSavedPhrases(readSavedPhrases().filter((p) => p.id !== id));
}

export function isSavedPhrase(text: string, videoId?: string): boolean {
  return readSavedPhrases().some(
    (p) => p.text.trim() === text.trim() && p.videoId === videoId
  );
}

export function recordReview(
  word: string,
  rating: "again" | "hard" | "good" | "easy"
): void {
  const all = readSavedWords();
  const idx = all.findIndex((w) => w.word.toLowerCase() === word.toLowerCase());
  if (idx === -1) return;

  const card = all[idx];
  const { interval, repetitions, easeFactor } = card.srs;

  let newEase = easeFactor;
  let newReps = repetitions;
  let newInterval = interval;

  if (rating === "again") {
    newEase = Math.max(1.3, easeFactor - 0.2);
    newReps = 0;
    newInterval = 1;
  } else if (rating === "hard") {
    newEase = Math.max(1.3, easeFactor - 0.15);
    newReps = repetitions + 1;
    newInterval = Math.max(1, Math.round(interval * 1.2));
  } else if (rating === "good") {
    newReps = repetitions + 1;
    if (newReps === 1) newInterval = 1;
    else if (newReps === 2) newInterval = 6;
    else newInterval = Math.round(interval * easeFactor);
  } else {
    newEase = Math.min(2.5, easeFactor + 0.15);
    newReps = repetitions + 1;
    if (newReps === 1) newInterval = 4;
    else newInterval = Math.round(interval * easeFactor * 1.3);
  }

  const now = new Date();
  const next = new Date(now.getTime() + newInterval * 86400 * 1000);

  all[idx] = {
    ...card,
    reviewCount: card.reviewCount + 1,
    mastered: newReps >= 5,
    srs: {
      interval: newInterval,
      repetitions: newReps,
      easeFactor: newEase,
      nextReviewDate: next.toISOString(),
      lastReviewDate: now.toISOString(),
    },
    reviewHistory: [
      ...card.reviewHistory,
      { date: now.toISOString(), rating },
    ],
  };
  writeSavedWords(all);
}

// History
export function readHistory(): HistoryEntry[] {
  if (cache.history) return cache.history;
  const data = read<HistoryEntry[]>(KEYS.history, []);
  cache.history = data;
  return data;
}

export function logActivity(entry: Omit<HistoryEntry, "id" | "timestamp">): void {
  const newEntry: HistoryEntry = {
    ...entry,
    id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  const all = readHistory();
  const next = [newEntry, ...all].slice(0, 500);
  write(KEYS.history, next);
  cache.history = next;
  notify("history");
}

export function clearHistory(): void {
  write(KEYS.history, []);
  cache.history = [];
  notify("history");
}

// Settings
export const defaultSettings: UserSettings = {
  learningLang: "en",
  translationLang: "zh-CN",
  uiLang: "zh-CN",
  showMiniDict: true,
  speakOnClick: true,
  customDictUrl: "",
  autoPause: true,
  hideSubtitles: false,
  smartHighlight: true,
  showFurigana: false,
  vocabSize: 3000,
  colorUnderlines: true,
  showMachineTranslation: true,
  showHumanTranslation: true,
};

export function readSettings(): UserSettings {
  if (cache.settings) return cache.settings;
  const data = {
    ...defaultSettings,
    ...read<Partial<UserSettings>>(KEYS.settings, {}),
  };
  cache.settings = data;
  return data;
}

export function writeSettings(s: UserSettings): void {
  write(KEYS.settings, s);
  cache.settings = s;
  notify("settings");
}

// Chat
export function readChat(): ChatMessage[] {
  if (cache.chat) return cache.chat;
  const data = read<ChatMessage[]>(KEYS.chat, []);
  cache.chat = data;
  return data;
}

export function writeChat(msgs: ChatMessage[]): void {
  write(KEYS.chat, msgs);
  cache.chat = msgs;
  notify("chat");
}
