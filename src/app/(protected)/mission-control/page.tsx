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
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    description: 'Scrapes Twitter & YouTube. Tracks velocity, engagement, virality signals.',
    metric: '21 sources',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Strategist',
    role: 'EMPLOYEE #2',
    icon: Brain,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    description: 'Develops your angle. Converts ideas into threads in your exact voice.',
    metric: '63 insights',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Repurposer',
    role: 'EMPLOYEE #3',
    icon: Layers,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    description: 'Expands threads into YT scripts, IG scripts, and tweet variations.',
    metric: '63 drafts',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Humanizer',
    role: 'EMPLOYEE #4',
    icon: Sparkles,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    description: 'Removes robotic phrasing. Improves clarity and natural flow.',
    metric: '0 reviewed',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Viral Optimizer',
    role: 'EMPLOYEE #5',
    icon: Target,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-slate-400 text-sm tracking-wider mb-1">MISSION CONTROL</p>
            <h1 className="text-3xl font-bold text-white">Content Team</h1>
            <p className="text-slate-400 text-sm mt-1">
              Simple workflow: pick source videos → Generate Pack → open pack → approve outputs.
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4">
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg px-6 py-3 text-center min-w-[100px]">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Sources</p>
              <p className="text-2xl font-bold text-white">21</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg px-6 py-3 text-center min-w-[100px]">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Packs</p>
              <p className="text-2xl font-bold text-white">1</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg px-6 py-3 text-center min-w-[100px]">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Published</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Workforce */}
      <div className="mb-8">
        <p className="text-slate-400 text-sm tracking-wider mb-4">AI WORKFORCE</p>
        <div className="grid grid-cols-5 gap-4">
          {workforce.map((employee, idx) => {
            const Icon = employee.icon;
            return (
              <Card 
                key={employee.id}
                className={`${employee.bgColor} ${employee.borderColor} border rounded-xl overflow-hidden hover:scale-[1.02] transition-transform`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-full ${employee.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${employee.color}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-green-400">{employee.status}</span>
                    </div>
                  </div>
                  
                  <p className="text-slate-400 text-xs mb-1">{employee.role}</p>
                  <h3 className={`font-bold text-lg mb-2 ${employee.color}`}>{employee.name}</h3>
                  <p className="text-slate-300 text-xs leading-relaxed mb-3">
                    {employee.description}
                  </p>
                  
                  <div className={`${employee.bgColor} rounded-lg px-3 py-2 text-center`}>
                    <span className={`text-sm font-semibold ${employee.color}`}>{employee.metric}</span>
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
            <h2 className="text-lg font-semibold text-white">Scout Feed</h2>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
              21 sources tracked
            </Badge>
          </div>
          
          <div className="space-y-3">
            {scoutFeed.map((source) => (
              <Card key={source.id} className="bg-slate-900/80 border-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Youtube className="w-4 h-4 text-red-400" />
                    <Badge className="bg-green-500/20 text-green-300 text-xs">
                      Score {source.score}
                    </Badge>
                    <span className="text-slate-500 text-xs">{source.date}</span>
                  </div>
                  
                  <h3 className="text-white font-semibold mb-3">Source #{source.id}</h3>
                  
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="bg-slate-800/50 rounded p-2">
                      <p className="text-slate-400 text-xs">VIEWS</p>
                      <p className="text-white font-semibold">{source.views}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2">
                      <p className="text-slate-400 text-xs">VELOCITY</p>
                      <p className="text-white font-semibold">{source.velocity}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2">
                      <p className="text-slate-400 text-xs">PLATFORM</p>
                      <p className="text-white font-semibold capitalize">{source.platform}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2">
                      <p className="text-slate-400 text-xs">STATUS</p>
                      <p className="text-yellow-400 font-semibold capitalize">{source.status}</p>
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
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
            <h2 className="text-lg font-semibold text-white">Generated Content Packs</h2>
            <select className="bg-slate-800 border-slate-700 text-white text-sm rounded px-3 py-1">
              <option>Active (1)</option>
              <option>All</option>
              <option>Archived</option>
            </select>
          </div>
          
          {selectedPack && (
            <Card className="bg-slate-900/80 border-slate-700/50">
              <CardContent className="p-4">
                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Generate Content
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-green-500 text-green-400 hover:bg-green-500/10">
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-orange-500 text-orange-400 hover:bg-orange-500/10">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10">
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
                
                {/* Platform Tabs */}
                <div className="flex border-b border-slate-700 mb-4">
                  <button
                    onClick={() => setActiveTab('twitter')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'twitter' 
                        ? 'border-blue-500 text-blue-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Twitter className="w-4 h-4" />
                    X / TWITTER
                  </button>
                  <button
                    onClick={() => setActiveTab('instagram')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'instagram' 
                        ? 'border-pink-500 text-pink-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Instagram className="w-4 h-4" />
                    INSTAGRAM
                  </button>
                  <button
                    onClick={() => setActiveTab('youtube')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'youtube' 
                        ? 'border-red-500 text-red-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
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
                      <p className="text-slate-400 text-xs uppercase">Instagram Script</p>
                      <Button size="sm" variant="ghost" className="h-6 text-xs">
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                      <div>
                        <span className="text-slate-400 text-xs">Hook:</span>
                        <p className="text-white">{selectedPack.content.hook}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs">Body:</span>
                        <p className="text-white">{selectedPack.content.body}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs">Hook:</span>
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
  );
}
