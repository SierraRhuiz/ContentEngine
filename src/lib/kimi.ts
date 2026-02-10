/**
 * Kimi K2.5 API Client
 * 
 * API: Moonshot AI (Kimi)
 * Docs: https://platform.moonshot.cn/docs
 * 
 * NOTE: Use api.moonshot.ai (international) or api.moonshot.cn (China)
 */

const KIMI_API_KEY = process.env.NEXT_PUBLIC_KIMI_API_KEY || '';
const BASE_URL = 'https://api.moonshot.ai/v1'; // International endpoint

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface VoiceProfile {
  tone: string;
  themes: string[];
  patterns: {
    sentence_length: string;
    emoji_usage: string;
    hashtag_style: string;
    hooks: string[];
  };
  vocabulary: string[];
  avoid: string[];
}

/**
 * Send a chat completion request to Kimi K2.5
 */
export async function chat(
  messages: Message[],
  options: ChatOptions = {}
): Promise<string> {
  const {
    model = 'kimi-k2.5',
    temperature = 1,  // Kimi K2.5 requires temperature=1
    max_tokens = 4096,
    stream = false,
  } = options;

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KIMI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
      stream,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kimi API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generate content with brand voice
 */
export async function generateWithVoice(
  prompt: string,
  voiceProfile: VoiceProfile
): Promise<string> {
  const systemPrompt = `You are a content writer. Write in this specific voice:

TONE: ${voiceProfile.tone}

THEMES: ${voiceProfile.themes.join(', ')}

WRITING PATTERNS:
- Sentence length: ${voiceProfile.patterns.sentence_length}
- Emoji usage: ${voiceProfile.patterns.emoji_usage}
- Hashtag style: ${voiceProfile.patterns.hashtag_style}
- Hooks: ${voiceProfile.patterns.hooks.join(', ')}

VOCABULARY TO USE: ${voiceProfile.vocabulary.join(', ')}

AVOID: ${voiceProfile.avoid.join(', ')}

Write naturally in this voice. Don't be robotic or generic.`;

  return chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt },
  ]);
}

/**
 * Generate tweet similar to source
 */
export async function generateSimilarTweet(
  sourceTweet: string,
  voiceProfile: VoiceProfile
): Promise<string> {
  const prompt = `Create a tweet inspired by this post (don't copy it, transform the idea for our brand):

SOURCE: "${sourceTweet}"

Write a single tweet (max 280 chars) that captures a similar insight but in our voice. Make it original and engaging.`;

  return generateWithVoice(prompt, voiceProfile);
}

/**
 * Extract brand voice from tweets
 */
export async function extractVoiceProfile(tweets: string[]): Promise<VoiceProfile> {
  const prompt = `Analyze these tweets and extract the writer's voice profile:

${tweets.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Return a JSON object with this exact structure:
{
  "tone": "describe the tone and personality in 5-10 words",
  "themes": ["theme1", "theme2", "theme3"],
  "patterns": {
    "sentence_length": "describe",
    "emoji_usage": "describe",
    "hashtag_style": "describe",
    "hooks": ["hook type 1", "hook type 2"]
  },
  "vocabulary": ["word1", "word2", "word3"],
  "avoid": ["thing1", "thing2"]
}

Only return valid JSON, no other text.`;

  const response = await chat([
    { role: 'system', content: 'You are a writing analyst. Return only valid JSON.' },
    { role: 'user', content: prompt },
  ]);

  try {
    return JSON.parse(response);
  } catch {
    // Try to extract JSON from response
    const match = response.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Failed to parse voice profile');
  }
}

/**
 * Generate blog post from scraped content
 */
export async function generateBlogPost(
  keyPoints: string[],
  voiceProfile: VoiceProfile,
  options: {
    wordCount?: number;
    angle?: 'contrarian' | 'expanded' | 'simplified' | 'case-study';
    title?: string;
  } = {}
): Promise<string> {
  const { wordCount = 1500, angle = 'expanded', title } = options;

  const anglePrompts = {
    contrarian: 'Take a contrarian stance on this topic. Challenge conventional wisdom.',
    expanded: 'Expand on these points with more depth, examples, and actionable insights.',
    simplified: 'Simplify these concepts. Make it accessible to beginners.',
    'case-study': 'Frame this as a case study with real examples and results.',
  };

  const prompt = `Write a ${wordCount}-word blog post based on these key points:

${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

${title ? `Title: ${title}` : 'Create an engaging title.'}

Angle: ${anglePrompts[angle]}

Structure:
- Compelling hook/intro
- Main sections with headers
- Actionable takeaways
- Strong conclusion

Make it engaging and valuable.`;

  return generateWithVoice(prompt, voiceProfile);
}

/**
 * Generate content from video transcript
 */
export async function generateFromTranscript(
  transcript: string,
  outputType: 'tweet-thread' | 'blog' | 'linkedin' | 'youtube-desc' | 'key-quotes',
  voiceProfile: VoiceProfile
): Promise<string> {
  const outputPrompts = {
    'tweet-thread': 'Create a Twitter thread (5-10 tweets) summarizing the key insights. Start with a hook.',
    'blog': 'Write a 1000-word blog post covering the main topics discussed.',
    'linkedin': 'Write a LinkedIn post (300-500 words) with the key insights. Professional but engaging.',
    'youtube-desc': 'Write a YouTube description with timestamps, key points, and CTAs.',
    'key-quotes': 'Extract 5-10 quotable moments that would make great social media posts.',
  };

  const prompt = `Based on this video transcript:

${transcript.slice(0, 15000)}${transcript.length > 15000 ? '...[truncated]' : ''}

${outputPrompts[outputType]}`;

  return generateWithVoice(prompt, voiceProfile);
}

/**
 * Simple completion for chat interface
 */
export async function complete(userMessage: string, systemPrompt?: string): Promise<string> {
  const messages: Message[] = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  
  messages.push({ role: 'user', content: userMessage });
  
  return chat(messages);
}

export default {
  chat,
  complete,
  generateWithVoice,
  generateSimilarTweet,
  extractVoiceProfile,
  generateBlogPost,
  generateFromTranscript,
};
