'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Radio, 
  Search,
  Settings,
  FileText,
  AlertCircle,
  Plus,
  Trash2,
  Play,
  RefreshCw,
  Youtube,
  Twitter,
  TrendingUp,
  Clock,
  Hash,
  User
} from 'lucide-react';

// Mock discovered sources
const mockSources = [
  {
    id: 1,
    platform: 'youtube',
    title: 'How I Built a $10M AI Agency in 12 Months',
    author: 'AI Entrepreneur',
    url: 'https://youtube.com/watch?v=xxx',
    views: '892K',
    velocity: '45K/hr',
    score: 9,
    category: 'AI',
    discoveredAt: '2 min ago',
    status: 'new',
  },
  {
    id: 2,
    platform: 'twitter',
    title: 'The automation paradox: Everyone wants to automate...',
    author: '@buildinpublic',
    url: 'https://x.com/buildinpublic/status/xxx',
    views: '234K',
    velocity: '12K/hr',
    score: 8,
    category: 'Automation',
    discoveredAt: '15 min ago',
    status: 'new',
  },
  {
    id: 3,
    platform: 'youtube',
    title: '10 Marketing Mistakes That Cost Me $500K',
    author: 'Growth Expert',
    url: 'https://youtube.com/watch?v=yyy',
    views: '456K',
    velocity: '8K/hr',
    score: 7,
    category: 'Marketing',
    discoveredAt: '1 hr ago',
    status: 'viewed',
  },
];

// Mock scraping targets
const mockTargets = [
  { id: 1, type: 'account', platform: 'twitter', value: '@naval', active: true },
  { id: 2, type: 'hashtag', platform: 'twitter', value: '#buildinpublic', active: true },
  { id: 3, type: 'account', platform: 'youtube', value: 'AI Explained', active: true },
  { id: 4, type: 'keyword', platform: 'all', value: 'automation', active: false },
];

// Mock logs
const mockLogs = [
  { id: 1, level: 'info', message: 'Scanned 450 Twitter accounts', timestamp: '2 min ago' },
  { id: 2, level: 'success', message: 'Discovered high-score content: "How I Built a $10M AI Agency" (Score: 9)', timestamp: '2 min ago' },
  { id: 3, level: 'info', message: 'Scanned 120 YouTube channels', timestamp: '5 min ago' },
  { id: 4, level: 'warning', message: 'Rate limit approaching for Twitter API', timestamp: '10 min ago' },
  { id: 5, level: 'success', message: 'Discovered trending content: "The automation paradox" (Score: 8)', timestamp: '15 min ago' },
];

export default function ScoutPage() {
  const [activeTab, setActiveTab] = useState('sources');
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [isScanning, setIsScanning] = useState(false);
  const [minScore, setMinScore] = useState(7);
  const [targets, setTargets] = useState(mockTargets);
  const [newTarget, setNewTarget] = useState({ type: 'account', platform: 'twitter', value: '' });

  const filteredSources = mockSources.filter(source => {
    const matchesSearch = source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         source.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScore = scoreFilter === 'all' || source.score >= parseInt(scoreFilter);
    return matchesSearch && matchesScore;
  });

  const handleAddTarget = () => {
    if (!newTarget.value.trim()) return;
    setTargets([...targets, { ...newTarget, id: Date.now(), active: true }]);
    setNewTarget({ type: 'account', platform: 'twitter', value: '' });
  };

  const handleRemoveTarget = (id: number) => {
    setTargets(targets.filter(t => t.id !== id));
  };

  const handleToggleTarget = (id: number) => {
    setTargets(targets.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const [monitoredSources, setMonitoredSources] = useState<number[]>([]);

  const addToMonitoring = (sourceId: number) => {
    if (!monitoredSources.includes(sourceId)) {
      setMonitoredSources([...monitoredSources, sourceId]);
    }
  };

  const runScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10">
            <Radio className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">AGENT #1</p>
            <h1 className="text-xl font-semibold text-foreground">Scout</h1>
            <p className="text-sm text-muted-foreground">
              Discovers and scores trending content across platforms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border/50 rounded-lg px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-500">Active</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={runScan}
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Scan Now
              </>
            )}
          </Button>

          <Button 
            size="sm"
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
            onClick={() => setActiveTab('config')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Custom Tabs Navigation */}
        <div className="flex gap-1 mb-6 bg-card border border-border/50 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('sources')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'sources'
                ? 'bg-sidebar-accent text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4" />
            Discovered Sources
            <Badge variant="secondary" className="ml-1">{mockSources.length}</Badge>
          </button>
          
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'config'
                ? 'bg-sidebar-accent text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="w-4 h-4" />
            Configuration
          </button>
          
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'logs'
                ? 'bg-sidebar-accent text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Logs
          </button>
        </div>

        {/* Sources Tab Content */}
        {activeTab === 'sources' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search sources by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="bg-card border border-border/50 text-foreground text-sm rounded px-3"
              >
                <option value="all">All Scores</option>
                <option value="9">Score 9+</option>
                <option value="8">Score 8+</option>
                <option value="7">Score 7+</option>
              </select>
            </div>

            {/* Sources List */}
            <div className="space-y-3">
              {filteredSources.map((source) => (
                <Card key={source.id} className="border-border/50 bg-card hover:border-border transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {source.platform === 'youtube' ? (
                          <Youtube className="w-5 h-5 text-red-500 mt-0.5" />
                        ) : (
                          <Twitter className="w-5 h-5 text-blue-500 mt-0.5" />
                        )}
                        
                        <div>
                          <h3 className="font-semibold text-foreground">{source.title}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span>{source.author}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">{source.category}</Badge>
                            <span>•</span>
                            <span className="text-xs">{source.discoveredAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          Generate Pack
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/30">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Views</p>
                          <p className="font-semibold">{source.views}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Velocity</p>
                          <p className="font-semibold">{source.velocity}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Platform</p>
                          <p className="font-semibold capitalize">{source.platform}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Config Tab Content */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            {/* Minimum Score Setting */}
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-base">Scoring Threshold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Minimum Score to Show in Feed
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={minScore}
                        onChange={(e) => setMinScore(parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-2xl font-bold w-12 text-center">{minScore}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Content scoring below {minScore} will be filtered out automatically
                </p>
              </CardContent>
            </Card>

            {/* Scraping Targets */}
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-base">Scraping Targets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Target */}
                <div className="flex gap-2">
                  <select
                    value={newTarget.type}
                    onChange={(e) => setNewTarget({ ...newTarget, type: e.target.value })}
                    className="bg-card border border-border/50 text-foreground text-sm rounded px-3"
                  >
                    <option value="account">Account</option>
                    <option value="hashtag">Hashtag</option>
                    <option value="keyword">Keyword</option>
                  </select>
                  
                  <select
                    value={newTarget.platform}
                    onChange={(e) => setNewTarget({ ...newTarget, platform: e.target.value })}
                    className="bg-card border border-border/50 text-foreground text-sm rounded px-3"
                  >
                    <option value="twitter">Twitter/X</option>
                    <option value="youtube">YouTube</option>
                    <option value="all">All Platforms</option>
                  </select>
                  
                  <Input
                    placeholder="@username, #hashtag, or keyword"
                    value={newTarget.value}
                    onChange={(e) => setNewTarget({ ...newTarget, value: e.target.value })}
                    className="flex-1"
                  />
                  
                  <Button onClick={handleAddTarget}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>

                {/* Targets List */}
                <div className="space-y-2">
                  {targets.map((target) => (
                    <div
                      key={target.id}
                      className="flex items-center justify-between p-3 bg-sidebar-accent rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {target.type === 'account' && <User className="w-4 h-4 text-muted-foreground" />}
                        {target.type === 'hashtag' && <Hash className="w-4 h-4 text-muted-foreground" />}
                        {target.type === 'keyword' && <Search className="w-4 h-4 text-muted-foreground" />}
                        
                        <span className="font-medium">{target.value}</span>
                        
                        <Badge variant="outline" className="text-xs">
                          {target.platform}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleTarget(target.id)}
                          className={target.active ? 'text-green-500' : 'text-muted-foreground'}
                        >
                          {target.active ? 'Active' : 'Paused'}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTarget(target.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Logs Tab Content */}
        {activeTab === 'logs' && (
          <div>
            <Card className="border-border/50 bg-card">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {mockLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 bg-sidebar-accent rounded-lg"
                    >
                      {log.level === 'success' && <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />}
                      {log.level === 'info' && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />}
                      {log.level === 'warning' && <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5" />}
                      {log.level === 'error' && <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />}
                      
                      <div className="flex-1">
                        <p className="text-sm">{log.message}</p>
                        <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
