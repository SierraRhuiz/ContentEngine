"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface BlogSource {
  id: string;
  url: string;
  domain: string;
  title?: string;
  lastScrapedAt?: string;
  postCount?: number;
}

export interface ScrapedBlog {
  id: string;
  url: string;
  title: string;
  content: string;
  author?: string;
  publishDate?: string;
  excerpts?: string[];
}

interface BlogSourcesProps {
  sources: BlogSource[];
  blogs: ScrapedBlog[];
  isLoading: boolean;
  onAddSource: (url: string) => void;
  onRemoveSource: (sourceId: string) => void;
  onRefreshSource: (sourceId: string) => void;
  onGenerateFromBlog: (blog: ScrapedBlog) => void;
  onSaveBlogToQueue: (blog: ScrapedBlog) => void;
}

export function BlogSources({
  sources,
  blogs,
  isLoading,
  onAddSource,
  onRemoveSource,
  onRefreshSource,
  onGenerateFromBlog,
  onSaveBlogToQueue,
}: BlogSourcesProps) {
  const [newUrl, setNewUrl] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  const handleAddSource = () => {
    if (!newUrl.trim()) return;
    onAddSource(newUrl.trim());
    setNewUrl("");
    setShowAddForm(false);
  };

  const filteredBlogs = selectedSourceId
    ? blogs.filter((b) => sources.find((s) => s.id === selectedSourceId && b.url.includes(s.domain)))
    : blogs;

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm text-foreground">
          <span>📝 Competitor Blogs</span>
          <Button
            size="xs"
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            + Add Blog
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Source Form */}
        {showAddForm && (
          <div className="space-y-2 rounded-lg border border-border/50 bg-background p-3">
            <Input
              placeholder="https://competitor.com/blog"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSource()}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddSource}
                disabled={!newUrl.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? "Adding..." : "Add Source"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Source List */}
        {sources.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Sources</p>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedSourceId === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedSourceId(null)}
              >
                All
              </Badge>
              {sources.map((source) => (
                <Badge
                  key={source.id}
                  variant={selectedSourceId === source.id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedSourceId(source.id)}
                >
                  {source.domain}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSource(source.id);
                    }}
                    className="ml-1 text-xs hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Blog Posts */}
        {filteredBlogs.length > 0 ? (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {filteredBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="rounded-lg border border-border/50 bg-background p-3"
                >
                  <h4 className="mb-1 text-sm font-medium text-foreground line-clamp-2">
                    {blog.title}
                  </h4>
                  {blog.author && (
                    <p className="mb-2 text-xs text-muted-foreground">
                      By {blog.author} {blog.publishDate && `· ${blog.publishDate}`}
                    </p>
                  )}
                  <p className="mb-3 text-xs text-muted-foreground/80 line-clamp-3">
                    {blog.excerpts?.[0] || blog.content.slice(0, 200)}...
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="xs"
                      onClick={() => onGenerateFromBlog(blog)}
                    >
                      ✨ Generate Similar
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => onSaveBlogToQueue(blog)}
                    >
                      📥 Queue
                    </Button>
                    <a
                      href={blog.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      View →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : sources.length > 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            No blog posts scraped yet.
            <br />
            <Button
              size="sm"
              variant="outline"
              onClick={() => sources.forEach((s) => onRefreshSource(s.id))}
              className="mt-2"
            >
              🔄 Scrape All Sources
            </Button>
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Add competitor blog URLs to scrape and generate similar content.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
