"""
Twitter Agent - Input Module
Handles all types of content inputs and normalizes them for processing
"""

from dataclasses import dataclass
from typing import Optional, List
from enum import Enum
import re

class InputType(Enum):
    LINK = "link"
    TOPIC = "topic"
    IDEA = "idea"
    DRAFT = "draft"
    REPLY = "reply"

class IntentType(Enum):
    EDUCATE = "educate"
    PROMOTE = "promote"
    ENGAGE = "engage"
    ENTERTAIN = "entertain"
    OPINION = "opinion"

@dataclass
class ContentRequest:
    """Normalized content request ready for analysis"""
    input_type: InputType
    raw_input: str
    intent: IntentType
    target_audience: str
    extracted_url: Optional[str] = None
    extracted_topic: Optional[str] = None
    context: Optional[str] = None
    preferred_tone: Optional[str] = None
    thread_preference: Optional[str] = None  # "single", "thread", "auto"

class InputProcessor:
    """Processes raw user inputs into structured content requests"""
    
    # URL pattern matching
    URL_PATTERN = re.compile(
        r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    )
    
    # Quick input patterns
    PATTERNS = {
        InputType.LINK: [
            r'(?:post|share|tweet)\s+(?:this|about)\s*:?\s*https?://',
            r'https?://\S+',
        ],
        InputType.TOPIC: [
            r'(?:tweet|post)\s+(?:about|on)\s+(.+)',
            r'write\s+(?:about|on)\s+(.+)',
        ],
        InputType.IDEA: [
            r'idea\s*:?\s*(.+)',
            r'concept\s*:?\s*(.+)',
            r'thought\s*:?\s*(.+)',
        ],
        InputType.DRAFT: [
            r"(?:here's|this is)\s+my\s+draft",
            r'(?:improve|polish|fix)\s+(?:this|my)\s*:?\s*(.+)',
        ],
        InputType.REPLY: [
            r'reply\s+to\s+@?(\w+)',
            r'respond\s+to\s+@?(\w+)',
        ]
    }
    
    def process(self, user_input: str, context: Optional[str] = None) -> ContentRequest:
        """
        Main entry point - takes raw input and returns structured request
        """
        # Detect input type
        input_type = self._detect_input_type(user_input)
        
        # Extract components based on type
        extracted = self._extract_components(user_input, input_type)
        
        # Determine intent
        intent = self._detect_intent(user_input)
        
        # Identify target audience
        audience = self._detect_audience(user_input)
        
        return ContentRequest(
            input_type=input_type,
            raw_input=user_input,
            intent=intent,
            target_audience=audience,
            extracted_url=extracted.get('url'),
            extracted_topic=extracted.get('topic'),
            context=context,
            preferred_tone=extracted.get('tone'),
            thread_preference=extracted.get('thread_pref', 'auto')
        )
    
    def _detect_input_type(self, text: str) -> InputType:
        """Detect what type of input the user provided"""
        text_lower = text.lower()
        
        # Check for URLs first (strong signal)
        if self.URL_PATTERN.search(text):
            # Check if it's specifically a reply request with URL
            if re.search(r'reply\s+to', text_lower):
                return InputType.REPLY
            return InputType.LINK
        
        # Check patterns in order of specificity
        for input_type, patterns in self.PATTERNS.items():
            if input_type == InputType.LINK:
                continue  # Already checked
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    return input_type
        
        # Default: treat as topic
        return InputType.TOPIC
    
    def _extract_components(self, text: str, input_type: InputType) -> dict:
        """Extract relevant components based on input type"""
        result = {}
        text_lower = text.lower()
        
        # Extract URL if present
        url_match = self.URL_PATTERN.search(text)
        if url_match:
            result['url'] = url_match.group(0)
        
        # Extract topic/idea based on type
        if input_type == InputType.TOPIC:
            match = re.search(r'(?:about|on)\s+(.+?)(?:\s+(?:for|to|with)|$)', text_lower)
            if match:
                result['topic'] = match.group(1).strip()
            else:
                result['topic'] = text.strip()
                
        elif input_type == InputType.IDEA:
            match = re.search(r'(?:idea|concept|thought)\s*:?\s*(.+?)(?:\s+(?:for|to|with)|$)', text_lower)
            if match:
                result['topic'] = match.group(1).strip()
            else:
                result['topic'] = text.strip()
        
        # Detect tone preference
        tone_indicators = {
            'professional': ['professional', 'formal', 'business'],
            'casual': ['casual', 'friendly', 'conversational'],
            'witty': ['witty', 'funny', 'humorous', 'sarcastic'],
            'bold': ['bold', 'strong', 'controversial', 'hot take'],
            'educational': ['educational', 'informative', 'explain']
        }
        
        for tone, indicators in tone_indicators.items():
            if any(ind in text_lower for ind in indicators):
                result['tone'] = tone
                break
        
        # Detect thread preference
        if any(word in text_lower for word in ['thread', 'breakdown', 'step by step']):
            result['thread_pref'] = 'thread'
        elif any(word in text_lower for word in ['single', 'one tweet', 'short']):
            result['thread_pref'] = 'single'
        
        return result
    
    def _detect_intent(self, text: str) -> IntentType:
        """Determine the user's intent for the content"""
        text_lower = text.lower()
        
        # Promotional indicators
        if any(word in text_lower for word in ['promote', 'launch', 'announce', 'check out', 'try']):
            return IntentType.PROMOTE
        
        # Engagement indicators
        if any(word in text_lower for word in ['ask', 'question', 'what do', 'poll', 'vote']):
            return IntentType.ENGAGE
        
        # Entertainment indicators
        if any(word in text_lower for word in ['funny', 'joke', 'meme', 'lol']):
            return IntentType.ENTERTAIN
        
        # Opinion indicators
        if any(word in text_lower for word in ['opinion', 'think', 'believe', 'wrong', 'right', 'should']):
            return IntentType.OPINION
        
        # Default to educate
        return IntentType.EDUCATE
    
    def _detect_audience(self, text: str) -> str:
        """Identify target audience from context clues"""
        text_lower = text.lower()
        
        audiences = {
            'founders': ['founders', 'entrepreneurs', 'startup', 'builders'],
            'marketers': ['marketers', 'marketing', 'growth', 'ads'],
            'developers': ['devs', 'developers', 'engineers', 'coding', 'programming'],
            'automation': ['automation', 'automating', 'workflows', 'openclaw'],
            'general': ['everyone', 'people', 'folks']
        }
        
        for audience, indicators in audiences.items():
            if any(ind in text_lower for ind in indicators):
                return audience
        
        return 'general'


def process_input(user_input: str, context: Optional[str] = None) -> ContentRequest:
    """Convenience function for quick processing"""
    processor = InputProcessor()
    return processor.process(user_input, context)


if __name__ == "__main__":
    # Test examples
    test_inputs = [
        "Post this: https://techcrunch.com/2024/01/15/ai-automation-trends",
        "Tweet about automation mistakes founders make",
        "Idea: The paradox of trying to automate everything",
        "Here's my draft: We help businesses grow faster with automation. Check us out!",
        "Reply to @elonmusk with a counter-argument about AI safety",
    ]
    
    processor = InputProcessor()
    
    print("=" * 60)
    print("INPUT MODULE TEST")
    print("=" * 60)
    
    for inp in test_inputs:
        print(f"\nInput: {inp[:60]}...")
        result = processor.process(inp)
        print(f"  Type: {result.input_type.value}")
        print(f"  Intent: {result.intent.value}")
        print(f"  Audience: {result.target_audience}")
        if result.extracted_url:
            print(f"  URL: {result.extracted_url}")
        if result.extracted_topic:
            print(f"  Topic: {result.extracted_topic}")
        if result.preferred_tone:
            print(f"  Tone: {result.preferred_tone}")
        print("-" * 40)
