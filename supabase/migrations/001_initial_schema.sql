-- Content Engine Database Schema
-- Run this in your Supabase SQL editor

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCUMENTS TABLE (Brain/Knowledge Base)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'twitter', 'youtube', 'linkedin', 'blog', 'file', 'text'
  source_url TEXT,
  content TEXT,
  status TEXT DEFAULT 'processing', -- 'processing', 'ready', 'failed'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTENT QUEUE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'tweet', 'thread', 'blog', 'linkedin'
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'posted', 'failed'
  scheduled_for TIMESTAMPTZ,
  platform TEXT, -- 'twitter', 'linkedin', etc.
  source TEXT, -- Original source (e.g., @username)
  source_type TEXT, -- 'twitter', 'linkedin', 'youtube', 'blog'
  metadata JSONB DEFAULT '{}', -- {wordCount, hashtags, tone, etc}
  published_id TEXT, -- ID of published post
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOM INSTRUCTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS custom_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'tone', 'style', 'format', 'avoid'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONNECTIONS TABLE (Social Media Accounts)
-- ============================================
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'twitter', 'linkedin', 'threads', 'bluesky'
  username TEXT,
  display_name TEXT,
  access_token TEXT, -- Encrypted
  refresh_token TEXT, -- Encrypted
  token_expires_at TIMESTAMPTZ,
  profile_data JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, username)
);

-- ============================================
-- SCHEDULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'twitter', 'linkedin', etc.
  name TEXT NOT NULL,
  days TEXT[] DEFAULT ARRAY['mon', 'tue', 'wed', 'thu', 'fri'], -- Days of week
  times TEXT[] DEFAULT ARRAY['09:00', '12:00', '17:00'], -- Times in HH:MM
  timezone TEXT DEFAULT 'America/Mexico_City',
  enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PUBLISHED POSTS TABLE (Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS published_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  queue_id UUID REFERENCES content_queue(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  external_id TEXT NOT NULL, -- Tweet ID, LinkedIn URN, etc.
  url TEXT,
  content TEXT,
  engagement JSONB DEFAULT '{}', -- {likes, retweets, comments, views}
  published_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id, type);
CREATE INDEX IF NOT EXISTS idx_content_queue_user ON content_queue(user_id, status);
CREATE INDEX IF NOT EXISTS idx_content_queue_scheduled ON content_queue(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_connections_user ON connections(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_published_posts_user ON published_posts(user_id, platform);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own documents" ON documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own queue" ON content_queue FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own instructions" ON custom_instructions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own connections" ON connections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own schedules" ON schedules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own published posts" ON published_posts FOR ALL USING (auth.uid() = user_id);
