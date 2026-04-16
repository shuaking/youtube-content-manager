#!/usr/bin/env node

/**
 * Migration Script: Local JSON → Supabase
 *
 * This script migrates existing videos and channels from local JSON files
 * to Supabase cloud database.
 *
 * Usage:
 *   node scripts/migrate-to-supabase.mjs
 *
 * Prerequisites:
 *   - NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 *   - Supabase tables created (run supabase-schema.sql first)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl = '';
let supabaseAnonKey = '';

try {
  const envContent = await fs.readFile(envPath, 'utf-8');
  const lines = envContent.split('\n');

  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = line.split('=')[1].trim();
    }
  }
} catch (err) {
  console.error('❌ Failed to read .env.local:', err.message);
  console.log('\n📝 Please create .env.local with:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Read local data
const dataDir = path.join(__dirname, '..', 'data');
const videosFile = path.join(dataDir, 'videos.json');
const channelsFile = path.join(dataDir, 'channels.json');

async function readLocalData() {
  try {
    const videosContent = await fs.readFile(videosFile, 'utf-8');
    const channelsContent = await fs.readFile(channelsFile, 'utf-8');

    return {
      videos: JSON.parse(videosContent),
      channels: JSON.parse(channelsContent),
    };
  } catch (err) {
    console.error('❌ Failed to read local data files:', err.message);
    process.exit(1);
  }
}

async function migrateChannels(channels) {
  console.log(`\n📤 Migrating ${channels.length} channels...`);

  const channelsWithTimestamps = channels.map(channel => ({
    ...channel,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from('channels')
    .upsert(channelsWithTimestamps, { onConflict: 'id' });

  if (error) {
    console.error('❌ Channel migration failed:', error.message);
    throw error;
  }

  console.log(`✅ Successfully migrated ${channels.length} channels`);
  return data;
}

async function migrateVideos(videos) {
  console.log(`\n📤 Migrating ${videos.length} videos...`);

  const videosWithTimestamps = videos.map(video => ({
    ...video,
    language: video.language || 'en', // Add default language if missing
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from('videos')
    .upsert(videosWithTimestamps, { onConflict: 'id' });

  if (error) {
    console.error('❌ Video migration failed:', error.message);
    throw error;
  }

  console.log(`✅ Successfully migrated ${videos.length} videos`);
  return data;
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');

  const { data: videos, error: videosError } = await supabase
    .from('videos')
    .select('id, title');

  const { data: channels, error: channelsError } = await supabase
    .from('channels')
    .select('id, name');

  if (videosError || channelsError) {
    console.error('❌ Verification failed');
    return false;
  }

  console.log(`✅ Found ${videos?.length || 0} videos in Supabase`);
  console.log(`✅ Found ${channels?.length || 0} channels in Supabase`);

  return true;
}

async function main() {
  console.log('🚀 Starting migration to Supabase...');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);

  try {
    // Read local data
    const { videos, channels } = await readLocalData();
    console.log(`\n📊 Local data summary:`);
    console.log(`   - Videos: ${videos.length}`);
    console.log(`   - Channels: ${channels.length}`);

    // Migrate channels first (videos reference channels)
    await migrateChannels(channels);

    // Migrate videos
    await migrateVideos(videos);

    // Verify
    const verified = await verifyMigration();

    if (verified) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\n📝 Next steps:');
      console.log('   1. Verify data in Supabase dashboard');
      console.log('   2. Test the application: npm run dev');
      console.log('   3. Local JSON files are kept as backup/cache');
    } else {
      console.log('\n⚠️  Migration completed but verification failed');
      console.log('   Please check Supabase dashboard manually');
    }

  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  }
}

main();
