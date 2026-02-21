"""
Twitter Agent - Analyze Module
Fetches content, extracts insights, and formulates posting strategy
"""

from dataclasses import dataclass, field
from typing import Optional, List, Dict
import json
import re
from urllib.parse import urlparse

@dataclass
class ContentAnalysis:
    """Complete analysis of content ready for tweet creation"""
    # Source info
    source_type: str  # "web_article", "topic_research", "raw_idea", "user_draft"
    source_url: Optional[str] = None
    source_title: Optional[str] = None
    
    # Extracted content
    key_insights: List[str] = field(default_factory=list)
    key_quotes: List[str] = field(default_factory=list)
    statistics: List[str] = field(default_factory=list)
    main_points: List[str] = field(default_factory=list)
    
    # Strategy
    recommended_angle: Optional[str] = None
    content_gaps: List[str] = field(default_factory=list)
    trending_hashtags: List[str] = field(default_factory=list)
    
    # Timing & Context
    optimal_timing: Optional[str] = None
    related_accounts: List[str] = field(default_factory=list)
    conversation_context: Optional[str] = None


class ContentAnalyzer:
    """Analyzes content and formulates posting strategy"""
    
    def __init__(self):
        self.hashtag_suggestions = {
            'automation': ['#Automation', '#OpenClaw', '#Workflow', '#Efficiency'],
            'ai': ['#AI', '#ArtificialIntelligence', '#MachineLearning', '#Tech'],
            'marketing': ['#Marketing', '#Growth', '#DigitalMarketing', '#B2B'],
            'founders': ['#Startup', '#Founder', '#Entrepreneur', '#BuildInPublic'],
            'dev': ['#DevTools', '#Developer', '#Coding', '#Programming'],
        }
    
    def analyze(self, content_request) -> ContentAnalysis:
        """
        Main entry point - takes a ContentRequest and returns full analysis
        """
        # Route to appropriate analyzer based on input type
        if content_request.input_type.value == 'link':
            return self._analyze_link(content_request)
        elif content_request.input_type.value == 'topic':
            return self._analyze_topic(content_request)
        elif content_request.input_type.value == 'idea':
            return self._analyze_idea(content_request)
        elif content_request.input_type.value == 'draft':
            return self._analyze_draft(content_request)
        elif content_request.input_type.value == 'reply':
            return self._analyze_reply(content_request)
        else:
            return self._analyze_topic(content_request)
    
    def _analyze_link(self, request) -> ContentAnalysis:
        """Fetch and analyze web content"""
        url = request.extracted_url
        
        # Simulate content fetching (in real implementation, use web_fetch tool)
        # For now, generate realistic mock analysis
        domain = urlparse(url).netloc if url else "unknown"
        
        analysis = ContentAnalysis(
            source_type="web_article",
            source_url=url,
            source_title=f"Article from {domain}",
            key_insights=[
                "Key trend identified in the automation space",
                "Practical implementation strategies discussed",
                "Common pitfalls highlighted with solutions"
            ],
            key_quotes=[
                "The most successful automations start with clear outcomes",
                "Manual processes are often automated prematurely"
            ],
            statistics=[
                "67% of automation projects fail due to poor planning",
                "Top performers automate 3x more strategically"
            ],
            main_points=[
                "Define outcomes before automating",
                "Start with high-frequency, low-complexity tasks",
                "Measure ROI continuously"
            ],
            recommended_angle=self._select_angle(request),
            content_gaps=[
                "Could add personal experience angle",
                "Missing direct call-to-action"
            ],
            trending_hashtags=self._suggest_hashtags(request.target_audience, domain),
            optimal_timing="Tuesday-Thursday, 9-11 AM EST",
            related_accounts=["@OpenClawHQ", "@AutomateHQ"],
            conversation_context="Active discussion on workflow optimization"
        )
        
        return analysis
    
    def _analyze_topic(self, request) -> ContentAnalysis:
        """Research and analyze a topic"""
        topic = request.extracted_topic or request.raw_input
        
        analysis = ContentAnalysis(
            source_type="topic_research",
            source_title=topic[:50] if len(topic) > 50 else topic,
            key_insights=[
                f"Key insight about {topic}",
                f"Trending angle on {topic}",
                f"Contrarian perspective worth exploring"
            ],
            main_points=[
                "Point 1: Core concept explanation",
                "Point 2: Practical application",
                "Point 3: Actionable takeaway"
            ],
            recommended_angle=self._select_angle(request),
            trending_hashtags=self._suggest_hashtags(request.target_audience, topic),
            optimal_timing="Peak engagement: Tue-Thu, 8-10 AM EST",
            conversation_context=f"Trending discussions around {topic}"
        )
        
        return analysis
    
    def _analyze_idea(self, request) -> ContentAnalysis:
        """Expand and analyze a raw idea"""
        idea = request.extracted_topic or request.raw_input
        
        analysis = ContentAnalysis(
            source_type="raw_idea",
            source_title=f"Idea: {idea[:40]}..." if len(idea) > 40 else f"Idea: {idea}",
            key_insights=[
                f"Idea explores: {idea}",
                "Potential for educational content",
                "Could spark engagement/discussion"
            ],
            main_points=[
                "Hook: Controversial or curious opener",
                "Body: Expand the idea with examples",
                "Conclusion: Strong takeaway or question"
            ],
            recommended_angle=self._select_angle(request),
            trending_hashtags=self._suggest_hashtags(request.target_audience, idea),
            conversation_context="Original thought piece"
        )
        
        return analysis
    
    def _analyze_draft(self, request) -> ContentAnalysis:
        """Analyze and improve a user draft"""
        draft = request.raw_input
        
        analysis = ContentAnalysis(
            source_type="user_draft",
            source_title="User-provided draft",
            key_insights=[
                "Draft captures core message",
                "Opportunities for hook improvement",
                "Consider adding specific examples"
            ],
            main_points=[
                "Analyze current draft structure",
                "Identify weak/strong elements",
                "Suggest improvements"
            ],
            content_gaps=[
                "Hook could be stronger",
                "Missing engagement driver",
                "Call-to-action needed"
            ],
            recommended_angle="polish_existing",
            trending_hashtags=self._suggest_hashtags(request.target_audience, draft),
            conversation_context="Refining user-generated content"
        )
        
        return analysis
    
    def _analyze_reply(self, request) -> ContentAnalysis:
        """Analyze context for a reply tweet"""
        analysis = ContentAnalysis(
            source_type="reply_context",
            source_title="Reply to tweet",
            key_insights=[
                "Reply should add value, not just agree",
                "Context-aware response needed",
                "Maintain conversation flow"
            ],
            main_points=[
                "Acknowledge original point",
                "Add new perspective or data",
                "Invite further discussion"
            ],
            recommended_angle="value_add_reply",
            trending_hashtags=[],  # Replies usually don't need hashtags
            conversation_context="Direct response to existing tweet"
        )
        
        return analysis
    
    def _select_angle(self, request) -> str:
        """Select the best content angle based on request"""
        angles = {
            'educate': 'educational_breakdown',
            'promote': 'soft_promotion',
            'engage': 'question_framework',
            'entertain': 'witty_observation',
            'opinion': 'controversial_take'
        }
        
        angle = angles.get(request.intent.value, 'educational_breakdown')
        
        # Adjust based on tone preference
        if request.preferred_tone == 'bold':
            angle = 'controversial_take'
        elif request.preferred_tone == 'witty':
            angle = 'witty_observation'
        elif request.preferred_tone == 'educational':
            angle = 'educational_breakdown'
        
        return angle
    
    def _suggest_hashtags(self, audience: str, context: str) -> List[str]:
        """Suggest relevant hashtags"""
        hashtags = []
        context_lower = context.lower() if context else ""
        
        # Add audience-specific hashtags
        if audience in self.hashtag_suggestions:
            hashtags.extend(self.hashtag_suggestions[audience])
        
        # Add context-specific hashtags
        for category, tags in self.hashtag_suggestions.items():
            if category in context_lower and tags[0] not in hashtags:
                hashtags.append(tags[0])
        
        # Add general engagement hashtags
        if not hashtags:
            hashtags = ['#Tech', '#Business', '#Tips']
        
        return hashtags[:3]  # Limit to 3 hashtags
    
    def generate_summary(self, analysis: ContentAnalysis) -> str:
        """Generate human-readable summary of analysis"""
        summary = []
        summary.append(f"📊 ANALYSIS SUMMARY")
        summary.append(f"=" * 50)
        summary.append(f"Source: {analysis.source_title}")
        summary.append(f"Type: {analysis.source_type}")
        summary.append(f"Recommended Angle: {analysis.recommended_angle}")
        summary.append("")
        
        if analysis.key_insights:
            summary.append("💡 Key Insights:")
            for i, insight in enumerate(analysis.key_insights[:3], 1):
                summary.append(f"  {i}. {insight}")
            summary.append("")
        
        if analysis.main_points:
            summary.append("📝 Main Points to Cover:")
            for i, point in enumerate(analysis.main_points, 1):
                summary.append(f"  {i}. {point}")
            summary.append("")
        
        if analysis.trending_hashtags:
            summary.append(f"🏷️  Suggested Hashtags: {' '.join(analysis.trending_hashtags)}")
        
        if analysis.optimal_timing:
            summary.append(f"⏰ Best Posting Time: {analysis.optimal_timing}")
        
        return "\n".join(summary)


def analyze_content(content_request) -> ContentAnalysis:
    """Convenience function for quick analysis"""
    analyzer = ContentAnalyzer()
    return analyzer.analyze(content_request)


if __name__ == "__main__":
    # Test with input module
    from input_module import InputProcessor, process_input
    
    test_inputs = [
        "Post this: https://techcrunch.com/2024/01/15/ai-automation-trends",
        "Tweet about automation mistakes founders make",
        "Idea: The paradox of trying to automate everything",
    ]
    
    processor = InputProcessor()
    analyzer = ContentAnalyzer()
    
    print("=" * 60)
    print("ANALYZE MODULE TEST")
    print("=" * 60)
    
    for inp in test_inputs:
        print(f"\n📝 Input: {inp}")
        print("-" * 50)
        
        # Process input
        request = processor.process(inp)
        
        # Analyze
        analysis = analyzer.analyze(request)
        
        # Print summary
        print(analyzer.generate_summary(analysis))
        print("=" * 50)
