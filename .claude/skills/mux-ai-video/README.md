# Mux AI Claude Skill

A Claude Agent Skill for AI-powered video workflows using the [@mux/ai](https://github.com/muxinc/ai) TypeScript SDK.

## What is this?

This is a **Claude Agent Skill** - a modular capability that extends Claude's functionality. When installed, Claude can automatically use the Mux AI SDK to:

- Generate video summaries, titles, and tags
- Create automatic chapter markers
- Detect inappropriate content (moderation)
- Detect burned-in captions
- Generate embeddings for semantic video search
- Translate captions to different languages
- Create AI-dubbed audio tracks

## Installation

### For Claude Code

Copy this skill to your Claude skills directory:

```bash
# Personal skills (available in all projects)
cp -r mux-ai-skill ~/.claude/skills/mux-ai-video

# Or project-specific skills
cp -r mux-ai-skill /path/to/your/project/.claude/skills/mux-ai-video
```

### For Claude.ai

1. Zip the skill directory:
   ```bash
   cd mux-ai-skill && zip -r ../mux-ai-skill.zip . && cd ..
   ```

2. Go to [Claude.ai](https://claude.ai) → Settings → Features
3. Upload the `mux-ai-skill.zip` file

### For Claude API

Upload the skill using the Skills API:

```bash
curl -X POST https://api.anthropic.com/v1/skills \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-beta: skills-2025-10-02" \
  -F "file=@mux-ai-skill.zip"
```

## Required Environment Variables

Set these in your environment:

```env
# Required - Mux API credentials
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret

# AI Provider keys (only need the ones you use)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
```

## Usage

Once installed, just ask Claude to work with Mux videos:

- *"Summarize this Mux video: asset-abc123"*
- *"Generate chapters for video asset xyz789"*
- *"Check this video for inappropriate content: asset-def456"*
- *"Create Spanish captions for asset-abc123"*

Claude will automatically use this skill when the request involves Mux video assets.

## Skill Structure

```
mux-ai-skill/
├── SKILL.md          # Main skill instructions (required)
├── WORKFLOWS.md      # Detailed workflow documentation
├── README.md         # This file
└── scripts/
    ├── analyze-video.ts   # Example analysis script
    └── package.json       # Script dependencies
```

## Documentation

- [SKILL.md](SKILL.md) - Quick start and workflow overview
- [WORKFLOWS.md](WORKFLOWS.md) - Detailed API reference
- [@mux/ai GitHub](https://github.com/muxinc/ai) - Official SDK documentation

## Requirements

- Node.js ≥ 21.0.0
- Mux account with API credentials
- API keys for AI providers you want to use (OpenAI, Anthropic, Google, etc.)

## License

Apache 2.0 - Same as the @mux/ai SDK

