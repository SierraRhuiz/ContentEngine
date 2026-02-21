"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const recipes = {
  writing: [
    {
      title: "Create X posts from a YouTube video",
      icon: "🎬",
      prompt: "Create some X posts from my favorite YouTube video",
    },
    {
      title: "Write a post based on a blog",
      icon: "📝",
      prompt: "Write an X post based on a blog post",
    },
    {
      title: "Adapt a viral tweet",
      icon: "🔥",
      prompt: "Find and adapt a viral tweet for my audience",
    },
    {
      title: "Thread from a topic",
      icon: "🧵",
      prompt: "Create a thread about a specific topic",
    },
  ],
  research: [
    {
      title: "Research trending topics",
      icon: "📈",
      prompt: "What topics are trending in my niche?",
    },
    {
      title: "Find viral tweets",
      icon: "🔥",
      prompt: "Find viral tweets in my industry",
    },
    {
      title: "Analyze competitors",
      icon: "🕵️",
      prompt: "Analyze what my competitors are posting",
    },
    {
      title: "Content gap analysis",
      icon: "🎯",
      prompt: "What content am I missing?",
    },
  ],
  twitter: [
    {
      title: "Analyze a link",
      icon: "🔗",
      prompt: "Analyze this: https://example.com/article",
    },
    {
      title: "Analyze a tweet topic",
      icon: "💬",
      prompt: "Analyze: Tweet about automation mistakes founders make",
    },
    {
      title: "Analyze an idea",
      icon: "💡",
      prompt: "Analyze: Idea - The paradox of trying to automate everything",
    },
    {
      title: "Analyze my draft",
      icon: "✏️",
      prompt: "Analyze this draft: We help businesses grow faster with automation",
    },
  ],
};

const SYSTEM_PROMPT = `You are a content creation assistant for X/Twitter. You help users create engaging tweets, threads, and social media content.

Your capabilities:
1. Generate tweets and threads from ideas
2. Adapt viral content to user's voice
3. Create content from YouTube videos or blog posts
4. Research trending topics

Be concise, engaging, and focus on creating content that drives engagement. When generating tweets, keep them under 280 characters unless asked for a thread.

Format your responses clearly. When generating multiple options, number them.`;

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"writing" | "research" | "twitter">("writing");
  const [twitterAnalysis, setTwitterAnalysis] = useState<any>(null);

  const formatTwitterAnalysis = (data: any): string => {
    const { input, analysis } = data;
    const preview = analysis.source_title.length > 80 
      ? analysis.source_title.substring(0, 80) + '...' 
      : analysis.source_title;
    
    return `📊 ANALYSIS

**Content:** "${preview}"
**Type:** ${input.input_type} | **Length:** ${analysis.key_insights?.[0]?.match(/\d+/)?.[0] || '?'} chars

**Performance:**
${analysis.key_insights?.slice(1).map((i: string) => `• ${i}`).join('\n')}

**Structure:**
${analysis.main_points?.map((p: string) => `• ${p}`).join('\n')}

**Fixes Needed:**
${analysis.content_gaps?.map((g: string) => `• ${g}`).join('\n')}

**Hashtags:** ${analysis.trending_hashtags?.join(' ')}`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Twitter Agent Mode - use Input + Analyze pipeline
      if (mode === "twitter") {
        const response = await fetch("/api/twitter/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input }),
        });

        if (!response.ok) {
          throw new Error("Failed to analyze content");
        }

        const data = await response.json();
        setTwitterAnalysis(data.data);

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: formatTwitterAnalysis(data.data),
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Writing/Research Mode - use Kimi chat
        // Build conversation history for context
        const conversationHistory = messages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...conversationHistory,
              { role: "user", content: input },
            ],
            mode,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 px-6 py-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Agent</h1>
          <p className="text-sm text-muted-foreground">
            Your AI content assistant for X/Twitter
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={mode === "writing" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("writing")}
          >
            ✍️ Writing
          </Button>
          <Button
            variant={mode === "research" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("research")}
          >
            🔍 Research
          </Button>
          <Button
            variant={mode === "twitter" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("twitter")}
          >
            🐦 Twitter Agent
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                What would you like to create?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Start a conversation or pick a recipe below
              </p>
            </div>

            {/* Recipes */}
            <div className="grid w-full max-w-2xl grid-cols-2 gap-4">
              {recipes[mode].map((recipe: any) => (
                <Card
                  key={recipe.title}
                  className="cursor-pointer border-border/50 bg-card p-5 transition-all duration-200 hover:border-border hover:bg-accent/30 hover:shadow-md"
                  onClick={() => setInput(recipe.prompt)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{recipe.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {recipe.title}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Badge variant="outline" className="text-muted-foreground">
              Mode: {mode === "writing" ? "✍️ Writing" : mode === "research" ? "🔍 Research" : "🐦 Twitter Agent"}
            </Badge>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border/50 text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-card border border-border/50 px-4 py-3 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border/30 p-5">
        <div className="mx-auto flex max-w-3xl gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what content you want to create..."
            className="min-h-[48px] max-h-[200px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
