import fs from "fs/promises";
import path from "path";
import { Video, Channel } from "@/types/catalog";

const DATA_DIR = path.join(process.cwd(), "data");
const VIDEOS_FILE = path.join(DATA_DIR, "videos.json");
const CHANNELS_FILE = path.join(DATA_DIR, "channels.json");

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return defaultValue;
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getAllVideos(): Promise<Video[]> {
  return readJsonFile<Video[]>(VIDEOS_FILE, []);
}

export async function getAllChannels(): Promise<Channel[]> {
  return readJsonFile<Channel[]>(CHANNELS_FILE, []);
}

export async function addVideo(video: Video): Promise<void> {
  const videos = await getAllVideos();

  // Check if video already exists
  const existingIndex = videos.findIndex(v => v.id === video.id);

  if (existingIndex >= 0) {
    // Update existing video
    videos[existingIndex] = video;
  } else {
    // Add new video
    videos.push(video);
  }

  await writeJsonFile(VIDEOS_FILE, videos);
}

export async function addChannel(channel: Channel): Promise<void> {
  const channels = await getAllChannels();

  // Check if channel already exists
  const existingIndex = channels.findIndex(c => c.id === channel.id);

  if (existingIndex >= 0) {
    // Update existing channel
    channels[existingIndex] = channel;
  } else {
    // Add new channel
    channels.push(channel);
  }

  await writeJsonFile(CHANNELS_FILE, channels);
}

export async function deleteVideo(videoId: string): Promise<void> {
  const videos = await getAllVideos();
  const filtered = videos.filter(v => v.id !== videoId);
  await writeJsonFile(VIDEOS_FILE, filtered);
}

export async function deleteChannel(channelId: string): Promise<void> {
  const channels = await getAllChannels();
  const filtered = channels.filter(c => c.id !== channelId);
  await writeJsonFile(CHANNELS_FILE, filtered);
}

export async function getVideosByChannel(channelId: string): Promise<Video[]> {
  const videos = await getAllVideos();
  return videos.filter(v => v.channelId === channelId);
}
