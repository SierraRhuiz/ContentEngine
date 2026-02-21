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
 * Process input and analyze content for Twitter posting
 * Strips command prefixes and analyzes the actual content
 */
export async function processTwitterContent(
  userInput: string,
  context?: string
): Promise<TwitterAgentResult> {
  
  // Strip command prefixes to get the actual content to analyze
  const cleanInput = stripCommandPrefix(userInput);
  console.log('[TwitterAgent] Raw input:', userInput.substring(0, 50));
  console.log('[TwitterAgent] Clean input:', cleanInput.substring(0, 50));
  
  const inputType = detectInputType(cleanInput);
  const intent = detectIntent(cleanInput);
  const audience = detectAudience(cleanInput);
  const url = extractUrl(cleanInput);
  const topic = extractTopic(cleanInput, inputType);
  
  const request: ContentRequest = {
    input_type: inputType,
    raw_input: cleanInput,  // Use the cleaned input
    intent: intent,
    target_audience: audience,
    extracted_url: url,
    extracted_topic: topic,
    context: context,
  };
  
  // Generate ACTUAL analysis based on the cleaned content
  const analysis = analyzeActualContent(request);
  
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
 * Analyze actual content instead of returning templates
 */
function analyzeActualContent(request: ContentRequest): ContentAnalysis {
  // Use the raw input directly so we analyze what the user actually typed
  const content = request.raw_input;
  console.log('[TwitterAgent] Analyzing content:', content.substring(0, 100));
  
  const contentLower = content.toLowerCase();
  
  // Analyze content structure
  const wordCount = content.split(/\s+/).length;
  const hasNumbers = /\d+/.test(content);
  const hasQuestion = content.includes('?');
  const hasExclamation = content.includes('!');
  const hasEmojis = /[\u{1F600}-\u{1F64F}]/u.test(content);
  
  console.log('[TwitterAgent] Word count:', wordCount, 'Has numbers:', hasNumbers, 'Has question:', hasQuestion);
  
  // Determine content category based on actual content
  let category = 'general';
  if (contentLower.includes('automation') || contentLower.includes('workflow') || contentLower.includes('openclaw')) category = 'automation';
  else if (contentLower.includes('ai') || contentLower.includes('machine learning') || contentLower.includes('artificial intelligence')) category = 'ai';
  else if (contentLower.includes('startup') || contentLower.includes('founder') || contentLower.includes('entrepreneur')) category = 'startup';
  else if (contentLower.includes('marketing') || contentLower.includes('growth') || contentLower.includes('seo')) category = 'marketing';
  else if (contentLower.includes('code') || contentLower.includes('developer') || contentLower.includes('programming')) category = 'tech';
  
  console.log('[TwitterAgent] Category:', category);
  
  // Extract the actual first sentence for hook analysis
  const firstSentence = content.split(/[.!?]/)[0] || '';
  const hookStrength = analyzeHook(firstSentence);
  
  // Performance predictions based on actual content
  const performance = predictPerformance(content, category);
  
  // Generate specific insights based on ACTUAL content
  const insights = [
    `Content length: ${content.length} characters (${content.length > 280 ? 'Thread candidate' : 'Single tweet'})`,
    `Hook analysis: ${hookStrength.strength} - ${hookStrength.reason}`,
    `Predicted engagement: ${performance.engagement} - ${performance.reason}`,
  ];
  
  // Main points to cover based on what's actually in the content
  const mainPoints = [
    `Current opening: "${firstSentence.substring(0, 50)}${firstSentence.length > 50 ? '...' : ''}"`,
    `Word count: ${wordCount} words`,
    hasNumbers ? '✓ Contains specific numbers/stats' : '⚠ No specific numbers - adding stats could help',
    hasQuestion ? '✓ Includes question to drive engagement' : '⚠ No question - consider adding one',
  ];
  
  // Content gaps specific to this content
  const gaps: string[] = [];
  if (!hasNumbers) gaps.push('Add specific numbers or statistics for credibility');
  if (!hasQuestion) gaps.push('Include a question to increase replies');
  if (content.length < 100) gaps.push('Content is short - could expand with more value');
  if (!content.includes('@') && !content.includes('#')) gaps.push('Consider adding relevant mentions or hashtags');
  
  const hashtags: Record<string, string[]> = {
    'automation': ['#Automation', '#OpenClaw', '#Workflow'],
    'ai': ['#AI', '#ArtificialIntelligence', '#Tech'],
    'startup': ['#Startup', '#Founder', '#Entrepreneur'],
    'marketing': ['#Marketing', '#Growth', '#B2B'],
    'tech': ['#DevTools', '#Developer', '#Coding'],
    'general': ['#Tech', '#Business', '#Tips'],
  };
  
  console.log('[TwitterAgent] Analysis complete');
  
  return {
    source_type: request.input_type,
    source_url: request.extracted_url,
    source_title: content.slice(0, 60) + (content.length > 60 ? '...' : ''),
    key_insights: insights,
    key_quotes: extractQuotes(content),
    statistics: extractStats(content),
    main_points: mainPoints,
    recommended_angle: determineAngle(request.intent, hookStrength, category),
    content_gaps: gaps.length > 0 ? gaps : ['No major gaps identified'],
    trending_hashtags: hashtags[category]?.slice(0, 3) || hashtags['general'].slice(0, 3),
    optimal_timing: 'Tuesday-Thursday, 9-11 AM EST',
    related_accounts: getRelatedAccounts(category),
    conversation_context: `Analysis of ${category} content`,
  };
}

function analyzeHook(firstSentence: string): { strength: 'strong' | 'medium' | 'weak'; reason: string } {
  const sentence = firstSentence.toLowerCase();
  
  // Strong hooks
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
  
  // Weak hooks
  if (sentence.length < 20) {
    return { strength: 'weak', reason: 'Too short, lacks impact' };
  }
  if (sentence.startsWith('i think') || sentence.startsWith('in my opinion')) {
    return { strength: 'weak', reason: 'Weak opening, lacks authority' };
  }
  
  return { strength: 'medium', reason: 'Standard opening, could be stronger' };
}

function extractThemes(content: string): string[] {
  const themes: string[] = [];
  const contentLower = content.toLowerCase();
  
  const themeKeywords: Record<string, string[]> = {
    'productivity': ['productivity', 'efficiency', 'time', 'save'],
    'growth': ['growth', 'scale', 'increase', 'grow'],
    'strategy': ['strategy', 'plan', 'approach', 'framework'],
    'tools': ['tools', 'software', 'app', 'platform'],
    'mistakes': ['mistakes', 'wrong', 'fail', 'error'],
    'tips': ['tips', 'tricks', 'how to', 'guide'],
  };
  
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some(k => contentLower.includes(k))) {
      themes.push(theme);
    }
  }
  
  return themes.slice(0, 3);
}

function predictPerformance(content: string, category: string): { engagement: 'high' | 'medium' | 'low'; reason: string } {
  let score = 0;
  
  // Length (ideal: 100-200 chars for single tweet)
  if (content.length >= 100 && content.length <= 280) score += 2;
  else if (content.length > 280) score += 1;
  
  // Has numbers
  if (/\d+/.test(content)) score += 1;
  
  // Has question or call to action
  if (content.includes('?') || content.includes('RT if') || content.includes('comment')) score += 1;
  
  // Specific categories perform better
  if (category === 'startup' || category === 'ai') score += 1;
  
  if (score >= 4) return { engagement: 'high', reason: 'Strong engagement factors present' };
  if (score >= 2) return { engagement: 'medium', reason: 'Decent potential, room for improvement' };
  return { engagement: 'low', reason: 'Missing key engagement drivers' };
}

function generateContentInsights(content: string, category: string, hook: any, performance: any): string[] {
  const insights: string[] = [];
  
  // Hook analysis
  insights.push(`Hook strength: ${hook.strength} - ${hook.reason}`);
  
  // Performance prediction
  insights.push(`Predicted engagement: ${performance.engagement} - ${performance.reason}`);
  
  // Category-specific insights
  if (category === 'automation') {
    insights.push('Automation content performs well with practical examples');
  } else if (category === 'startup') {
    insights.push('Founder stories and lessons get high engagement');
  } else if (category === 'ai') {
    insights.push('AI content trending - good timing for this topic');
  }
  
  // Content structure insights
  if (content.length > 280) {
    insights.push('Content exceeds single tweet limit - consider thread format');
  }
  if (!content.includes('?') && !content.includes('!')) {
    insights.push('Adding a question or strong statement could boost engagement');
  }
  
  return insights.slice(0, 3);
}

function generateMainPoints(content: string, category: string, inputType: string): string[] {
  const points: string[] = [];
  
  if (inputType === 'link') {
    points.push('Extract the core insight from the article');
    points.push('Add your perspective/commentary');
    points.push('Include a hook that makes people want to click');
  } else if (inputType === 'topic') {
    points.push('Start with a bold statement or question');
    points.push('Provide specific examples or data');
    points.push('End with actionable takeaway or CTA');
  } else if (inputType === 'draft') {
    points.push('Strengthen the opening hook');
    points.push('Remove filler words, be concise');
    points.push('Add engagement driver (question or CTA)');
  } else {
    points.push('Lead with the most valuable insight');
    points.push('Keep it concise (under 280 chars if single tweet)');
    points.push('End with clear next step or question');
  }
  
  return points;
}

function identifyGaps(content: string, category: string): string[] {
  const gaps: string[] = [];
  
  if (!content.includes('@') && !content.includes('#')) {
    gaps.push('Consider mentioning relevant accounts or hashtags');
  }
  if (!/\d+%|\d+x|\$\d+/.test(content)) {
    gaps.push('Adding specific numbers/stats could increase credibility');
  }
  if (!content.includes('?')) {
    gaps.push('No question present - adding one could boost replies');
  }
  if (content.length < 50) {
    gaps.push('Content is quite short - could expand with more value');
  }
  
  return gaps.slice(0, 2);
}

function extractQuotes(content: string): string[] {
  // Extract anything in quotes
  const matches = content.match(/"([^"]+)"/g);
  return matches ? matches.map(q => q.replace(/"/g, '')).slice(0, 2) : [];
}

function extractStats(content: string): string[] {
  // Extract numbers with context
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
  if (textLower.includes('promote') || textLower.includes('launch') || textLower.includes('check out')) return 'promote';
  if (textLower.includes('ask') || textLower.includes('question') || textLower.includes('poll')) return 'engage';
  if (textLower.includes('funny') || textLower.includes('joke')) return 'entertain';
  if (textLower.includes('opinion') || textLower.includes('think') || textLower.includes('believe')) return 'opinion';
  return 'educate';
}

function detectAudience(text: string): string {
  const textLower = text.toLowerCase();
  if (textLower.includes('founder') || textLower.includes('startup')) return 'founders';
  if (textLower.includes('marketer') || textLower.includes('growth')) return 'marketers';
  if (textLower.includes('dev') || textLower.includes('code')) return 'developers';
  if (textLower.includes('automation') || textLower.includes('openclaw')) return 'automation';
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
  if (inputType === 'idea') {
    const match = text.match(/(?:idea|concept):\s*(.+?)(?:\s+(?:for|to|with)|$)/i);
    return match ? match[1].trim() : text.trim();
  }
  return undefined;
}

function generateSummary(analysis: ContentAnalysis): string {
  return `📊 ANALYSIS SUMMARY
==================================================
Source: ${analysis.source_title}
Type: ${analysis.source_type}
Recommended Angle: ${analysis.recommended_angle}

💡 Key Insights:
${analysis.key_insights.map((i, idx) => `  ${idx + 1}. ${i}`).join('\n')}

📝 Main Points to Cover:
${analysis.main_points.map((p, idx) => `  ${idx + 1}. ${p}`).join('\n')}

🏷️ Suggested Hashtags: ${analysis.trending_hashtags.join(' ')}
⏰ Best Posting Time: ${analysis.optimal_timing}`;
}
