-- Supabase Database Schema (Fixed - camelCase columns)
-- Run this in Supabase SQL Editor to create tables

-- Drop existing tables if they exist
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS channels CASCADE;

-- ==================== Videos Table ====================
CREATE TABLE videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT NOT NULL,
  duration TEXT NOT NULL,
  views TEXT NOT NULL,
  "channelId" TEXT NOT NULL,
  "channelName" TEXT NOT NULL,
  language TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for videos
CREATE INDEX idx_videos_language ON videos(language);
CREATE INDEX idx_videos_difficulty ON videos(difficulty);
CREATE INDEX idx_videos_channel_id ON videos("channelId");
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);

-- ==================== Channels Table ====================
CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT NOT NULL,
  "subscriberCount" TEXT NOT NULL,
  "videoCount" TEXT NOT NULL,
  language TEXT NOT NULL,
  platform TEXT NOT NULL,
  topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for channels
CREATE INDEX idx_channels_language ON channels(language);
CREATE INDEX idx_channels_platform ON channels(platform);
CREATE INDEX idx_channels_created_at ON channels(created_at DESC);

-- ==================== Row Level Security (RLS) ====================
-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anyone can view)
CREATE POLICY "Allow public read access on videos"
  ON videos FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on channels"
  ON channels FOR SELECT
  USING (true);

-- Allow public insert/update/delete (for now - you can restrict this later)
CREATE POLICY "Allow public insert on videos"
  ON videos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on videos"
  ON videos FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on videos"
  ON videos FOR DELETE
  USING (true);

CREATE POLICY "Allow public insert on channels"
  ON channels FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on channels"
  ON channels FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on channels"
  ON channels FOR DELETE
  USING (true);

-- ==================== Functions ====================
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
