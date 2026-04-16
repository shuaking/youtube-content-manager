import { Video, Channel } from "@/types/catalog";
import { supabase, isSupabaseConfigured } from "./supabase";
import * as localStore from "./data-store";

/**
 * Hybrid Data Store
 *
 * Strategy: Cloud-first with local cache fallback
 * - Write: Simultaneously to cloud + local
 * - Read: Cloud first, fallback to local on error
 * - If Supabase not configured: Pure local mode
 */

// ==================== Videos ====================

export async function getAllVideos(): Promise<Video[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return localStore.getAllVideos();
  }

  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Sync to local cache
    if (data) {
      await syncVideosToLocal(data);
      return data;
    }
  } catch (err) {
    console.warn('Cloud fetch failed, using local cache:', err);
  }

  // Fallback to local
  return localStore.getAllVideos();
}

export async function addVideo(video: Video): Promise<void> {
  const videoWithTimestamp = {
    ...video,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured() || !supabase) {
    return localStore.addVideo(video);
  }

  try {
    // Write to cloud
    const { error } = await supabase
      .from('videos')
      .upsert(videoWithTimestamp, { onConflict: 'id' });

    if (error) throw error;

    // Write to local cache
    await localStore.addVideo(video);
  } catch (err) {
    console.error('Cloud write failed, writing to local only:', err);
    // Fallback: at least save locally
    await localStore.addVideo(video);
    throw err; // Re-throw to notify caller
  }
}

export async function deleteVideo(videoId: string): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    return localStore.deleteVideo(videoId);
  }

  try {
    // Delete from cloud
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId);

    if (error) throw error;

    // Delete from local cache
    await localStore.deleteVideo(videoId);
  } catch (err) {
    console.error('Cloud delete failed, deleting from local only:', err);
    await localStore.deleteVideo(videoId);
    throw err;
  }
}

export async function getVideosByChannel(channelId: string): Promise<Video[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return localStore.getVideosByChannel(channelId);
  }

  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Cloud query failed, using local cache:', err);
    return localStore.getVideosByChannel(channelId);
  }
}

// ==================== Channels ====================

export async function getAllChannels(): Promise<Channel[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return localStore.getAllChannels();
  }

  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Sync to local cache
    if (data) {
      await syncChannelsToLocal(data);
      return data;
    }
  } catch (err) {
    console.warn('Cloud fetch failed, using local cache:', err);
  }

  // Fallback to local
  return localStore.getAllChannels();
}

export async function addChannel(channel: Channel): Promise<void> {
  const channelWithTimestamp = {
    ...channel,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured() || !supabase) {
    return localStore.addChannel(channel);
  }

  try {
    // Write to cloud
    const { error } = await supabase
      .from('channels')
      .upsert(channelWithTimestamp, { onConflict: 'id' });

    if (error) throw error;

    // Write to local cache
    await localStore.addChannel(channel);
  } catch (err) {
    console.error('Cloud write failed, writing to local only:', err);
    await localStore.addChannel(channel);
    throw err;
  }
}

export async function deleteChannel(channelId: string): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    return localStore.deleteChannel(channelId);
  }

  try {
    // Delete from cloud
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId);

    if (error) throw error;

    // Delete from local cache
    await localStore.deleteChannel(channelId);
  } catch (err) {
    console.error('Cloud delete failed, deleting from local only:', err);
    await localStore.deleteChannel(channelId);
    throw err;
  }
}

// ==================== Sync Helpers ====================

async function syncVideosToLocal(videos: Video[]): Promise<void> {
  try {
    // This is a simple overwrite strategy
    // In production, you might want more sophisticated merge logic
    const fs = await import('fs/promises');
    const path = await import('path');
    const dataDir = path.join(process.cwd(), 'data');
    const videosFile = path.join(dataDir, 'videos.json');

    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(videosFile, JSON.stringify(videos, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to sync videos to local cache:', err);
  }
}

async function syncChannelsToLocal(channels: Channel[]): Promise<void> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const dataDir = path.join(process.cwd(), 'data');
    const channelsFile = path.join(dataDir, 'channels.json');

    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(channelsFile, JSON.stringify(channels, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to sync channels to local cache:', err);
  }
}
