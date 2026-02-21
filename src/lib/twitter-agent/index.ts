/**
 * Twitter Agent Integration for Content Engine
 * Wraps Python modules for TypeScript/Next.js usage
 */

export type InputType = 'link' | 'topic' | 'idea' | 'draft' | 'reply';
export type IntentType = 'educate' | 'promote' | 'engage' | 'entertain' | 'opinion';

export interface ContentRequest {
  input_type: InputType;
  raw_input: string;
  intent: IntentType;
  target_audience: string;
  extracted_url?: string;
  extracted_topic?: string;
  context?: string;
  preferred_tone?: string;
  thread_preference?: 'single' | 'thread' | 'auto';
}

export interface ContentAnalysis {
  source_type: string;
  source_url?: string;
  source_title?: string;
  key_insights: string[];
  key_quotes: string[];
  statistics: string[];
  main_points: string[];
  recommended_angle?: string;
  content_gaps: string[];
  trending_hashtags: string[];
  optimal_timing?: string;
  related_accounts: string[];
  conversation_context?: string;
}

export interface TwitterAgentResult {
  input: ContentRequest;
  analysis: ContentAnalysis;
  summary: string;
}

/**
 * Fetch tweet content from a URL
 * Uses the existing /api/scrape endpoint
 */
async function fetchTweetFromUrl(url: string): Promise<{ text: string; author: string; metrics: any; url?: string } | null> {
  try {
    console.log('[TwitterAgent] Attempting to fetch tweet from:', url);
    
    // Extract username from URL for API call
    const match = url.match(/(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/);
    if (!match) {
      console.log('[TwitterAgent] Not a valid tweet URL');
      return null;
    }
    
    const username = match[1];
    console.log('[TwitterAgent] Username:', username);
    
    // Call the existing scrape API
    const response = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'twitter',
        username: username,
        options: { maxTweets: 10, includeReplies: false }
      })
    });
    
    if (!response.ok) {
      console.log('[TwitterAgent] Scrape API returned error:', response.status);
      return null;
    }
    
    const data = await response.json();
    const tweets = data.tweets || [];
    
    // Find the specific tweet by URL
    const tweet = tweets.find((t: any) => t.url === url || t.id === match[2]);
    
    if (tweet) {
      console.log('[TwitterAgent] Found tweet:', tweet.text?.substring(0, 50));
      return {
        text: tweet.text || '',
        author: tweet.author || username,
        metrics: {
          likes: tweet.likes || 0,
          retweets: tweet.retweets || 0,
          replies: tweet.comments || 0,
          views: tweet.views || 0,
        },
        url: tweet.url || url,
      };
    }
    
    console.log('[TwitterAgent] Tweet not found in scraped data');
    return null;
  } catch (error) {
    console.error('[TwitterAgent] Error fetching tweet:', error);
    return null;
  }
}

/**
 * Process input and analyze content for Twitter posting
 * Fetches tweet content from URLs and analyzes why it works
 */
export async function processTwitterContent(
  userInput: string,
  context?: string
): Promise<TwitterAgentResult> {
  
  // Strip command prefixes to get the actual content to analyze
  const cleanInput = stripCommandPrefix(userInput);
  console.log('[TwitterAgent] Raw input:', userInput.substring(0, 50));
  console.log('[TwitterAgent] Clean input:', cleanInput.substring(0, 50));
  
  const url = extractUrl(cleanInput);
  let contentToAnalyze = cleanInput;
  let tweetData = null;
  
  // If it's a tweet URL, try to fetch the actual tweet content
  if (url && (url.includes('twitter.com') || url.includes('x.com'))) {
    console.log('[TwitterAgent] Detected tweet URL, attempting fetch...');
    tweetData = await fetchTweetFromUrl(url);
    if (tweetData) {
      contentToAnalyze = tweetData.text;
      console.log('[TwitterAgent] Using fetched tweet:', contentToAnalyze.substring(0, 50));
    } else {
      console.log('[TwitterAgent] Fetch failed, will analyze as generic link');
    }
  }
  
  const inputType = url ? 'link' : detectInputType(cleanInput);
  const intent = detectIntent(contentToAnalyze);
  const audience = detectAudience(contentToAnalyze);
  const topic = extractTopic(cleanInput, inputType);
  
  const request: ContentRequest = {
    input_type: inputType,
    raw_input: contentToAnalyze,
    intent: intent,
    target_audience: audience,
    extracted_url: url,
    extracted_topic: topic,
    context: context,
  };
  
  // Generate analysis based on the actual content (fetched or provided)
  const analysis = tweetData 
    ? analyzeTweetPerformance(contentToAnalyze, tweetData)
    : analyzeActualContent(request);
  
  return {
    input: request,
    analysis: analysis,
    summary: generateSummary(analysis),
  };
}

/**
 * Strip command prefixes like "Analyze this:", "Post this:", etc.
 */
function stripCommandPrefix(input: string): string {
  const prefixes = [
    /^(analyze|check|review)\s+(this|that|it)\s*[:\-]?\s*/i,
    /^(post|share|tweet)\s+(this|that|it)\s*[:\-]?\s*/i,
    /^(here'?s?|this is)\s+(my\s+)?(draft|tweet|content)\s*[:\-]?\s*/i,
    /^(idea|concept|thought)\s*[:\-]?\s*/i,
  ];
  
  let cleaned = input.trim();
  
  for (const prefix of prefixes) {
    cleaned = cleaned.replace(prefix, '');
  }
  
  return cleaned.trim();
}

/**
 * Analyze a high-performing tweet with actual metrics
 */
function analyzeTweetPerformance(text: string, tweetData: any): ContentAnalysis {
  const contentLower = text.toLowerCase();
  
  console.log('[TwitterAgent] Analyzing tweet performance with metrics:', tweetData.metrics);
  
  // Calculate engagement rate
  const views = tweetData.metrics.views || 1;
  const engagement = tweetData.metrics.likes + tweetData.metrics.retweets + tweetData.metrics.replies;
  const engagementRate = ((engagement / views) * 100).toFixed(2);
  
  // Analyze why it works
  const firstSentence = text.split(/[.!?]/)[0] || '';
  const hookStrength = analyzeHook(firstSentence);
  
  // Determine content category
  let category = 'general';
  if (contentLower.includes('automation') || contentLower.includes('workflow')) category = 'automation';
  else if (contentLower.includes('ai') || contentLower.includes('machine learning')) category = 'ai';
  else if (contentLower.includes('startup') || contentLower.includes('founder')) category = 'startup';
  else if (contentLower.includes('marketing') || contentLower.includes('growth')) category = 'marketing';
  else if (contentLower.includes('code') || contentLower.includes('developer')) category = 'tech';
  
  // Analyze virality factors
  const viralityFactors = analyzeViralityFactors(text, tweetData.metrics);
  
  // Specific insights about why this tweet works
  const insights = [
    `Engagement rate: ${engagementRate}% (${engagement.toLocaleString()} engagements / ${views.toLocaleString()} views)`,
    `Hook strength: ${hookStrength.strength} - ${hookStrength.reason}`,
    `Likes: ${tweetData.metrics.likes.toLocaleString()} | Retweets: ${tweetData.metrics.retweets.toLocaleString()} | Replies: ${tweetData.metrics.replies.toLocaleString()}`,
    ...viralityFactors,
  ];
  
  // Content structure breakdown
  const mainPoints = [
    `Opening: "${firstSentence.substring(0, 60)}${firstSentence.length > 60 ? '...' : ''}"`,
    `Character count: ${text.length} / 280`,
    text.length < 100 ? '✓ Short and punchy - easy to digest' : '⚠ Longer format - needs strong hook',
    /\d+%|\d+x|\$\d+/.test(text) ? '✓ Uses specific numbers for credibility' : '⚠ No specific data/stats',
    text.includes('?') ? '✓ Includes question to drive replies' : '⚠ No question - one-way communication',
  ];
  
  // What makes it work
  const gaps = identifySuccessFactors(text, tweetData.metrics);
  
  const hashtags: Record<string, string[]> = {
    'automation': ['#Automation', '#OpenClaw', '#Workflow'],
    'ai': ['#AI', '#ArtificialIntelligence', '#Tech'],
    'startup': ['#Startup', '#Founder', '#Entrepreneur'],
    'marketing': ['#Marketing', '#Growth', '#B2B'],
    'tech': ['#DevTools', '#Developer', '#Coding'],
    'general': ['#Tech', '#Business', '#Tips'],
  };
  
  return {
    source_type: 'tweet_analysis',
    source_url: tweetData.url,
    source_title: text.slice(0, 60) + (text.length > 60 ? '...' : ''),
    key_insights: insights,
    key_quotes: extractQuotes(text),
    statistics: [
      `Views: ${views.toLocaleString()}`,
      `Engagement Rate: ${engagementRate}%`,
      `Like/View Ratio: ${((tweetData.metrics.likes / views) * 100).toFixed(2)}%`,
    ],
    main_points: mainPoints,
    recommended_angle: 'analyzed_high_performer',
    content_gaps: gaps,
    trending_hashtags: hashtags[category]?.slice(0, 3) || hashtags['general'].slice(0, 3),
    optimal_timing: 'Tuesday-Thursday, 9-11 AM EST (based on high engagement)',
    related_accounts: [`@${tweetData.author}`],
    conversation_context: `High-performing ${category} content`,
  };
}

function analyzeViralityFactors(text: string, metrics: any): string[] {
  const factors: string[] = [];
  
  // High like ratio
  const likeRatio = metrics.likes / (metrics.views || 1);
  if (likeRatio > 0.05) {
    factors.push('✓ High like ratio - content resonates emotionally');
  }
  
  // High retweet ratio (indicates shareability)
  const rtRatio = metrics.retweets / (metrics.views || 1);
  if (rtRatio > 0.01) {
    factors.push('✓ Strong retweet rate - highly shareable content');
  }
  
  // High reply ratio (indicates controversy/discussion)
  const replyRatio = metrics.replies / (metrics.views || 1);
  if (replyRatio > 0.005) {
    factors.push('✓ High reply rate - sparks conversation/controversy');
  }
  
  // Content patterns that work
  if (text.includes('Here') && text.includes('why')) {
    factors.push('✓ Uses "Here\'s why" format - promises value');
  }
  if (text.match(/\d+ (ways?|things?|reasons?|mistakes?)/)) {
    factors.push('✓ Numbered list - scannable format');
  }
  if (text.match(/most people|everyone|nobody/)) {
    factors.push('✓ Contrarian/opinionated angle - triggers engagement');
  }
  
  return factors.slice(0, 3);
}

function identifySuccessFactors(text: string, metrics: any): string[] {
  const factors: string[] = [];
  
  // Identify what made it successful
  if (metrics.likes > metrics.retweets * 5) {
    factors.push('Like-heavy: Content is relatable/agreeable but not highly shareable');
  } else if (metrics.retweets > metrics.likes * 0.3) {
    factors.push('Retweet-heavy: Content provides value others want to share');
  }
  
  if (metrics.replies > metrics.likes * 0.1) {
    factors.push('Reply-heavy: Controversial or discussion-worthy topic');
  }
  
  // Content-specific success factors
  if (text.length < 100) {
    factors.push('Brevity: Short format increases completion/read rate');
  }
  if (text.includes('?')) {
    factors.push('Question format: Directly invites engagement');
  }
  
  return factors.length > 0 ? factors : ['Strong overall engagement across all metrics'];
}

/**
 * Analyze actual content when no tweet metrics available
 */
function analyzeActualContent(request: ContentRequest): ContentAnalysis {
  const content = request.raw_input;
  console.log('[TwitterAgent] Analyzing content:', content.substring(0, 100));
  
  const contentLower = content.toLowerCase();
  
  // Analyze content structure
  const wordCount = content.split(/\s+/).length;
  const hasNumbers = /\d+/.test(content);
  const hasQuestion = content.includes('?');
  
  console.log('[TwitterAgent] Word count:', wordCount, 'Has numbers:', hasNumbers, 'Has question:', hasQuestion);
  
  // Determine content category
  let category = 'general';
  if (contentLower.includes('automation') || contentLower.includes('workflow')) category = 'automation';
  else if (contentLower.includes('ai') || contentLower.includes('machine learning')) category = 'ai';
  else if (contentLower.includes('startup') || contentLower.includes('founder')) category = 'startup';
  else if (contentLower.includes('marketing') || contentLower.includes('growth')) category = 'marketing';
  else if (contentLower.includes('code') || contentLower.includes('developer')) category = 'tech';
  
  const firstSentence = content.split(/[.!?]/)[0] || '';
  const hookStrength = analyzeHook(firstSentence);
  
  const insights = [
    `Content length: ${content.length} characters (${content.length > 280 ? 'Thread candidate' : 'Single tweet'})`,
    `Hook analysis: ${hookStrength.strength} - ${hookStrength.reason}`,
  ];
  
  const mainPoints = [
    `Opening: "${firstSentence.substring(0, 50)}${firstSentence.length > 50 ? '...' : ''}"`,
    `Word count: ${wordCount}`,
    hasNumbers ? '✓ Contains specific numbers/stats' : '⚠ No specific numbers',
    hasQuestion ? '✓ Includes question' : '⚠ No question',
  ];
  
  const gaps: string[] = [];
  if (!hasNumbers) gaps.push('Add specific numbers or statistics');
  if (!hasQuestion) gaps.push('Include a question to increase replies');
  
  const hashtags: Record<string, string[]> = {
    'automation': ['#Automation', '#OpenClaw', '#Workflow'],
    'ai': ['#AI', '#ArtificialIntelligence', '#Tech'],
    'startup': ['#Startup', '#Founder', '#Entrepreneur'],
    'marketing': ['#Marketing', '#Growth', '#B2B'],
    'tech': ['#DevTools', '#Developer', '#Coding'],
    'general': ['#Tech', '#Business', '#Tips'],
  };
  
  return {
    source_type: request.input_type,
    source_url: request.extracted_url,
    source_title: content.slice(0, 60) + (content.length > 60 ? '...' : ''),
    key_insights: insights,
    key_quotes: extractQuotes(content),
    statistics: extractStats(content),
    main_points: mainPoints,
    recommended_angle: determineAngle(request.intent, hookStrength, category),
    content_gaps: gaps.length > 0 ? gaps : ['No major gaps'],
    trending_hashtags: hashtags[category]?.slice(0, 3) || hashtags['general'].slice(0, 3),
    optimal_timing: 'Tuesday-Thursday, 9-11 AM EST',
    related_accounts: getRelatedAccounts(category),
    conversation_context: `Analysis of ${category} content`,
  };
}

function analyzeHook(firstSentence: string): { strength: 'strong' | 'medium' | 'weak'; reason: string } {
  const sentence = firstSentence.toLowerCase();
  
  if (sentence.includes('here') && sentence.includes('why')) {
    return { strength: 'strong', reason: 'Promises value/explanation' };
  }
  if (sentence.includes('most people') || sentence.includes('everyone')) {
    return { strength: 'strong', reason: 'Challenges common belief' };
  }
  if (/\d+ (ways?|things?|reasons?|mistakes?)/.test(sentence)) {
    return { strength: 'strong', reason: 'Numbered list format' };
  }
  if (sentence.includes('?')) {
    return { strength: 'strong', reason: 'Engages with question' };
  }
  if (sentence.length < 20) {
    return { strength: 'weak', reason: 'Too short, lacks impact' };
  }
  
  return { strength: 'medium', reason: 'Standard opening, could be stronger' };
}

function extractQuotes(content: string): string[] {
  const matches = content.match(/"([^"]+)"/g);
  return matches ? matches.map(q => q.replace(/"/g, '')).slice(0, 2) : [];
}

function extractStats(content: string): string[] {
  const matches = content.match(/\d+%|\d+x|£\d+|\$\d+/g);
  return matches ? matches.slice(0, 2) : [];
}

function determineAngle(intent: IntentType, hook: any, category: string): string {
  if (hook.strength === 'strong' && intent === 'educate') return 'authority_breakdown';
  if (intent === 'opinion') return 'controversial_take';
  if (intent === 'promote') return 'value_first_promotion';
  if (category === 'startup') return 'founder_story';
  return 'educational_breakdown';
}

function getRelatedAccounts(category: string): string[] {
  const accounts: Record<string, string[]> = {
    'automation': ['@OpenClawHQ'],
    'ai': ['@AI_enthusiast'],
    'startup': ['@StartupAdvisor'],
    'marketing': ['@GrowthExpert'],
    'tech': ['@DevToolsHQ'],
    'general': ['@ContentCreator'],
  };
  return accounts[category] || accounts['general'];
}

function detectInputType(text: string): InputType {
  const urlPattern = /https?:\/\/[^\s]+/;
  const textLower = text.toLowerCase();
  
  if (urlPattern.test(text)) return 'link';
  if (textLower.includes('idea:') || textLower.includes('concept:')) return 'idea';
  if (textLower.includes('draft') || textLower.includes('here\'s')) return 'draft';
  if (textLower.includes('reply to @')) return 'reply';
  return 'topic';
}

function detectIntent(text: string): IntentType {
  const textLower = text.toLowerCase();
  if (textLower.includes('promote') || textLower.includes('launch')) return 'promote';
  if (textLower.includes('ask') || textLower.includes('question')) return 'engage';
  if (textLower.includes('funny') || textLower.includes('joke')) return 'entertain';
  if (textLower.includes('opinion') || textLower.includes('think')) return 'opinion';
  return 'educate';
}

function detectAudience(text: string): string {
  const textLower = text.toLowerCase();
  if (textLower.includes('founder') || textLower.includes('startup')) return 'founders';
  if (textLower.includes('marketer') || textLower.includes('growth')) return 'marketers';
  if (textLower.includes('dev') || textLower.includes('code')) return 'developers';
  if (textLower.includes('automation')) return 'automation';
  return 'general';
}

function extractUrl(text: string): string | undefined {
  const match = text.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : undefined;
}

function extractTopic(text: string, inputType: InputType): string | undefined {
  if (inputType === 'topic') {
    const match = text.match(/(?:about|on)\s+(.+?)(?:\s+(?:for|to|with)|$)/i);
    return match ? match[1].trim() : text.trim();
  }
  return undefined;
}

function generateSummary(analysis: ContentAnalysis): string {
  return `📊 ANALYSIS
Source: ${analysis.source_title}
Type: ${analysis.source_type}
Insights: ${analysis.key_insights.join('; ')}`;
}
