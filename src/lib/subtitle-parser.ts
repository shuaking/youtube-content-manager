export interface ParsedSubtitleCue {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
}

function parseTimestamp(ts: string): number {
  // Matches HH:MM:SS,mmm or HH:MM:SS.mmm or MM:SS.mmm
  const m = ts.trim().match(/^(?:(\d{1,2}):)?(\d{1,2}):(\d{1,2})[.,](\d{1,3})$/);
  if (!m) return 0;
  const h = m[1] ? parseInt(m[1], 10) : 0;
  const mm = parseInt(m[2], 10);
  const s = parseInt(m[3], 10);
  const ms = parseInt(m[4].padEnd(3, "0"), 10);
  return h * 3600 + mm * 60 + s + ms / 1000;
}

export function parseSRT(input: string): ParsedSubtitleCue[] {
  const normalized = input.replace(/\r\n/g, "\n").trim();
  const blocks = normalized.split(/\n\n+/);
  const cues: ParsedSubtitleCue[] = [];
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;
    const numLine = /^\d+$/.test(lines[0]) ? lines.shift() : null;
    const timeLine = lines.shift();
    if (!timeLine) continue;
    const m = timeLine.match(/(\d{1,2}:\d{1,2}:\d{1,2}[.,]\d{1,3})\s*-->\s*(\d{1,2}:\d{1,2}:\d{1,2}[.,]\d{1,3})/);
    if (!m) continue;
    cues.push({
      id: numLine ? parseInt(numLine, 10) : cues.length + 1,
      startTime: parseTimestamp(m[1]),
      endTime: parseTimestamp(m[2]),
      text: lines.join("\n"),
    });
  }
  return cues;
}

export function parseVTT(input: string): ParsedSubtitleCue[] {
  const normalized = input.replace(/\r\n/g, "\n").trim();
  const withoutHeader = normalized.replace(/^WEBVTT[^\n]*\n+/, "");
  const blocks = withoutHeader.split(/\n\n+/);
  const cues: ParsedSubtitleCue[] = [];
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 1) continue;
    // VTT blocks may start with a cue identifier (string without -->)
    if (!lines[0].includes("-->")) lines.shift();
    const timeLine = lines.shift();
    if (!timeLine) continue;
    const m = timeLine.match(/(\d{1,2}:\d{1,2}:\d{1,2}[.,]\d{1,3})\s*-->\s*(\d{1,2}:\d{1,2}:\d{1,2}[.,]\d{1,3})/);
    if (!m) continue;
    cues.push({
      id: cues.length + 1,
      startTime: parseTimestamp(m[1]),
      endTime: parseTimestamp(m[2]),
      text: lines.join("\n"),
    });
  }
  return cues;
}

export function parseSubtitleFile(filename: string, content: string): ParsedSubtitleCue[] {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".vtt")) return parseVTT(content);
  return parseSRT(content);
}

export function formatCueTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
