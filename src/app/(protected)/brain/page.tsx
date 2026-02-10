"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: "analyzing" | "ready";
  source?: string;
  tweetCount?: number;
}

interface VoiceProfile {
  tone: string;
  themes: string[];
  vocabulary: string[];
  patterns: string[];
}

interface TwitterConnectForm {
  username: string;
  timeframe: string;
  performanceFilter: string;
}

interface SiteConnectForm {
  url: string;
  type: string;
}

export default function BrainPage() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Best Tweets 2025.csv",
      type: "Tweet Export",
      uploadedAt: "2026-02-04",
      status: "ready",
    },
    {
      id: "2",
      name: "elonmusk",
      type: "Twitter Account",
      uploadedAt: "2026-02-04",
      status: "ready",
      source: "https://x.com/elonmusk",
      tweetCount: 500,
    },
  ]);

  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>({
    tone: "Direct, slightly sarcastic, no fluff",
    themes: ["AI", "Automation", "Growth", "SaaS"],
    vocabulary: ["build", "ship", "scale", "automate"],
    patterns: ["Questions as hooks", "Short sentences", "Contrarian takes"],
  });

  const [isUploading, setIsUploading] = useState(false);
  const [showTwitterForm, setShowTwitterForm] = useState(false);
  const [showSiteForm, setShowSiteForm] = useState(false);
  const [showYouTubeForm, setShowYouTubeForm] = useState(false);
  const [showLinkedInForm, setShowLinkedInForm] = useState(false);
  
  const [twitterForm, setTwitterForm] = useState<TwitterConnectForm>({
    username: "",
    timeframe: "6m",
    performanceFilter: "all",
  });
  const [siteForm, setSiteForm] = useState<SiteConnectForm>({
    url: "",
    type: "blog",
  });
  const [youTubeForm, setYouTubeForm] = useState({ url: "", channel: "" });
  const [linkedInForm, setLinkedInForm] = useState({ url: "", profile: "" });
  
  const [isConnectingTwitter, setIsConnectingTwitter] = useState(false);
  const [isConnectingSite, setIsConnectingSite] = useState(false);
  const [isConnectingYouTube, setIsConnectingYouTube] = useState(false);
  const [isConnectingLinkedIn, setIsConnectingLinkedIn] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (type: string) => {
    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newDoc: Document = {
      id: Date.now().toString(),
      name: `New ${type} Document`,
      type,
      uploadedAt: new Date().toISOString().split('T')[0],
      status: "analyzing",
    };
    
    setDocuments([newDoc, ...documents]);
    setIsUploading(false);
    
    setTimeout(() => {
      setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: "ready" } : d));
    }, 3000);
  };

  const handleConnectTwitter = async () => {
    if (!twitterForm.username.trim()) return;
    setIsConnectingTwitter(true);
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'twitter',
          username: twitterForm.username,
          options: { timeframe: twitterForm.timeframe, performanceFilter: twitterForm.performanceFilter },
        }),
      });

      const data = await response.json();
      
      const newDoc: Document = {
        id: Date.now().toString(),
        name: `@${twitterForm.username}`,
        type: "Twitter Account",
        uploadedAt: new Date().toISOString().split('T')[0],
        status: "ready",
        source: `https://x.com/${twitterForm.username}`,
        tweetCount: data.tweets?.length || 0,
      };
      
      setDocuments([newDoc, ...documents]);
      await extractVoiceFromTweets(data.tweets || []);
      alert(`Connected to @${twitterForm.username}!`);
      setTwitterForm({ username: "", timeframe: "6m", performanceFilter: "all" });
      setShowTwitterForm(false);
    } catch (error) {
      alert('Failed to connect. Please try again.');
    } finally {
      setIsConnectingTwitter(false);
    }
  };

  const handleConnectSite = async () => {
    if (!siteForm.url.trim()) return;
    setIsConnectingSite(true);
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'blog',
          url: siteForm.url,
          options: { type: siteForm.type },
        }),
      });

      const data = await response.json();
      
      const newDoc: Document = {
        id: Date.now().toString(),
        name: siteForm.url.replace(/https?:\/\//, '').split('/')[0] || siteForm.url,
        type: "Website",
        uploadedAt: new Date().toISOString().split('T')[0],
        status: "ready",
        source: siteForm.url,
      };
      
      setDocuments([newDoc, ...documents]);
      alert(`Connected to ${siteForm.url}!`);
      setSiteForm({ url: "", type: "blog" });
      setShowSiteForm(false);
    } catch (error) {
      alert('Failed to scrape site. Please try again.');
    } finally {
      setIsConnectingSite(false);
    }
  };

  const handleConnectYouTube = async () => {
    if (!youTubeForm.url.trim()) return;
    setIsConnectingYouTube(true);
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'youtube',
          url: youTubeForm.url,
          options: { channel: youTubeForm.channel },
        }),
      });

      const data = await response.json();
      
      const newDoc: Document = {
        id: Date.now().toString(),
        name: youTubeForm.channel || youTubeForm.url.split('/').pop() || 'YouTube Channel',
        type: "YouTube Channel",
        uploadedAt: new Date().toISOString().split('T')[0],
        status: "ready",
        source: youTubeForm.url,
      };
      
      setDocuments([newDoc, ...documents]);
      alert(`Connected to YouTube!`);
      setYouTubeForm({ url: "", channel: "" });
      setShowYouTubeForm(false);
    } catch (error) {
      alert('Failed to connect YouTube. Please try again.');
    } finally {
      setIsConnectingYouTube(false);
    }
  };

  const handleConnectLinkedIn = async () => {
    if (!linkedInForm.url.trim()) return;
    setIsConnectingLinkedIn(true);
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'linkedin',
          url: linkedInForm.url,
          options: { profile: linkedInForm.profile },
        }),
      });

      const data = await response.json();
      
      const newDoc: Document = {
        id: Date.now().toString(),
        name: linkedInForm.profile || linkedInForm.url.split('/').pop() || 'LinkedIn',
        type: "LinkedIn Profile",
        uploadedAt: new Date().toISOString().split('T')[0],
        status: "ready",
        source: linkedInForm.url,
      };
      
      setDocuments([newDoc, ...documents]);
      alert(`Connected to LinkedIn!`);
      setLinkedInForm({ url: "", profile: "" });
      setShowLinkedInForm(false);
    } catch (error) {
      alert('Failed to connect LinkedIn. Please try again.');
    } finally {
      setIsConnectingLinkedIn(false);
    }
  };

  const extractVoiceFromTweets = async (tweets: any[]) => {
    setIsExtracting(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Return JSON: {tone, themes, vocabulary, patterns}' },
            { role: 'user', content: `Analyze these ${tweets.length} tweets and extract brand voice: ${tweets.slice(0, 50).map(t => t.content || t.text).join('\n')}` }
          ],
        }),
      });

      const data = await response.json();
      const profile = JSON.parse(data.content);
      setVoiceProfile(profile);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Brain</h1>
            <p className="text-sm text-muted-foreground">Connect sources to train your AI's voice</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowSiteForm(!showSiteForm)} size="sm">Add Site</Button>
            <Button variant="outline" onClick={() => setShowYouTubeForm(!showYouTubeForm)} size="sm">YouTube</Button>
            <Button variant="outline" onClick={() => setShowLinkedInForm(!showLinkedInForm)} size="sm">LinkedIn</Button>
            <Button variant="outline" onClick={() => setShowTwitterForm(!showTwitterForm)} size="sm">Twitter</Button>
            <Button onClick={() => fileInputRef.current?.click()}>+ Add Document</Button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.csv,.pdf" onChange={(e) => e.target.files?.[0] && handleUpload("General")} />
          </div>
        </div>
      </div>

      {/* Connection Forms */}
      {showTwitterForm && (
        <Card className="mx-6 mt-4 border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <h3 className="mb-4 text-sm font-medium text-foreground">Connect Twitter Account</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs text-muted-foreground">Username</label>
                <div className="flex">
                  <span className="flex items-center rounded-l-lg border border-r-0 border-border/50 bg-secondary px-3 text-muted-foreground">@</span>
                  <Input placeholder="elonmusk" value={twitterForm.username} onChange={(e) => setTwitterForm({ ...twitterForm, username: e.target.value })} className="rounded-l-none" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Timeframe</label>
                <select value={twitterForm.timeframe} onChange={(e) => setTwitterForm({ ...twitterForm, timeframe: e.target.value })} className="w-full h-10 rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm text-foreground transition-all duration-200 hover:border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="3m">Last 3 months</option>
                  <option value="6m">Last 6 months</option>
                  <option value="12m">Last 12 months</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Performance</label>
                <select value={twitterForm.performanceFilter} onChange={(e) => setTwitterForm({ ...twitterForm, performanceFilter: e.target.value })} className="w-full h-10 rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm text-foreground transition-all duration-200 hover:border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="all">All tweets</option>
                  <option value="top50">Top 50%</option>
                  <option value="top25">Top 25%</option>
                  <option value="top10">Top 10%</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={handleConnectTwitter} disabled={isConnectingTwitter}>{isConnectingTwitter ? 'Connecting...' : 'Connect & Extract'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showSiteForm && (
        <Card className="mx-6 mt-4 border-green-500/30 bg-green-500/5">
          <CardContent className="p-5">
            <h3 className="mb-4 text-sm font-medium text-foreground">Add Website to Scrape</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs text-muted-foreground">Website URL</label>
                <Input placeholder="https://example.com/blog" value={siteForm.url} onChange={(e) => setSiteForm({ ...siteForm, url: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Type</label>
                <select value={siteForm.type} onChange={(e) => setSiteForm({ ...siteForm, type: e.target.value })} className="w-full h-10 rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm text-foreground transition-all duration-200 hover:border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="blog">Blog</option>
                  <option value="seo">SEO Content</option>
                  <option value="competitor">Competitor</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={handleConnectSite} disabled={isConnectingSite} className="bg-green-600 hover:bg-green-700">{isConnectingSite ? 'Scraping...' : 'Scrape & Analyze'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showYouTubeForm && (
        <Card className="mx-6 mt-4 border-red-500/30 bg-red-500/5">
          <CardContent className="p-5">
            <h3 className="mb-4 text-sm font-medium text-foreground">Connect YouTube Channel</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Channel URL or Video URL</label>
                <Input placeholder="https://youtube.com/@channel" value={youTubeForm.url} onChange={(e) => setYouTubeForm({ ...youTubeForm, url: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Channel Name (optional)</label>
                <Input placeholder="Channel Name" value={youTubeForm.channel} onChange={(e) => setYouTubeForm({ ...youTubeForm, channel: e.target.value })} />
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={handleConnectYouTube} disabled={isConnectingYouTube} className="bg-red-600 hover:bg-red-700">{isConnectingYouTube ? 'Fetching...' : 'Connect & Transcribe'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showLinkedInForm && (
        <Card className="mx-6 mt-4 border-blue-700/30 bg-blue-700/5">
          <CardContent className="p-5">
            <h3 className="mb-4 text-sm font-medium text-foreground">Connect LinkedIn Profile</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Profile URL</label>
                <Input placeholder="https://linkedin.com/in/username" value={linkedInForm.url} onChange={(e) => setLinkedInForm({ ...linkedInForm, url: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Name (optional)</label>
                <Input placeholder="Full Name" value={linkedInForm.profile} onChange={(e) => setLinkedInForm({ ...linkedInForm, profile: e.target.value })} />
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={handleConnectLinkedIn} disabled={isConnectingLinkedIn} className="bg-blue-700 hover:bg-blue-800">{isConnectingLinkedIn ? 'Fetching...' : 'Connect & Extract'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Documents */}
        <div className="w-1/2 border-r border-border/30 p-6">
          <h2 className="mb-5 text-sm font-medium text-muted-foreground">Your Sources</h2>
          
          <div className="mb-6 grid grid-cols-2 gap-4">
            {[
              { type: "Brand Voice", icon: "🎤", desc: "Define your tone & style" },
              { type: "Example Posts", icon: "📱", desc: "Best-performing posts" },
              { type: "Blog Content", icon: "📄", desc: "Blog posts to repurpose" },
              { type: "Video Transcripts", icon: "🎬", desc: "YouTube/podcast content" },
            ].map((doc) => (
              <Card key={doc.type} className="cursor-pointer border-border/50 bg-card transition-all duration-200 hover:border-border hover:bg-accent/30 hover:shadow-md" onClick={() => handleUpload(doc.type)}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-foreground"><span>{doc.icon}</span>{doc.type}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0"><p className="text-xs text-muted-foreground">{doc.desc}</p></CardContent>
              </Card>
            ))}
          </div>

          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Connected Sources</h3>
          
          {isUploading ? (
            <div className="flex h-20 items-center justify-center rounded-lg border border-border/50 border-dashed">
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {documents.map((doc) => (
                  <Card key={doc.id} className="border-border/50 bg-card">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-secondary p-2.5 text-sm">
                          {doc.type === "Tweet Export" ? "🐦" : 
                           doc.type === "Twitter Account" ? "🔗" :
                           doc.type === "Website" ? "🌐" :
                           doc.type === "YouTube Channel" ? "🎬" :
                           doc.type === "LinkedIn Profile" ? "💼" :
                           doc.type === "Brand Voice" ? "🎤" : "📄"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.uploadedAt} · {doc.status === "analyzing" ? "Analyzing..." : doc.tweetCount ? `${doc.tweetCount} tweets` : 'Ready'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Right: Voice Profile */}
        <div className="w-1/2 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Brand Voice</h2>
            {isExtracting && <Badge>Extracting...</Badge>}
          </div>

          {voiceProfile ? (
            <div className="space-y-4">
              <Card className="border-border/50 bg-card">
                <CardContent className="p-5">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Tone</p>
                  <p className="text-sm text-foreground">{voiceProfile.tone}</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card">
                <CardContent className="p-5">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Themes</p>
                  <div className="flex flex-wrap gap-2">
                    {voiceProfile.themes.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card">
                <CardContent className="p-5">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Vocabulary</p>
                  <div className="flex flex-wrap gap-2">
                    {voiceProfile.vocabulary.map((w) => <Badge key={w} className="bg-primary/20 text-primary">{w}</Badge>)}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card">
                <CardContent className="p-5">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Writing Patterns</p>
                  <ul className="space-y-1.5">{voiceProfile.patterns.map((p, i) => <li key={i} className="text-sm text-foreground/80">• {p}</li>)}</ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-border/50 border-dashed bg-card/50">
              <CardContent className="flex h-40 flex-col items-center justify-center p-6 text-center">
                <p className="mb-2 text-sm text-muted-foreground">No voice profile yet</p>
                <p className="text-xs text-muted-foreground/70">Connect Twitter, YouTube, or LinkedIn to extract your voice</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
