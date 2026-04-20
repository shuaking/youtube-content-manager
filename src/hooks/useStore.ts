"use client";

import { useSyncExternalStore, useCallback } from "react";
import * as S from "@/lib/storage";

const emptyWords: S.SavedWord[] = [];
const emptyPhrases: S.SavedPhrase[] = [];
const emptyHistory: S.HistoryEntry[] = [];
const emptyChat: S.ChatMessage[] = [];

export function useSavedWords(): S.SavedWord[] {
  return useSyncExternalStore(
    useCallback((cb) => S.subscribe("savedWords", cb), []),
    () => S.readSavedWords(),
    () => emptyWords
  );
}

export function useSavedPhrases(): S.SavedPhrase[] {
  return useSyncExternalStore(
    useCallback((cb) => S.subscribe("savedPhrases", cb), []),
    () => S.readSavedPhrases(),
    () => emptyPhrases
  );
}

export function useHistory(): S.HistoryEntry[] {
  return useSyncExternalStore(
    useCallback((cb) => S.subscribe("history", cb), []),
    () => S.readHistory(),
    () => emptyHistory
  );
}

export function useSettings(): readonly [S.UserSettings, (patch: Partial<S.UserSettings>) => void] {
  const settings = useSyncExternalStore(
    useCallback((cb) => S.subscribe("settings", cb), []),
    () => S.readSettings(),
    () => S.defaultSettings
  );
  const update = useCallback(
    (patch: Partial<S.UserSettings>) => {
      S.writeSettings({ ...S.readSettings(), ...patch });
    },
    []
  );
  return [settings, update] as const;
}

export function useChat(): readonly [S.ChatMessage[], (msgs: S.ChatMessage[]) => void] {
  const messages = useSyncExternalStore(
    useCallback((cb) => S.subscribe("chat", cb), []),
    () => S.readChat(),
    () => emptyChat
  );
  const setMessages = useCallback((m: S.ChatMessage[]) => S.writeChat(m), []);
  return [messages, setMessages] as const;
}
