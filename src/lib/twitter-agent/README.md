# Twitter Agent - Quick Start

## Current Status
✅ **Input Module** - Detects and classifies content requests  
✅ **Analyze Module** - Researches and formulates strategy  
⏳ **Create Module** - (Next: Generate actual tweets)  
⏳ **Review Module** - (Pending: Approval workflow)  
⏳ **Post Module** - (Pending: Twitter API integration)  

---

## How to Run

### Test the Pipeline
```bash
cd ~/.openclaw/workspace/agents/twitter
python agent.py
```

Then try inputs like:
- `Post this: https://techcrunch.com/article-about-ai`
- `Tweet about automation mistakes founders make`
- `Idea: The paradox of trying to automate everything`

### Run Module Tests Individually
```bash
# Test Input Module
python modules/input_module.py

# Test Analyze Module  
python modules/analyze_module.py
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      TWITTER AGENT                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────┐      ┌──────────────┐                   │
│   │ Input Module │  →   │Analyze Module│  →  (Create next) │
│   └──────────────┘      └──────────────┘                   │
│          │                     │                           │
│   • Detect type           • Fetch/extract                 │
│   • Extract URL           • Identify insights             │
│   • Classify intent       • Formulate angle               │
│   • Detect audience       • Suggest hashtags              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Input Types Supported

| Type | Example | What Happens |
|------|---------|--------------|
| **Link** | "Post this: https://..." | Fetches article, extracts insights |
| **Topic** | "Tweet about AI trends" | Researches topic, finds angle |
| **Idea** | "Idea: Automation paradox" | Expands concept into outline |
| **Draft** | "Improve this draft..." | Analyzes and suggests fixes |
| **Reply** | "Reply to @user..." | Prepares contextual response |

---

## What Gets Analyzed

For every input, the agent produces:

1. **Content Strategy**
   - Recommended angle (educational/controversial/witty/etc.)
   - Key insights to highlight
   - Main points to cover

2. **Engagement Optimization**
   - Suggested hashtags (max 3)
   - Optimal posting time
   - Related accounts to mention

3. **Gap Analysis**
   - What's missing from the content
   - Opportunities to add value
   - Suggested improvements

---

## Next Steps

1. **Test current modules** - Run `python agent.py` and try different inputs
2. **Build Create Module** - Generate actual tweet drafts based on analysis
3. **Add Review Workflow** - Present draft for approval/edits
4. **Integrate Twitter API** - Post approved content

---

## Files

```
agents/twitter/
├── agent.py                    # Main pipeline runner
├── README.md                   # This file
├── modules/
│   ├── input_module.py         # Input processing
│   └── analyze_module.py       # Content analysis
└── tests/                      # (Add tests here)
```

---

## Example Output

```
🚀 Starting pipeline for: Post this: https://techcrunch.com/...
============================================================

📥 STEP 1: Processing Input...
  Type: link
  Intent: educate
  Audience: general
  URL: https://techcrunch.com/...

🔍 STEP 2: Analyzing Content...
📊 ANALYSIS SUMMARY
==================================================
Source: Article from techcrunch.com
Type: web_article
Recommended Angle: educational_breakdown

💡 Key Insights:
  1. Key trend identified in the automation space
  2. Practical implementation strategies discussed
  3. Common pitfalls highlighted with solutions

📝 Main Points to Cover:
  1. Define outcomes before automating
  2. Start with high-frequency, low-complexity tasks
  3. Measure ROI continuously

🏷️  Suggested Hashtags: #Tech #Business #Tips
⏰ Best Posting Time: Tuesday-Thursday, 9-11 AM EST

============================================================
✅ Pipeline Complete - Ready for Create Module
============================================================
```

Ready to test it out?
