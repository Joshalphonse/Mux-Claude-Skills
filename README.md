<div align="center">

```
███╗   ███╗██╗   ██╗██╗  ██╗     █████╗ ██╗
████╗ ████║██║   ██║╚██╗██╔╝    ██╔══██╗██║
██╔████╔██║██║   ██║ ╚███╔╝     ███████║██║
██║╚██╔╝██║██║   ██║ ██╔██╗     ██╔══██║██║
██║ ╚═╝ ██║╚██████╔╝██╔╝╚██╗    ██║  ██║██║
╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝
```

**AI-Powered Video Analysis & Docs Claude Skill**

</div>

# Mux AI Claude Skill

A Claude skill for analyzing video content using the [@mux/ai](https://github.com/muxinc/mux-ai) SDK. Automatically generate summaries, chapters, moderation scores, and more from your Mux video assets.

## Features

- **Summarization** — Generate titles, descriptions, and SEO tags
- **Chapter Generation** — Auto-create chapter markers from transcripts
- **Content Moderation** — Detect inappropriate content in video frames
- **Caption Translation** — Translate captions to different languages
- **Audio Dubbing** — Create AI-dubbed audio tracks
- **Video Embeddings** — Generate vectors for semantic search

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Fill in your Mux and AI provider credentials

# 3. Run the analysis script
npx tsx .claude/skills/mux-ai-video/scripts/analyze-video.ts <asset-id> --all
```

## Required Credentials

| Variable                       | Required     | Description                                |
| ------------------------------ | ------------ | ------------------------------------------ |
| `MUX_TOKEN_ID`                 | ✅           | Mux API token ID                           |
| `MUX_TOKEN_SECRET`             | ✅           | Mux API token secret                       |
| `OPENAI_API_KEY`               | One of these | OpenAI API key                             |
| `ANTHROPIC_API_KEY`            | One of these | Anthropic API key                          |
| `GOOGLE_GENERATIVE_AI_API_KEY` | One of these | Google AI API key                          |
| `S3_ENDPOINT`                  | One of these | S3 endpoint (for upload-enabled workflows) |
| `S3_REGION`                    | One of these | S3 region (e.g., `auto`)                   |
| `S3_BUCKET`                    | One of these | S3 bucket name                             |
| `S3_ACCESS_KEY_ID`             | One of these | S3 access key                              |
| `S3_SECRET_ACCESS_KEY`         | One of these | S3 secret key                              |

Get your Mux credentials at [dashboard.mux.com/settings/access-tokens](https://dashboard.mux.com/settings/access-tokens).

## Documentation

- [SKILL.md](.claude/skills/mux-ai-video/SKILL.md) — Skill overview
- [WORKFLOWS.md](.claude/skills/mux-ai-video/WORKFLOWS.md) — Detailed workflow reference
- [Mux Docs Skill](.claude/skills/mux-docs/SKILL.md) — Build a local corpus from the mux.com docs for grounded Q&A
