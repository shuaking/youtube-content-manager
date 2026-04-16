import { SubtitleWord } from "@/types/subtitles";

interface Subtitle {
  id: number;
  startTime: number;
  endTime: number;
  originalText: string;
  translatedText: string;
  words: SubtitleWord[];
}

interface VocabularyItem {
  word: string;
  translation: string;
  difficulty: string;
  definition?: string;
  saved: boolean;
}

/**
 * Convert subtitles to CSV format
 */
export function exportSubtitlesToCSV(subtitles: Subtitle[]): string {
  const headers = ["ID", "Start Time", "End Time", "Original Text", "Translation"];
  const rows = subtitles.map((sub) => [
    sub.id.toString(),
    sub.startTime.toFixed(2),
    sub.endTime.toFixed(2),
    `"${sub.originalText.replace(/"/g, '""')}"`,
    `"${sub.translatedText.replace(/"/g, '""')}"`,
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

/**
 * Convert subtitles to JSON format
 */
export function exportSubtitlesToJSON(subtitles: Subtitle[]): string {
  const data = subtitles.map((sub) => ({
    id: sub.id,
    startTime: sub.startTime,
    endTime: sub.endTime,
    originalText: sub.originalText,
    translatedText: sub.translatedText,
  }));

  return JSON.stringify(data, null, 2);
}

/**
 * Convert vocabulary to CSV format
 */
export function exportVocabularyToCSV(vocabulary: VocabularyItem[]): string {
  const headers = ["Word", "Translation", "Difficulty", "Definition", "Saved"];
  const rows = vocabulary.map((item) => [
    `"${item.word.replace(/"/g, '""')}"`,
    `"${item.translation.replace(/"/g, '""')}"`,
    item.difficulty,
    `"${(item.definition || "").replace(/"/g, '""')}"`,
    item.saved ? "Yes" : "No",
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

/**
 * Convert vocabulary to JSON format
 */
export function exportVocabularyToJSON(vocabulary: VocabularyItem[]): string {
  return JSON.stringify(vocabulary, null, 2);
}

/**
 * Trigger file download
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export subtitles with automatic filename and format
 */
export function exportSubtitles(
  subtitles: Subtitle[],
  format: "csv" | "json",
  videoTitle: string = "subtitles"
) {
  const sanitizedTitle = videoTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `${sanitizedTitle}_subtitles_${timestamp}.${format}`;

  let content: string;
  let mimeType: string;

  if (format === "csv") {
    content = exportSubtitlesToCSV(subtitles);
    mimeType = "text/csv;charset=utf-8;";
  } else {
    content = exportSubtitlesToJSON(subtitles);
    mimeType = "application/json;charset=utf-8;";
  }

  downloadFile(content, filename, mimeType);
}

/**
 * Export vocabulary with automatic filename and format
 */
export function exportVocabulary(
  vocabulary: VocabularyItem[],
  format: "csv" | "json",
  videoTitle: string = "vocabulary"
) {
  const sanitizedTitle = videoTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `${sanitizedTitle}_vocabulary_${timestamp}.${format}`;

  let content: string;
  let mimeType: string;

  if (format === "csv") {
    content = exportVocabularyToCSV(vocabulary);
    mimeType = "text/csv;charset=utf-8;";
  } else {
    content = exportVocabularyToJSON(vocabulary);
    mimeType = "application/json;charset=utf-8;";
  }

  downloadFile(content, filename, mimeType);
}
