"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const instructionCategories = [
  {
    type: "tone",
    title: "Tone & Voice",
    icon: "🎯",
    placeholder:
      "e.g., Casual but knowledgeable. Mix humor with actionable insights. Speak like a friend who happens to be an expert.",
  },
  {
    type: "style",
    title: "Writing Style",
    icon: "✍️",
    placeholder:
      "e.g., Short sentences. Use line breaks for readability. Start with a hook. End with a CTA or thought-provoking question.",
  },
  {
    type: "format",
    title: "Format Rules",
    icon: "📐",
    placeholder:
      "e.g., Max 280 chars for tweets. Use emojis sparingly. No hashtags unless relevant. Thread format for long-form.",
  },
  {
    type: "avoid",
    title: "Things to Avoid",
    icon: "🚫",
    placeholder:
      "e.g., Don't be preachy. Avoid corporate jargon. Never use 'leverage' or 'synergy'. Don't start with 'Just'.",
  },
];

export default function InstructionsPage() {
  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Custom Instructions
          </h1>
          <p className="text-sm text-muted-foreground">
            Define your brand voice and writing rules for AI content generation
          </p>
        </div>
        <Button>Save All</Button>
      </div>

      <div className="grid gap-5">
        {instructionCategories.map((cat) => (
          <Card key={cat.type} className="border-border/50 bg-card transition-all duration-200 hover:border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground">
                <span className="text-xl">{cat.icon}</span>
                {cat.title}
                <Badge variant="outline">
                  {cat.type}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={cat.placeholder}
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
