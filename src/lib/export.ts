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
 * Convert subtitles to SRT format
 */
function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

function formatVttTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

export function exportSubtitlesToSRT(subtitles: Subtitle[]): string {
  return subtitles
    .map((sub, idx) => {
      const body = sub.translatedText
        ? `${sub.originalText}\n${sub.translatedText}`
        : sub.originalText;
      return `${idx + 1}\n${formatSrtTime(sub.startTime)} --> ${formatSrtTime(sub.endTime)}\n${body}\n`;
    })
    .join("\n");
}

export function exportSubtitlesToVTT(subtitles: Subtitle[]): string {
  const entries = subtitles
    .map((sub, idx) => {
      const body = sub.translatedText
        ? `${sub.originalText}\n${sub.translatedText}`
        : sub.originalText;
      return `${idx + 1}\n${formatVttTime(sub.startTime)} --> ${formatVttTime(sub.endTime)}\n${body}\n`;
    })
    .join("\n");
  return `WEBVTT\n\n${entries}`;
}

/**
 * Export subtitles with automatic filename and format
 */
export function exportSubtitles(
  subtitles: Subtitle[],
  format: "csv" | "json" | "srt" | "vtt",
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
  } else if (format === "json") {
    content = exportSubtitlesToJSON(subtitles);
    mimeType = "application/json;charset=utf-8;";
  } else if (format === "srt") {
    content = exportSubtitlesToSRT(subtitles);
    mimeType = "text/plain;charset=utf-8;";
  } else {
    content = exportSubtitlesToVTT(subtitles);
    mimeType = "text/vtt;charset=utf-8;";
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
