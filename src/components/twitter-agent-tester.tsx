'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface AnalysisResult {
  input: {
    input_type: string;
    intent: string;
    target_audience: string;
    extracted_url?: string;
    extracted_topic?: string;
  };
  analysis: {
    source_type: string;
    source_title: string;
    recommended_angle: string;
    key_insights: string[];
    main_points: string[];
    trending_hashtags: string[];
    optimal_timing?: string;
  };
  summary: string;
}

export function TwitterAgentTester() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/twitter/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze content');
      }
      
      const data = await response.json();
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    'Post this: https://techcrunch.com/2024/01/15/ai-automation-trends',
    'Tweet about automation mistakes founders make',
    'Idea: The paradox of trying to automate everything',
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Twitter Agent - Input & Analyze</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Content Input</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your content request..."
              rows={3}
              className="resize-none"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {examples.map((ex, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => setInput(ex)}
              >
                Example {i + 1}
              </Button>
            ))}
          </div>
          
          <Button 
            onClick={handleAnalyze} 
            disabled={loading || !input.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Content'
            )}
          </Button>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-muted p-3 rounded">
                <p className="font-medium text-muted-foreground">Type</p>
                <p className="capitalize">{result.input.input_type}</p>
              </div>
              <div className="bg-muted p-3 rounded">
                <p className="font-medium text-muted-foreground">Intent</p>
                <p className="capitalize">{result.input.intent}</p>
              </div>
              <div className="bg-muted p-3 rounded">
                <p className="font-medium text-muted-foreground">Audience</p>
                <p className="capitalize">{result.input.target_audience}</p>
              </div>
            </div>
            
            {result.input.extracted_url && (
              <div className="text-sm">
                <p className="font-medium text-muted-foreground">URL</p>
                <p className="truncate">{result.input.extracted_url}</p>
              </div>
            )}
            
            <div className="text-sm">
              <p className="font-medium text-muted-foreground">Recommended Angle</p>
              <p className="capitalize">{result.analysis.recommended_angle.replace(/_/g, ' ')}</p>
            </div>
            
            <div>
              <p className="font-medium text-sm text-muted-foreground mb-2">Key Insights</p>
              <ul className="text-sm space-y-1">
                {result.analysis.key_insights.map((insight, i) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <p className="font-medium text-sm text-muted-foreground mb-2">Main Points</p>
              <ul className="text-sm space-y-1">
                {result.analysis.main_points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-2">
              {result.analysis.trending_hashtags.map((tag, i) => (
                <span key={i} className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
            
            {result.analysis.optimal_timing && (
              <div className="text-sm">
                <p className="font-medium text-muted-foreground">Best Time to Post</p>
                <p>{result.analysis.optimal_timing}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
