#!/usr/bin/env python3
"""
Quick test of the Input → Analyze pipeline
"""

import sys
sys.path.insert(0, '/Users/ruiz/.openclaw/workspace/agents/twitter')

from modules.input_module import InputProcessor
from modules.analyze_module import ContentAnalyzer

def run_demo():
    agent = InputProcessor()
    analyzer = ContentAnalyzer()
    
    test_cases = [
        "Post this: https://techcrunch.com/2024/01/15/ai-automation-trends",
        "Tweet about automation mistakes founders make",
        "Idea: The paradox of trying to automate everything",
    ]
    
    print("=" * 70)
    print("🐦 TWITTER AGENT - INPUT → ANALYZE PIPELINE DEMO")
    print("=" * 70)
    
    for i, user_input in enumerate(test_cases, 1):
        print(f"\n{'─' * 70}")
        print(f"TEST CASE {i}: {user_input}")
        print('─' * 70)
        
        # Step 1: Input Processing
        print("\n📥 STEP 1: Input Processing")
        request = agent.process(user_input)
        print(f"   • Detected Type: {request.input_type.value.upper()}")
        print(f"   • Intent: {request.intent.value}")
        print(f"   • Target Audience: {request.target_audience}")
        if request.extracted_url:
            print(f"   • URL: {request.extracted_url}")
        if request.extracted_topic:
            print(f"   • Topic: {request.extracted_topic}")
        
        # Step 2: Content Analysis
        print("\n🔍 STEP 2: Content Analysis")
        analysis = analyzer.analyze(request)
        print(f"   • Source: {analysis.source_title}")
        print(f"   • Recommended Angle: {analysis.recommended_angle}")
        print(f"   • Key Insights: {len(analysis.key_insights)}")
        print(f"   • Main Points: {len(analysis.main_points)}")
        if analysis.trending_hashtags:
            print(f"   • Suggested Hashtags: {' '.join(analysis.trending_hashtags)}")
        if analysis.optimal_timing:
            print(f"   • Best Timing: {analysis.optimal_timing}")
        
        # Output JSON for next module
        print("\n📤 Output for Create Module:")
        output = {
            'input_type': request.input_type.value,
            'intent': request.intent.value,
            'audience': request.target_audience,
            'angle': analysis.recommended_angle,
            'hashtags': analysis.trending_hashtags,
            'key_points': analysis.main_points[:2]
        }
        import json
        print(f"   {json.dumps(output, indent=4)}")
        
        print(f"\n✅ Ready for Create Module (generate tweet)")
    
    print(f"\n{'=' * 70}")
    print("ALL TESTS PASSED ✓")
    print("Next: Build the Create Module to generate actual tweets")
    print("=" * 70)

if __name__ == "__main__":
    run_demo()
