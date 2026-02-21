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
    accent: 'cyan',
    description: 'Scrapes Twitter \u0026 YouTube. Tracks velocity, engagement, virality signals.',
    metric: '21 sources',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Strategist',
    role: 'EMPLOYEE #2',
    icon: Brain,
    accent: 'purple',
    description: 'Develops your angle. Converts ideas into threads in your exact voice.',
    metric: '63 insights',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Repurposer',
    role: 'EMPLOYEE #3',
    icon: Layers,
    accent: 'orange',
    description: 'Expands threads into YT scripts, IG scripts, and tweet variations.',
    metric: '63 drafts',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Humanizer',
    role: 'EMPLOYEE #4',
    icon: Sparkles,
    accent: 'green',
    description: 'Removes robotic phrasing. Improves clarity and natural flow.',
    metric: '0 reviewed',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Viral Optimizer',
    role: 'EMPLOYEE #5',
    icon: Target,
    accent: 'pink',
    description: 'Reviews for virality. Matches tone. Strengthens hooks. Delivers to dashboard.',
    metric: '0 published',
    status: 'Active',
  },
];

const accentColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.2)]' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(139,92,246,0.2)]' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]' },
  green: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]' },
  pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', glow: 'shadow-[0_0_15px_rgba(236,72,153,0.2)]' },
};

// Mock Scout Feed data
const scoutFeed = [
  {
    id: 1,
    platform: 'youtube',
    title: 'How I Built a $10M AI Agency in 12 Months',
    author: 'AI Entrepreneur',
    views: '892K',
    velocity: '45K/hr',
    score: 9,
    status: 'queued',
  },
  {
    id: 2,
    platform: 'youtube',
    title: '10 Marketing Mistakes That Cost Me $500K',
    author: 'Growth Expert',
    views: '456K',
    velocity: '8K/hr',
    score: 7,
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

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('instagram');
  const [selectedPack, setSelectedPack] = useState(contentPacks[0]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 px-6 py-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-cyan-500/60 mb-1">Mission Control</p>
          <h1 className="text-xl font-semibold tracking-tight text-white">Content Team</h1>
          <p className="text-sm text-slate-400 mt-1">
            Simple workflow: pick source videos → Generate Pack → open pack → approve outputs.
          </p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-3">
          <div className="bg-slate-900/80 border border-cyan-500/20 rounded-xl px-5 py-3 text-center min-w-[90px] shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-500/60 mb-1">Sources</p>
            <p className="text-2xl font-bold text-white">21</p>
          </div>
          <div className="bg-slate-900/80 border border-cyan-500/20 rounded-xl px-5 py-3 text-center min-w-[90px] shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-500/60 mb-1">Packs</p>
            <p className="text-2xl font-bold text-white">1</p>
          </div>
          <div className="bg-slate-900/80 border border-cyan-500/20 rounded-xl px-5 py-3 text-center min-w-[90px] shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-500/60 mb-1">Published</p>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* AI Workforce */}
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-cyan-500/60 mb-4">AI WORKFORCE</p>
          
          <div className="grid grid-cols-5 gap-4">
            {workforce.map((employee) => {
              const Icon = employee.icon;
              const colors = accentColors[employee.accent];
              return (
                <Card 
                  key={employee.id}
                  className={`bg-slate-900/60 border ${colors.border} backdrop-blur-sm hover:${colors.glow} transition-all cursor-pointer group`}
                  onClick={() => {
                    if (employee.id === 1) window.location.href = '/employees/scout';
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${colors.bg} ${colors.border} border`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${colors.text.replace('text-', 'bg-')} animate-pulse`} />
                        <span className={`text-xs ${colors.text}`}>{employee.status}</span>
                      </div>
                    </div>
                    
                    <p className="text-slate-500 text-xs mb-1">{employee.role}</p>
                    <h3 className={`font-semibold text-white text-base mb-2 group-hover:${colors.text} transition-colors`}>{employee.name}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-3">
                      {employee.description}
                    </p>
                    
                    <div className={`${colors.bg} ${colors.border} border rounded-lg px-3 py-2 text-center`}>
                      <span className={`text-sm font-medium ${colors.text}`}>{employee.metric}</span>
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
              <h2 className="text-base font-semibold text-white">Scout Feed</h2>
              <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                21 sources tracked
              </Badge>
            </div>
            
            <div className="space-y-3">
              {scoutFeed.map((source) => (
                <Card key={source.id} className="bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Youtube className="w-4 h-4 text-red-400" />
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs">
                        Score {source.score}
                      </Badge>
                    </div>
                    
                    <h3 className="text-white font-semibold mb-3">{source.title}</h3>
                    
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-slate-800/80 rounded-lg p-2 border border-cyan-500/10">
                        <p className="text-slate-500 text-[10px] uppercase">Views</p>
                        <p className="text-white font-semibold text-sm">{source.views}</p>
                      </div>
                      
                      <div className="bg-slate-800/80 rounded-lg p-2 border border-cyan-500/10">
                        <p className="text-slate-500 text-[10px] uppercase">Velocity</p>
                        <p className="text-white font-semibold text-sm">{source.velocity}</p>
                      </div>
                      
                      <div className="bg-slate-800/80 rounded-lg p-2 border border-cyan-500/10">
                        <p className="text-slate-500 text-[10px] uppercase">Status</p>
                        <p className="text-yellow-400 font-semibold text-sm capitalize">{source.status}</p>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
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
              <h2 className="text-base font-semibold text-white">Generated Content Packs</h2>
              <select className="bg-slate-900/80 border-cyan-500/20 text-white text-sm rounded-lg px-3 py-1.5">
                <option>Active (1)</option>
                <option>All</option>
                <option>Archived</option>
              </select>
            </div>
            
            {selectedPack && (
              <Card className="bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  {/* Action Buttons */}
                  <div className="flex gap-2 mb-4">
                    <Button size="sm" className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30">
                      Generate
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10">
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                  
                  {/* Platform Tabs */}
                  <div className="flex border-b border-cyan-500/20 mb-4">
                    <button
                      onClick={() => setActiveTab('twitter')}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'twitter' 
                          ? 'border-cyan-400 text-cyan-400' 
                          : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      <Twitter className="w-4 h-4" />
                      X / TWITTER
                    </button>
                    <button
                      onClick={() => setActiveTab('instagram')}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'instagram' 
                          ? 'border-pink-400 text-pink-400' 
                          : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      <Instagram className="w-4 h-4" />
                      INSTAGRAM
                    </button>
                    <button
                      onClick={() => setActiveTab('youtube')}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'youtube' 
                          ? 'border-red-400 text-red-400' 
                          : 'border-transparent text-slate-400 hover:text-white'
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
                        <p className="text-slate-500 text-xs uppercase">Instagram Script</p>
                        <Button size="sm" variant="ghost" className="h-6 text-xs text-cyan-400 hover:text-cyan-300">
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      
                      <div className="bg-slate-800/80 rounded-xl p-4 space-y-3 border border-cyan-500/10">
                        <div>
                          <span className="text-cyan-500/60 text-xs">Hook:</span>
                          <p className="text-white">{selectedPack.content.hook}</p>
                        </div>
                        <div>
                          <span className="text-cyan-500/60 text-xs">Body:</span>
                          <p className="text-white">{selectedPack.content.body}</p>
                        </div>
                        <div>
                          <span className="text-cyan-500/60 text-xs">CTA:</span>
                          <p className="text-white">{selectedPack.content.cta}</p>
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
