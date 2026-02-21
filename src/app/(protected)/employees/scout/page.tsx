'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  User,
  ChevronDown,
  Check
} from 'lucide-react';

// Custom Dropdown Component
interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function CustomDropdown({ value, options, onChange, placeholder = 'Select...', className = '' }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 bg-slate-900/80 border border-cyan-500/30 text-cyan-100 text-sm rounded-lg px-4 py-2.5 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
      >
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-cyan-500/30 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.15)] overflow-hidden z-50">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                value === option.value 
                  ? 'bg-cyan-500/20 text-cyan-300' 
                  : 'text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-200'
              }`}
            >
              <span>{option.label}</span>
              {value === option.value && <Check className="w-4 h-4 text-cyan-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('sources');
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [isScanning, setIsScanning] = useState(false);
  const [minScore, setMinScore] = useState(7);
  
  // Load from localStorage on mount
  const [targets, setTargets] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('scout-targets');
      return saved ? JSON.parse(saved) : mockTargets;
    }
    return mockTargets;
  });
  
  const [trackedTweets, setTrackedTweets] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('scout-tracked-tweets');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [newTarget, setNewTarget] = useState({ type: 'account', platform: 'twitter', value: '' });

  // Save to localStorage whenever targets change
  useEffect(() => {
    localStorage.setItem('scout-targets', JSON.stringify(targets));
  }, [targets]);
  
  // Save tracked tweets
  useEffect(() => {
    localStorage.setItem('scout-tracked-tweets', JSON.stringify(trackedTweets));
  }, [trackedTweets]);

  const filteredSources = mockSources.filter(source => {
    const matchesSearch = source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         source.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScore = scoreFilter === 'all' || source.score >= parseInt(scoreFilter);
    return matchesSearch && matchesScore;
  });

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [scrapeConfig, setScrapeConfig] = useState({
    maxTweets: 10,
    includeReplies: false,
    includeRetweets: false,
  });
  const [pendingTarget, setPendingTarget] = useState<any>(null);

  const handleAddClick = () => {
    if (!newTarget.value.trim()) return;
    
    // If it's a Twitter account, show config modal
    if (newTarget.type === 'account' && newTarget.platform === 'twitter') {
      setPendingTarget({ ...newTarget });
      setShowConfigModal(true);
    } else {
      // For other types, add directly
      handleAddTarget();
    }
  };

  const handleConfirmAdd = async () => {
    if (!pendingTarget) return;
    
    // Add to targets list
    const targetToAdd = { ...pendingTarget, id: Date.now(), active: true };
    setTargets([...targets, targetToAdd]);
    setNewTarget({ type: 'account', platform: 'twitter', value: '' });
    
    // Track with config
    const success = await trackAccount(pendingTarget.value, scrapeConfig);
    
    // Close modal and reset
    setShowConfigModal(false);
    setPendingTarget(null);
    setScrapeConfig({ maxTweets: 10, includeReplies: false, includeRetweets: false });
    
    // Navigate to detail view if successful
    if (success) {
      window.location.href = `/scout/sources?author=${encodeURIComponent(pendingTarget.value)}`;
    }
  };

  const handleAddTarget = async () => {
    if (!newTarget.value.trim()) return;
    
    // Add to targets list
    const targetToAdd = { ...newTarget, id: Date.now(), active: true };
    setTargets([...targets, targetToAdd]);
    setNewTarget({ type: 'account', platform: 'twitter', value: '' });
    
    // If it's an account, immediately track it
    if (newTarget.type === 'account' && newTarget.platform === 'twitter') {
      await trackAccount(newTarget.value);
    }
  };

  const handleRemoveTarget = (id: number) => {
    setTargets(targets.filter(t => t.id !== id));
  };

  const handleToggleTarget = (id: number) => {
    setTargets(targets.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const [monitoredSources, setMonitoredSources] = useState<number[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  // Fetch tweets from tracked accounts using Apify
  const trackAccount = async (username: string, config: any = {}) => {
    try {
      setIsTracking(true);
      
      // Remove @ if present
      const cleanUsername = username.replace('@', '');
      
      // Call Apify API via your existing endpoint
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'twitter',
          username: cleanUsername,
          options: { 
            maxTweets: config.maxTweets || 10,
            includeReplies: config.includeReplies || false,
            includeRetweets: config.includeRetweets || false,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch tweets');
      }

      const data = await response.json();
      
      if (data.tweets && data.tweets.length > 0) {
        // Transform tweets to source format
        const newSources = data.tweets.map((tweet: any, index: number) => ({
          id: Date.now() + index,
          platform: 'twitter',
          title: tweet.text?.substring(0, 80) + (tweet.text?.length > 80 ? '...' : ''),
          author: `@${tweet.author || cleanUsername}`,
          url: tweet.url,
          views: tweet.views ? `${(tweet.views / 1000).toFixed(1)}K` : 'N/A',
          velocity: `${Math.floor(Math.random() * 20 + 5)}K/hr`, // Simulated for now
          score: calculateScore(tweet),
          category: 'Twitter',
          discoveredAt: 'Just now',
          likes: tweet.likes || 0,
          retweets: tweet.retweets || 0,
          replies: tweet.comments || 0,
          text: tweet.text,
          status: 'new',
        }));

        // Add to tracked tweets
        setTrackedTweets(prev => [...newSources, ...prev]);
        
        return true; // Success
      }
      
      return false; // No tweets found
    } catch (error) {
      console.error('Tracking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to track account: ${errorMessage}`);
      return false;
    } finally {
      setIsTracking(false);
    }
  };

  // Calculate virality score based on engagement
  const calculateScore = (tweet: any) => {
    const likes = tweet.likes || 0;
    const retweets = tweet.retweets || 0;
    const views = tweet.views || 1;
    
    // Simple scoring algorithm
    const engagementRate = ((likes + retweets * 2) / views) * 100;
    
    if (engagementRate > 5) return 9;
    if (engagementRate > 3) return 8;
    if (engagementRate > 1) return 7;
    if (engagementRate > 0.5) return 6;
    return 5;
  };

  // Track all target accounts
  const runTrackingScan = async () => {
    const accountTargets = targets.filter(t => t.type === 'account' && t.active);
    
    if (accountTargets.length === 0) {
      alert('No active account targets to track');
      return;
    }

    setIsScanning(true);
    
    for (const target of accountTargets) {
      await trackAccount(target.value);
    }
    
    setIsScanning(false);
  };

  const addToMonitoring = (sourceId: number) => {
    if (!monitoredSources.includes(sourceId)) {
      setMonitoredSources([...monitoredSources, sourceId]);
    }
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
            onClick={runTrackingScan}
            disabled={isScanning || isTracking}
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search sources by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900/80 border-cyan-500/30 text-cyan-100 placeholder:text-slate-500"
                />
              </div>
              
              <CustomDropdown
                value={scoreFilter}
                options={[
                  { value: 'all', label: 'All Scores' },
                  { value: '9', label: 'Score 9+' },
                  { value: '8', label: 'Score 8+' },
                  { value: '7', label: 'Score 7+' },
                ]}
                onChange={setScoreFilter}
                className="min-w-[140px]"
              />
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
                  <CustomDropdown
                    value={newTarget.type}
                    options={[
                      { value: 'account', label: 'Account' },
                      { value: 'hashtag', label: 'Hashtag' },
                      { value: 'keyword', label: 'Keyword' },
                    ]}
                    onChange={(value) => setNewTarget({ ...newTarget, type: value })}
                    className="min-w-[120px]"
                  />
                  
                  <CustomDropdown
                    value={newTarget.platform}
                    options={[
                      { value: 'twitter', label: 'Twitter/X' },
                      { value: 'youtube', label: 'YouTube' },
                      { value: 'all', label: 'All Platforms' },
                    ]}
                    onChange={(value) => setNewTarget({ ...newTarget, platform: value })}
                    className="min-w-[140px]"
                  />
                  
                  <Input
                    placeholder="@username, #hashtag, or keyword"
                    value={newTarget.value}
                    onChange={(e) => setNewTarget({ ...newTarget, value: e.target.value })}
                    className="flex-1 bg-slate-900/80 border-cyan-500/30 text-cyan-100 placeholder:text-slate-500"
                  />
                  
                  <Button 
                    onClick={handleAddClick}
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>

                {/* Targets List */}
                <div className="space-y-2">
                  {targets.map((target) => (
                    <div
                      key={target.id}
                      className="flex items-center justify-between p-3 bg-sidebar-accent rounded-lg cursor-pointer hover:bg-cyan-500/10 transition-colors"
                      onClick={() => {
                        if (target.type === 'account') {
                          window.location.href = `/scout/sources?author=${encodeURIComponent(target.value)}`;
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {target.type === 'account' && <User className="w-4 h-4 text-cyan-400" />}
                        {target.type === 'hashtag' && <Hash className="w-4 h-4 text-cyan-400" />}
                        {target.type === 'keyword' && <Search className="w-4 h-4 text-cyan-400" />}
                        
                        <span className="font-medium text-cyan-100">{target.value}</span>
                        
                        <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                          {target.platform}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleTarget(target.id)}
                          className={target.active ? 'text-emerald-400' : 'text-slate-500'}
                        >
                          {target.active ? 'Active' : 'Paused'}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTarget(target.id)}
                          className="text-red-400 hover:text-red-300"
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

        {/* Configuration Modal */}
        {showConfigModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-6 w-full max-w-md shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              <h3 className="text-lg font-semibold text-white mb-4">
                Configure Scraping for @{pendingTarget?.value}
              </h3>
              
              <div className="space-y-4">
                {/* Max Tweets */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Number of Tweets to Fetch
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={scrapeConfig.maxTweets}
                    onChange={(e) => setScrapeConfig({ ...scrapeConfig, maxTweets: parseInt(e.target.value) || 10 })}
                    className="w-full bg-slate-800 border border-cyan-500/30 text-cyan-100 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>

                {/* Include Replies Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-400">
                    Include Replies
                  </label>
                  <button
                    onClick={() => setScrapeConfig({ ...scrapeConfig, includeReplies: !scrapeConfig.includeReplies })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      scrapeConfig.includeReplies ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      scrapeConfig.includeReplies ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Include Retweets Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-400">
                    Include Retweets
                  </label>
                  <button
                    onClick={() => setScrapeConfig({ ...scrapeConfig, includeRetweets: !scrapeConfig.includeRetweets })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      scrapeConfig.includeRetweets ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      scrapeConfig.includeRetweets ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfigModal(false);
                    setPendingTarget(null);
                  }}
                  className="flex-1 border-slate-600 text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAdd}
                  disabled={isTracking}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  {isTracking ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Scraping...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Scraping
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
