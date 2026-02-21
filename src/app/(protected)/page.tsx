'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Radio, 
  Brain, 
  Layers, 
  Sparkles, 
  Target,
  Play,
  Check,
  Edit,
  X,
  Copy,
  Youtube,
  Twitter,
  Instagram
} from 'lucide-react';

// AI Workforce Team
const workforce = [
  {
    id: 1,
    name: 'Scout',
    role: 'EMPLOYEE #1',
    icon: Radio,
    description: 'Scrapes Twitter \u0026 YouTube. Tracks velocity, engagement, virality signals.',
    metric: '21 sources',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Strategist',
    role: 'EMPLOYEE #2',
    icon: Brain,
    description: 'Develops your angle. Converts ideas into threads in your exact voice.',
    metric: '63 insights',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Repurposer',
    role: 'EMPLOYEE #3',
    icon: Layers,
    description: 'Expands threads into YT scripts, IG scripts, and tweet variations.',
    metric: '63 drafts',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Humanizer',
    role: 'EMPLOYEE #4',
    icon: Sparkles,
    description: 'Removes robotic phrasing. Improves clarity and natural flow.',
    metric: '0 reviewed',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Viral Optimizer',
    role: 'EMPLOYEE #5',
    icon: Target,
    description: 'Reviews for virality. Matches tone. Strengthens hooks. Delivers to dashboard.',
    metric: '0 published',
    status: 'Active',
  },
];

// Mock Scout Feed data
const scoutFeed = [
  {
    id: 1,
    platform: 'youtube',
    score: 10,
    date: '12/02/2026 13:43',
    views: '172.0K',
    velocity: '1.0K/hr',
    status: 'queued',
  },
  {
    id: 2,
    platform: 'youtube',
    score: 10,
    date: '13/02/2026 13:43',
    views: '159.0K',
    velocity: '1.1K/hr',
    status: 'queued',
  },
];

// Mock Content Packs
const contentPacks = [
  {
    id: 1,
    status: 'Active',
    platform: 'instagram',
    content: {
      hook: 'Most people do this wrong.',
      body: 'AntiGravity + Claude Code Destroys Every Workflow Tool (NEW Skill)',
      cta: 'Most people watch this and miss the implementation layer.',
    },
  },
];

export default function MissionControlPage() {
  const [activeTab, setActiveTab] = useState('instagram');
  const [selectedPack, setSelectedPack] = useState(contentPacks[0]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 px-6 py-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-1">Mission Control</p>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Content Team</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Simple workflow: pick source videos → Generate Pack → open pack → approve outputs.
          </p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-3">
          <div className="bg-card border border-border/50 rounded-lg px-5 py-3 text-center min-w-[90px]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Sources</p>
            <p className="text-xl font-bold text-foreground">21</p>
          </div>
          <div className="bg-card border border-border/50 rounded-lg px-5 py-3 text-center min-w-[90px]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Packs</p>
            <p className="text-xl font-bold text-foreground">1</p>
          </div>
          <div className="bg-card border border-border/50 rounded-lg px-5 py-3 text-center min-w-[90px]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Published</p>
            <p className="text-xl font-bold text-foreground">0</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* AI Workforce */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-4">AI WORKFORCE</p>
          
          <div className="grid grid-cols-5 gap-4">
            {workforce.map((employee) => {
              const Icon = employee.icon;
              return (
                <Card 
                  key={employee.id}
                  className="border-border/50 bg-card hover:border-border transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sidebar-accent">
                        <Icon className="w-5 h-5 text-foreground" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs text-green-500">{employee.status}</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-xs mb-1">{employee.role}</p>
                    <h3 className="font-semibold text-foreground text-base mb-2">{employee.name}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                      {employee.description}
                    </p>
                    
                    <div className="bg-sidebar-accent rounded-md px-3 py-2 text-center">
                      <span className="text-sm font-medium text-foreground">{employee.metric}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Scout Feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Scout Feed</h2>
              <Badge variant="outline" className="text-muted-foreground">
                21 sources tracked
              </Badge>
            </div>
            
            <div className="space-y-3">
              {scoutFeed.map((source) => (
                <Card key={source.id} className="border-border/50 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Youtube className="w-4 h-4 text-red-500" />
                      <Badge className="bg-green-500/10 text-green-500 text-xs hover:bg-green-500/20">
                        Score {source.score}
                      </Badge>
                      <span className="text-muted-foreground text-xs">{source.date}</span>
                    </div>
                    
                    <h3 className="text-foreground font-semibold mb-3">Source #{source.id}</h3>
                    
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <div className="bg-sidebar-accent rounded p-2">
                        <p className="text-muted-foreground text-[10px] uppercase">Views</p>
                        <p className="text-foreground font-semibold text-sm">{source.views}</p>
                      </div>
                      
                      <div className="bg-sidebar-accent rounded p-2">
                        <p className="text-muted-foreground text-[10px] uppercase">Velocity</p>
                        <p className="text-foreground font-semibold text-sm">{source.velocity}</p>
                      </div>
                      
                      <div className="bg-sidebar-accent rounded p-2">
                        <p className="text-muted-foreground text-[10px] uppercase">Platform</p>
                        <p className="text-foreground font-semibold text-sm capitalize">{source.platform}</p>
                      </div>
                      
                      <div className="bg-sidebar-accent rounded p-2">
                        <p className="text-muted-foreground text-[10px] uppercase">Status</p>
                        <p className="text-yellow-500 font-semibold text-sm capitalize">{source.status}</p>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Generate Pack
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Generated Content Packs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Generated Content Packs</h2>
              <select className="bg-card border-border/50 text-foreground text-sm rounded px-3 py-1.5">
                <option>Active (1)</option>
                <option>All</option>
                <option>Archived</option>
              </select>
            </div>
            
            {selectedPack && (
              <Card className="border-border/50 bg-card">
                <CardContent className="p-4">
                  {/* Action Buttons */}
                  <div className="flex gap-2 mb-4">
                    <Button size="sm" className="flex-1">
                      Generate Content
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-green-500/50 text-green-500 hover:bg-green-500/10">
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-orange-500/50 text-orange-500 hover:bg-orange-500/10">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10">
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                  
                  {/* Platform Tabs */}
                  <div className="flex border-b border-border/30 mb-4">
                    <button
                      onClick={() => setActiveTab('twitter')}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'twitter' 
                          ? 'border-primary text-foreground' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Twitter className="w-4 h-4" />
                      X / TWITTER
                    </button>
                    <button
                      onClick={() => setActiveTab('instagram')}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'instagram' 
                          ? 'border-primary text-foreground' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Instagram className="w-4 h-4" />
                      INSTAGRAM
                    </button>
                    <button
                      onClick={() => setActiveTab('youtube')}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'youtube' 
                          ? 'border-primary text-foreground' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Youtube className="w-4 h-4" />
                      YOUTUBE
                    </button>
                  </div>
                  
                  {/* Content Preview */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-muted-foreground text-xs uppercase">Instagram Script</p>
                        <Button size="sm" variant="ghost" className="h-6 text-xs">
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      
                      <div className="bg-sidebar-accent rounded-lg p-4 space-y-3">
                        <div>
                          <span className="text-muted-foreground text-xs">Hook:</span>
                          <p className="text-foreground">{selectedPack.content.hook}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Body:</span>
                          <p className="text-foreground">{selectedPack.content.body}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Hook:</span>
                          <p className="text-foreground">{selectedPack.content.cta}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
