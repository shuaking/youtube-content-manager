import { NextRequest, NextResponse } from "next/server";

export interface PodcastEpisode {
  title: string;
  description: string;
  pubDate: string;
  audioUrl: string;
  duration: string;
  link: string;
}

export interface PodcastFeed {
  title: string;
  description: string;
  image?: string;
  episodes: PodcastEpisode[];
}

function extractTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  if (!m) return "";
  return m[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function extractAttr(block: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*\\b${attr}=["']([^"']+)["']`, "i");
  const m = block.match(re);
  return m ? m[1] : "";
}

function parseRSS(xml: string): PodcastFeed {
  const channelMatch = xml.match(/<channel[^>]*>([\s\S]*?)<\/channel>/i);
  const channel = channelMatch ? channelMatch[1] : xml;

  const title = extractTag(channel, "title");
  const description = extractTag(channel, "description");
  const image =
    extractAttr(channel, "itunes:image", "href") ||
    extractTag(channel, "url") ||
    "";

  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  const episodes: PodcastEpisode[] = [];
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(channel)) !== null) {
    const itemXml = m[1];
    episodes.push({
      title: extractTag(itemXml, "title"),
      description: extractTag(itemXml, "description").slice(0, 500),
      pubDate: extractTag(itemXml, "pubDate"),
      audioUrl: extractAttr(itemXml, "enclosure", "url"),
      duration: extractTag(itemXml, "itunes:duration"),
      link: extractTag(itemXml, "link"),
    });
    if (episodes.length >= 50) break;
  }

  return { title, description, image, episodes };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json({ error: "only http/https" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "LanguageReactorClone/1.0" },
      // 15s timeout via AbortController
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `fetch failed: ${res.status}` },
        { status: 502 }
      );
    }
    const xml = await res.text();
    const feed = parseRSS(xml);
    return NextResponse.json(feed);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "fetch failed" },
      { status: 502 }
    );
  }
}
