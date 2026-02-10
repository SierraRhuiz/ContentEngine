-- Feed System Database Schema
-- Run this in your Supabase SQL editor after 001_initial_schema.sql

-- ============================================
-- MONITORED ACCOUNTS TABLE (Twitter, LinkedIn)
-- ============================================
CREATE TABLE IF NOT EXISTS monitored_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'twitter', 'linkedin'
  username TEXT NOT NULL,
  display_name TEXT,
  profile_url TEXT,
  avatar_url TEXT,
  bio TEXT,
  followers_count INTEGER,
  is_own_account BOOLEAN DEFAULT FALSE, -- For tone matching
  last_scraped_at TIMESTAMPTZ,
  scrape_interval_minutes INTEGER DEFAULT 30,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, username)
);

-- ============================================
-- SCRAPED CONTENT TABLE (Tweets, LinkedIn Posts)
-- ============================================
CREATE TABLE IF NOT EXISTS scraped_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES monitored_accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'twitter', 'linkedin'
  external_id TEXT NOT NULL, -- Tweet ID, LinkedIn URN
  content TEXT NOT NULL,
  author_username TEXT,
  author_name TEXT,
  url TEXT,
  posted_at TIMESTAMPTZ,
  engagement JSONB DEFAULT '{}', -- {likes, retweets, comments, views, etc}
  metadata JSONB DEFAULT '{}', -- Platform-specific data (images, links, etc)
  is_new BOOLEAN DEFAULT TRUE, -- True if scraped since last view
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, external_id)
);

-- ============================================
-- BLOG SOURCES TABLE (Competitor Blogs)
-- ============================================
CREATE TABLE IF NOT EXISTS blog_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  domain TEXT,
  title TEXT,
  description TEXT,
  last_scraped_at TIMESTAMPTZ,
  scrape_interval_hours INTEGER DEFAULT 24,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, url)
);

-- ============================================
-- SCRAPED BLOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scraped_blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source_id UUID REFERENCES blog_sources(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  content TEXT,
  author TEXT,
  publish_date TIMESTAMPTZ,
  headings TEXT[],
  excerpts TEXT[],
  images TEXT[],
  reading_time TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_id, url)
);

-- ============================================
-- VOICE PROFILES TABLE (Tone Matching)
-- ============================================
CREATE TABLE IF NOT EXISTS voice_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES monitored_accounts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  tone TEXT, -- "Direct, slightly sarcastic, no fluff"
  themes TEXT[], -- ["AI", "Automation", "Growth"]
  vocabulary TEXT[], -- ["build", "ship", "scale"]
  patterns TEXT[], -- ["Questions as hooks", "Short sentences"]
  example_posts TEXT[], -- Sample posts for reference
  is_primary BOOLEAN DEFAULT FALSE, -- Primary voice profile for generation
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_monitored_accounts_user ON monitored_accounts(user_id, enabled);
CREATE INDEX IF NOT EXISTS idx_monitored_accounts_platform ON monitored_accounts(platform, enabled);
CREATE INDEX IF NOT EXISTS idx_scraped_content_account ON scraped_content(account_id, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraped_content_user ON scraped_content(user_id, platform, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraped_content_new ON scraped_content(user_id, is_new) WHERE is_new = TRUE;
CREATE INDEX IF NOT EXISTS idx_blog_sources_user ON blog_sources(user_id, enabled);
CREATE INDEX IF NOT EXISTS idx_scraped_blogs_source ON scraped_blogs(source_id, scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_profiles_user ON voice_profiles(user_id, is_primary);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE monitored_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own monitored accounts" ON monitored_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own scraped content" ON scraped_content FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own blog sources" ON blog_sources FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own scraped blogs" ON scraped_blogs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own voice profiles" ON voice_profiles FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to mark content as viewed (set is_new = false)
CREATE OR REPLACE FUNCTION mark_content_viewed(p_user_id UUID, p_account_id UUID DEFAULT NULL)
RETURNS void AS $$
BEGIN
  IF p_account_id IS NULL THEN
    UPDATE scraped_content SET is_new = FALSE WHERE user_id = p_user_id AND is_new = TRUE;
  ELSE
    UPDATE scraped_content SET is_new = FALSE WHERE account_id = p_account_id AND is_new = TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get feed with new content count
CREATE OR REPLACE FUNCTION get_feed_stats(p_user_id UUID)
RETURNS TABLE(
  total_accounts BIGINT,
  total_posts BIGINT,
  new_posts BIGINT,
  twitter_posts BIGINT,
  linkedin_posts BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM monitored_accounts WHERE user_id = p_user_id AND enabled = TRUE),
    (SELECT COUNT(*) FROM scraped_content WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM scraped_content WHERE user_id = p_user_id AND is_new = TRUE),
    (SELECT COUNT(*) FROM scraped_content WHERE user_id = p_user_id AND platform = 'twitter'),
    (SELECT COUNT(*) FROM scraped_content WHERE user_id = p_user_id AND platform = 'linkedin');
END;
$$ LANGUAGE plpgsql;
