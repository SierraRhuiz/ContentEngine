"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AccountSidebar, type MonitoredAccount } from "@/components/feed/AccountSidebar";
import { PostCard, type FeedPost } from "@/components/feed/PostCard";
import { ToneMatchingPanel, type VoiceProfile } from "@/components/feed/ToneMatchingPanel";
import { BlogSources, type BlogSource, type ScrapedBlog } from "@/components/feed/BlogSources";

// Demo accounts for initial state
const DEMO_ACCOUNTS: MonitoredAccount[] = [
  {
    id: "1",
    platform: "twitter",
    username: "elonmusk",
    displayName: "Elon Musk",
    isOwnAccount: false,
    postCount: 0,
    newPostCount: 0,
  },
  {
    id: "2",
    platform: "twitter",
    username: "sama",
    displayName: "Sam Altman",
    isOwnAccount: false,
    postCount: 0,
    newPostCount: 0,
  },
];

export default function FeedPage() {
  // State
  const [accounts, setAccounts] = useState<MonitoredAccount[]>(DEMO_ACCOUNTS);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | "twitter" | "linkedin">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Tone matching state
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [isExtractingVoice, setIsExtractingVoice] = useState(false);

  // Blog sources state
  const [blogSources, setBlogSources] = useState<BlogSource[]>([]);
  const [scrapedBlogs, setScrapedBlogs] = useState<ScrapedBlog[]>([]);
  const [isBlogLoading, setIsBlogLoading] = useState(false);

  // Filter posts based on selection
  const filteredPosts = posts.filter((post) => {
    if (selectedAccountId) {
      const account = accounts.find((a) => a.id === selectedAccountId);
      return account && post.author === account.username;
    }
    if (selectedPlatform !== "all") {
      return post.platform === selectedPlatform;
    }
    return true;
  });

  // Fetch posts for an account
  const fetchAccountPosts = useCallback(async (account: MonitoredAccount) => {
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: account.platform,
          username: account.username,
          options: { maxTweets: 50, limit: 50 },
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();

      const rawPosts = account.platform === "twitter" ? data.tweets : data.linkedin;
      if (!rawPosts) return [];

      return rawPosts.map((post: any) => ({
        id: `${account.id}-${post.id}`,
        platform: account.platform,
        content: post.content || post.text || "",
        author: account.username,
        authorName: post.authorName || post.author || account.displayName,
        authorAvatar: post.authorAvatar,
        url: post.url || `https://x.com/${account.username}/status/${post.id}`,
        timestamp: post.timestamp || post.createdAt || new Date().toISOString(),
        likes: post.likes || post.likeCount || 0,
        comments: post.comments || post.replyCount || 0,
        shares: post.retweets || post.retweetCount || 0,
        views: post.views || post.viewCount || 0,
        isNew: false,
        isOwnAccount: account.isOwnAccount,
      }));
    } catch (error) {
      console.error(`Error fetching posts for ${account.username}:`, error);
      return [];
    }
  }, []);

  // Refresh all accounts
  const refreshAllAccounts = useCallback(async () => {
    setIsLoading(true);
    const allPosts: FeedPost[] = [];

    for (const account of accounts) {
      const accountPosts = await fetchAccountPosts(account);
      allPosts.push(...accountPosts);
    }

    // Sort by timestamp (newest first)
    allPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setPosts(allPosts);
    setLastRefresh(new Date());
    setIsLoading(false);
  }, [accounts, fetchAccountPosts]);

  // Refresh single account
  const refreshAccount = async (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return;

    setIsLoading(true);
    const accountPosts = await fetchAccountPosts(account);

    setPosts((prev) => {
      // Remove old posts from this account
      const otherPosts = prev.filter((p) => !p.id.startsWith(`${accountId}-`));
      // Add new posts
      const allPosts = [...otherPosts, ...accountPosts];
      // Sort by timestamp
      return allPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });

    // Update account's last scraped time
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId
          ? { ...a, lastScrapedAt: new Date().toISOString(), postCount: accountPosts.length }
          : a
      )
    );

    setIsLoading(false);
  };

  // Add new account
  const addAccount = async (
    platform: "twitter" | "linkedin",
    username: string,
    isOwnAccount: boolean
  ) => {
    const newAccount: MonitoredAccount = {
      id: Date.now().toString(),
      platform,
      username,
      displayName: username,
      isOwnAccount,
      postCount: 0,
      newPostCount: 0,
    };

    setAccounts((prev) => [...prev, newAccount]);
    setIsLoading(true);

    // Fetch posts for the new account
    const accountPosts = await fetchAccountPosts(newAccount);

    setPosts((prev) => {
      const allPosts = [...prev, ...accountPosts];
      return allPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });

    setAccounts((prev) =>
      prev.map((a) =>
        a.id === newAccount.id
          ? { ...a, lastScrapedAt: new Date().toISOString(), postCount: accountPosts.length }
          : a
      )
    );

    setIsLoading(false);
  };

  // Remove account
  const removeAccount = (accountId: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    setPosts((prev) => prev.filter((p) => !p.id.startsWith(`${accountId}-`)));
    if (selectedAccountId === accountId) {
      setSelectedAccountId(null);
    }
  };

  // Generate similar content
  const generateSimilar = async (post: FeedPost) => {
    setIsGenerating(post.id);
    try {
      // Include voice profile in generation if available
      const systemPrompt = voiceProfile
        ? `Create content similar to the example but using this voice profile:
           Tone: ${voiceProfile.tone}
           Themes: ${voiceProfile.themes.join(", ")}
           Vocabulary: ${voiceProfile.vocabulary.join(", ")}
           Patterns: ${voiceProfile.patterns.join(", ")}
           
           Keep it under 280 characters if it's a tweet.`
        : "Create content similar to the example. Keep it under 280 characters if it's a tweet.";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Create content similar to: "${post.content}"` },
          ],
          mode: "writing",
        }),
      });

      const data = await response.json();

      // Save to queue
      await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          item: {
            type: post.platform === "twitter" ? "tweet" : "linkedin",
            content: data.content,
            source: post.author,
            sourceType: post.platform,
            status: "draft",
          },
        }),
      });

      alert(`Generated & Saved!\n\n"${data.content}"\n\nSaved to queue!`);
    } catch (error) {
      alert("Failed to generate content.");
    } finally {
      setIsGenerating(null);
    }
  };

  // Save post to queue
  const saveToQueue = async (post: FeedPost) => {
    try {
      await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          item: {
            type: post.platform === "twitter" ? "tweet" : "linkedin",
            content: post.content,
            source: post.author,
            sourceType: post.platform,
            status: "draft",
          },
        }),
      });
      alert("Saved to queue!");
    } catch (error) {
      alert("Failed to save.");
    }
  };

  // Extract voice profile from own account posts
  const extractVoiceProfile = async () => {
    const ownPosts = posts.filter((p) =>
      accounts.find((a) => a.username === p.author && a.isOwnAccount)
    );

    if (ownPosts.length === 0) {
      alert("Add your own account first to extract voice profile.");
      return;
    }

    setIsExtractingVoice(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "Analyze these posts and extract a voice profile. Return JSON with: {tone: string, themes: string[], vocabulary: string[], patterns: string[]}",
            },
            {
              role: "user",
              content: `Analyze these ${ownPosts.length} posts and extract the voice profile:\n\n${ownPosts
                .slice(0, 50)
                .map((p) => p.content)
                .join("\n\n---\n\n")}`,
            },
          ],
        }),
      });

      const data = await response.json();
      try {
        const profile = JSON.parse(data.content);
        setVoiceProfile(profile);
      } catch {
        // Try to extract JSON from response
        const match = data.content.match(/\{[\s\S]*\}/);
        if (match) {
          const profile = JSON.parse(match[0]);
          setVoiceProfile(profile);
        }
      }
    } catch (error) {
      console.error("Failed to extract voice profile:", error);
    } finally {
      setIsExtractingVoice(false);
    }
  };

  // Blog source functions
  const addBlogSource = async (url: string) => {
    setIsBlogLoading(true);
    try {
      const domain = new URL(url).hostname.replace("www.", "");
      const newSource: BlogSource = {
        id: Date.now().toString(),
        url,
        domain,
        lastScrapedAt: new Date().toISOString(),
      };
      setBlogSources((prev) => [...prev, newSource]);

      // Scrape the blog
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "blog", url }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.blog) {
          setScrapedBlogs((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              url,
              title: data.blog.title,
              content: data.blog.content,
              author: data.blog.author,
              publishDate: data.blog.publishDate,
              excerpts: data.blog.excerpts,
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Failed to add blog source:", error);
    } finally {
      setIsBlogLoading(false);
    }
  };

  const removeBlogSource = (sourceId: string) => {
    setBlogSources((prev) => prev.filter((s) => s.id !== sourceId));
  };

  const refreshBlogSource = async (sourceId: string) => {
    const source = blogSources.find((s) => s.id === sourceId);
    if (!source) return;

    setIsBlogLoading(true);
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "blog", url: source.url }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.blog) {
          setScrapedBlogs((prev) => [
            ...prev.filter((b) => !b.url.includes(source.domain)),
            {
              id: Date.now().toString(),
              url: source.url,
              title: data.blog.title,
              content: data.blog.content,
              author: data.blog.author,
              publishDate: data.blog.publishDate,
              excerpts: data.blog.excerpts,
            },
          ]);
        }
      }

      setBlogSources((prev) =>
        prev.map((s) =>
          s.id === sourceId ? { ...s, lastScrapedAt: new Date().toISOString() } : s
        )
      );
    } catch (error) {
      console.error("Failed to refresh blog source:", error);
    } finally {
      setIsBlogLoading(false);
    }
  };

  const generateFromBlog = async (blog: ScrapedBlog) => {
    setIsBlogLoading(true);
    try {
      const systemPrompt = voiceProfile
        ? `Create a blog post outline inspired by this content but using this voice profile:
           Tone: ${voiceProfile.tone}
           Themes: ${voiceProfile.themes.join(", ")}
           Vocabulary: ${voiceProfile.vocabulary.join(", ")}`
        : "Create a blog post outline inspired by this content.";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Create content inspired by this blog:\n\nTitle: ${blog.title}\n\nContent: ${blog.content.slice(0, 2000)}`,
            },
          ],
          mode: "writing",
        }),
      });

      const data = await response.json();

      await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          item: {
            type: "blog",
            content: data.content,
            source: blog.url,
            sourceType: "blog",
            status: "draft",
          },
        }),
      });

      alert(`Generated & Saved to queue!`);
    } catch (error) {
      alert("Failed to generate content.");
    } finally {
      setIsBlogLoading(false);
    }
  };

  const saveBlogToQueue = async (blog: ScrapedBlog) => {
    try {
      await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          item: {
            type: "blog",
            content: blog.content,
            source: blog.url,
            sourceType: "blog",
            status: "draft",
            metadata: { title: blog.title, author: blog.author },
          },
        }),
      });
      alert("Saved to queue!");
    } catch (error) {
      alert("Failed to save.");
    }
  };

  // Initial load
  useEffect(() => {
    refreshAllAccounts();
  }, []);

  // Get stats
  const stats = {
    total: posts.length,
    twitter: posts.filter((p) => p.platform === "twitter").length,
    linkedin: posts.filter((p) => p.platform === "linkedin").length,
    new: posts.filter((p) => p.isNew).length,
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Unified Feed</h1>
            <p className="text-sm text-muted-foreground">
              Monitor Twitter & LinkedIn accounts for content ideas
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Badge variant="outline">
                {stats.total} posts
              </Badge>
              <Badge variant="outline">
                X {stats.twitter}
              </Badge>
              <Badge variant="outline" className="border-primary/50 text-primary">
                LinkedIn {stats.linkedin}
              </Badge>
            </div>
            {lastRefresh && (
              <span className="text-xs text-muted-foreground">
                Last refresh: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <Button
              onClick={refreshAllAccounts}
              disabled={isLoading}
            >
              {isLoading ? "Refreshing..." : "Refresh All"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Account Sidebar */}
        <AccountSidebar
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          selectedPlatform={selectedPlatform}
          onSelectAccount={setSelectedAccountId}
          onSelectPlatform={setSelectedPlatform}
          onAddAccount={addAccount}
          onRemoveAccount={removeAccount}
          onRefreshAccount={refreshAccount}
          isLoading={isLoading}
        />

        {/* Feed */}
        <div className="flex-1 overflow-hidden">
          <div className="border-b border-border/30 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {selectedAccountId
                ? `@${accounts.find((a) => a.id === selectedAccountId)?.username}`
                : selectedPlatform === "all"
                ? "All Platforms"
                : selectedPlatform === "twitter"
                ? "Twitter Feed"
                : "LinkedIn Feed"}{" "}
              · {isLoading ? "Loading..." : `${filteredPosts.length} posts`}
            </p>
          </div>

          <ScrollArea className="h-[calc(100vh-220px)] p-4">
            {isLoading && filteredPosts.length === 0 ? (
              <div className="flex h-40 items-center justify-center">
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="flex h-40 items-center justify-center">
                <p className="text-muted-foreground">No posts found. Add accounts to start monitoring.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onGenerateSimilar={generateSimilar}
                    onSaveToQueue={saveToQueue}
                    isGenerating={isGenerating === post.id}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Sidebar - Tone Matching & Blogs */}
        <div className="w-80 border-l border-border/30 p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Tone Matching Panel */}
            <ToneMatchingPanel
              posts={posts.filter((p) =>
                accounts.find((a) => a.username === p.author && a.isOwnAccount)
              )}
              voiceProfile={voiceProfile}
              isExtracting={isExtractingVoice}
              onExtractVoice={extractVoiceProfile}
              onGenerateWithTone={generateSimilar}
            />

            <div className="h-px bg-border/30" />

            {/* Blog Sources */}
            <BlogSources
              sources={blogSources}
              blogs={scrapedBlogs}
              isLoading={isBlogLoading}
              onAddSource={addBlogSource}
              onRemoveSource={removeBlogSource}
              onRefreshSource={refreshBlogSource}
              onGenerateFromBlog={generateFromBlog}
              onSaveBlogToQueue={saveBlogToQueue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
