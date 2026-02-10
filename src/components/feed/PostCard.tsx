"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface FeedPost {
  id: string;
  platform: "twitter" | "linkedin";
  content: string;
  author: string;
  authorName?: string;
  authorAvatar?: string;
  url: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  isNew?: boolean;
  isOwnAccount?: boolean;
}

interface PostCardProps {
  post: FeedPost;
  onGenerateSimilar: (post: FeedPost) => void;
  onSaveToQueue: (post: FeedPost) => void;
  isGenerating?: boolean;
}

export function PostCard({ post, onGenerateSimilar, onSaveToQueue, isGenerating }: PostCardProps) {
  const platformIcon = post.platform === "twitter" ? "𝕏" : "💼";

  return (
    <Card className="border-border/50 bg-card transition-all duration-200 hover:border-border hover:shadow-md">
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {post.authorAvatar ? (
              <img
                src={post.authorAvatar}
                alt={post.author}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg">
                {platformIcon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">
                  {post.authorName || post.author}
                </p>
                <Badge variant="outline" className="text-xs">
                  {post.platform === "twitter" ? "Twitter" : "LinkedIn"}
                </Badge>
                {post.isNew && (
                  <Badge className="bg-green-600 text-xs">New</Badge>
                )}
                {post.isOwnAccount && (
                  <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-xs">
                    Your Account
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                @{post.author} · {formatTimestamp(post.timestamp)}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="mb-4 whitespace-pre-wrap text-sm text-foreground/90">
          {post.content}
        </p>

        {/* Engagement Stats */}
        <div className="mb-4 flex gap-4 text-xs text-muted-foreground">
          <span>❤️ {formatNumber(post.likes)}</span>
          <span>💬 {formatNumber(post.comments)}</span>
          <span>🔁 {formatNumber(post.shares)}</span>
          {post.views && <span>👁️ {formatNumber(post.views)}</span>}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onGenerateSimilar(post)}
            disabled={isGenerating}
          >
            {isGenerating ? "✨ Generating..." : "✨ Generate Similar"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSaveToQueue(post)}
          >
            📥 Save to Queue
          </Button>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            View Original →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  } catch {
    return timestamp;
  }
}
