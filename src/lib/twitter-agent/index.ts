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
 * This calls the Python modules via API route or child process
 */
export async function processTwitterContent(
  userInput: string,
  context?: string
): Promise<TwitterAgentResult> {
  // For now, return mock data that matches the Python output
  // In production, this would call the Python modules via API
  
  const inputType = detectInputType(userInput);
  const intent = detectIntent(userInput);
  const audience = detectAudience(userInput);
  const url = extractUrl(userInput);
  const topic = extractTopic(userInput, inputType);
  
  const request: ContentRequest = {
    input_type: inputType,
    raw_input: userInput,
    intent: intent,
    target_audience: audience,
    extracted_url: url,
    extracted_topic: topic,
    context: context,
  };
  
  // Generate analysis based on input
  const analysis = generateAnalysis(request);
  
  return {
    input: request,
    analysis: analysis,
    summary: generateSummary(analysis),
  };
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

function generateAnalysis(request: ContentRequest): ContentAnalysis {
  const hashtags: Record<string, string[]> = {
    'automation': ['#Automation', '#OpenClaw', '#Workflow'],
    'founders': ['#Startup', '#Founder', '#Entrepreneur'],
    'marketers': ['#Marketing', '#Growth', '#DigitalMarketing'],
    'developers': ['#DevTools', '#Developer', '#Coding'],
    'general': ['#Tech', '#Business', '#Tips'],
  };
  
  const audienceTags = hashtags[request.target_audience] || hashtags['general'];
  
  return {
    source_type: request.input_type === 'link' ? 'web_article' : 
                 request.input_type === 'topic' ? 'topic_research' : 
                 request.input_type === 'idea' ? 'raw_idea' : 'user_draft',
    source_url: request.extracted_url,
    source_title: request.extracted_topic || request.raw_input.slice(0, 50),
    key_insights: [
      'Key insight from content analysis',
      'Practical application identified',
      'Engagement opportunity spotted',
    ],
    key_quotes: [],
    statistics: [],
    main_points: [
      'Define clear outcomes',
      'Provide actionable steps',
      'Include strong CTA',
    ],
    recommended_angle: request.intent === 'educate' ? 'educational_breakdown' :
                       request.intent === 'promote' ? 'soft_promotion' :
                       request.intent === 'opinion' ? 'controversial_take' : 'engagement_focus',
    content_gaps: ['Add specific examples', 'Include engagement hook'],
    trending_hashtags: audienceTags.slice(0, 3),
    optimal_timing: 'Tuesday-Thursday, 9-11 AM EST',
    related_accounts: ['@OpenClawHQ'],
    conversation_context: 'Active discussion on this topic',
  };
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
