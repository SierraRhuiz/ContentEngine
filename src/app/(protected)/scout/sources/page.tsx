'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Twitter, 
  Youtube, 
  ExternalLink, 
  Heart, 
  Repeat, 
  MessageCircle,
  Eye,
  Trash2
} from 'lucide-react';

interface Tweet {
  id: number;
  platform: string;
  title: string;
  author: string;
  url: string;
  views: string;
  velocity: string;
  score: number;
  category: string;
  discoveredAt: string;
  likes?: number;
  retweets?: number;
  replies?: number;
  text?: string;
}

export default function SourceDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const author = searchParams.get('author');
  
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTweets, setSelectedTweets] = useState<number[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    totalViews: 0,
    highPerformers: 0
  });

  useEffect(() => {
    const saved = localStorage.getItem('scout-tracked-tweets');
    if (saved && author) {
      const allTweets: Tweet[] = JSON.parse(saved);
      const authorTweets = allTweets.filter(t => 
        t.author?.toLowerCase().includes(author.toLowerCase())
      );
      setTweets(authorTweets);
      
      if (authorTweets.length > 0) {
        const totalViews = authorTweets.reduce((sum, t) => {
          const views = parseFloat(t.views?.replace(/[^0-9.]/g, '') || '0');
          return sum + views;
        }, 0);
        
        setStats({
          total: authorTweets.length,
          avgScore: Math.round(authorTweets.reduce((sum, t) => sum + t.score, 0) / authorTweets.length),
          totalViews: Math.round(totalViews),
          highPerformers: authorTweets.filter(t => t.score >= 8).length
        });
      }
    }
    setLoading(false);
  }, [author]);

  const toggleSelectAll = () => {
    if (selectedTweets.length === tweets.length) {
      setSelectedTweets([]);
    } else {
      setSelectedTweets(tweets.map(t => t.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedTweets.includes(id)) {
      setSelectedTweets(selectedTweets.filter(tid => tid !== id));
    } else {
      setSelectedTweets([...selectedTweets, id]);
    }
  };

  const deleteSelected = () => {
    if (selectedTweets.length === 0) return;
    
    const confirmed = confirm(`Delete ${selectedTweets.length} tweet(s)?`);
    if (!confirmed) return;
    
    const remainingTweets = tweets.filter(t => !selectedTweets.includes(t.id));
    setTweets(remainingTweets);
    
    const saved = localStorage.getItem('scout-tracked-tweets');
    if (saved) {
      const allTweets: Tweet[] = JSON.parse(saved);
      const updatedTweets = allTweets.filter(t => !selectedTweets.includes(t.id));
      localStorage.setItem('scout-tracked-tweets', JSON.stringify(updatedTweets));
    }
    
    setSelectedTweets([]);
    
    if (remainingTweets.length > 0) {
      const totalViews = remainingTweets.reduce((sum, t) => {
        const views = parseFloat(t.views?.replace(/[^0-9.]/g, '') || '0');
        return sum + views;
      }, 0);
      
      setStats({
        total: remainingTweets.length,
        avgScore: Math.round(remainingTweets.reduce((sum, t) => sum + t.score, 0) / remainingTweets.length),
        totalViews: Math.round(totalViews),
        highPerformers: remainingTweets.filter(t => t.score >= 8).length
      });
    } else {
      setStats({ total: 0, avgScore: 0, totalViews: 0, highPerformers: 0 });
    }
  };

  const getPlatformIcon = (platform: string) => {
    if (platform === 'youtube') return <Youtube className="w-5 h-5 text-red-500" />;
    return <Twitter className="w-5 h-5 text-blue-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (score >= 8) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
    if (score >= 7) return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-cyan-500/20 px-6 py-5">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/employees/scout')}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Scout
          </Button>
          
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-cyan-500/60">
              Scraped Content
            </p>
            <h1 className="text-xl font-semibold text-white">
              {author || 'Unknown Source'}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-900/60 border-cyan-500/20">
            <CardContent className="p-4">
              <p className="text-slate-400 text-xs uppercase">Total Tweets</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/60 border-cyan-500/20">
            <CardContent className="p-4">
              <p className="text-slate-400 text-xs uppercase">Avg Score</p>
              <p className="text-2xl font-bold text-white">{stats.avgScore}/10</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/60 border-cyan-500/20">
            <CardContent className="p-4">
              <p className="text-slate-400 text-xs uppercase">Total Views</p>
              <p className="text-2xl font-bold text-white">{stats.totalViews}K</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/60 border-cyan-500/20">
            <CardContent className="p-4">
              <p className="text-slate-400 text-xs uppercase">High Performers</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.highPerformers}</p>
            </CardContent>
          </Card>
        </div>

        {tweets.length > 0 && (
          <div className="flex items-center justify-between mb-4 p-3 bg-slate-900/60 border border-cyan-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  selectedTweets.length === tweets.length && tweets.length > 0
                    ? 'bg-cyan-500 border-cyan-500'
                    : 'border-cyan-500/50 hover:border-cyan-500'
                }`}
              >
                {selectedTweets.length === tweets.length && tweets.length > 0 && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              
              <span className="text-sm text-cyan-100">
                {selectedTweets.length === tweets.length ? 'Deselect All' : 'Select All'}
              </span>
              
              {selectedTweets.length > 0 && (
                <span className="text-sm text-cyan-400">
                  ({selectedTweets.length} selected)
                </span>
              )}
            </div>
            
            {selectedTweets.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={deleteSelected}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            )}
          </div>
        )}

        <div className="space-y-3">
          {tweets.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No scraped content found for this source.
            </div>
          ) : (
            tweets.map((tweet) => (
              <Card 
                key={tweet.id} 
                className={`bg-slate-900/60 border-cyan-500/20 hover:border-cyan-500/40 transition-colors ${
                  selectedTweets.includes(tweet.id) ? 'border-cyan-500/60 bg-cyan-500/10' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleSelect(tweet.id)}
                      className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                        selectedTweets.includes(tweet.id)
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'border-cyan-500/50 hover:border-cyan-500'
                      }`}
                    >
                      {selectedTweets.includes(tweet.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    
                    {getPlatformIcon(tweet.platform)}
                    
                    <div className="flex-1">
                      <p className="text-white text-sm leading-relaxed">
                        {tweet.text || tweet.title}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span>{tweet.author}</span>
                        <span>•</span>
                        <span>{tweet.discoveredAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={`${getScoreColor(tweet.score)} border`}>
                        Score {tweet.score}/10
                      </Badge>
                      
                      <a 
                        href={tweet.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-cyan-500/10">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-300">{tweet.views}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-300">{tweet.likes || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-300">{tweet.retweets || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-300">{tweet.replies || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
