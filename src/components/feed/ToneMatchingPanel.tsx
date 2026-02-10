"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FeedPost } from "./PostCard";

export interface VoiceProfile {
  tone: string;
  themes: string[];
  vocabulary: string[];
  patterns: string[];
}

interface ToneMatchingPanelProps {
  posts: FeedPost[];
  voiceProfile: VoiceProfile | null;
  isExtracting: boolean;
  onExtractVoice: () => void;
  onGenerateWithTone: (sourcePost: FeedPost) => void;
}

export function ToneMatchingPanel({
  posts,
  voiceProfile,
  isExtracting,
  onExtractVoice,
  onGenerateWithTone,
}: ToneMatchingPanelProps) {
  const [showPosts, setShowPosts] = useState(false);

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm text-foreground">
          <span>🎯 Your Voice Profile</span>
          <Button
            size="xs"
            variant="outline"
            onClick={onExtractVoice}
            disabled={isExtracting || posts.length === 0}
          >
            {isExtracting ? "Analyzing..." : "🔄 Re-analyze"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {voiceProfile ? (
          <>
            {/* Tone */}
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Tone</p>
              <p className="text-sm text-foreground/90">{voiceProfile.tone}</p>
            </div>

            {/* Themes */}
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Themes</p>
              <div className="flex flex-wrap gap-1">
                {voiceProfile.themes.map((theme) => (
                  <Badge
                    key={theme}
                    variant="outline"
                    className="border-primary/50 text-primary"
                  >
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Vocabulary */}
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Key Words</p>
              <div className="flex flex-wrap gap-1">
                {voiceProfile.vocabulary.map((word) => (
                  <Badge
                    key={word}
                    variant="outline"
                  >
                    {word}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Patterns */}
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Writing Patterns</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {voiceProfile.patterns.map((pattern) => (
                  <li key={pattern}>• {pattern}</li>
                ))}
              </ul>
            </div>
          </>
        ) : posts.length > 0 ? (
          <div className="py-4 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              Analyze your posts to extract your unique voice profile
            </p>
            <Button
              onClick={onExtractVoice}
              disabled={isExtracting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isExtracting ? "Analyzing..." : "🎯 Extract Voice Profile"}
            </Button>
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Add your Twitter account to extract your voice profile
          </div>
        )}

        {/* Your Posts Preview */}
        {posts.length > 0 && (
          <div className="border-t border-border/30 pt-4">
            <button
              onClick={() => setShowPosts(!showPosts)}
              className="flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Your Recent Posts ({posts.length})</span>
              <span>{showPosts ? "▲" : "▼"}</span>
            </button>

            {showPosts && (
              <ScrollArea className="mt-3 h-48">
                <div className="space-y-2">
                  {posts.slice(0, 10).map((post) => (
                    <div
                      key={post.id}
                      className="rounded-lg border border-border/50 bg-background p-3"
                    >
                      <p className="mb-2 line-clamp-3 text-xs text-muted-foreground">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground/70">
                          ❤️ {post.likes} · 💬 {post.comments}
                        </span>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => onGenerateWithTone(post)}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          Generate Similar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
