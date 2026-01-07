---
name: mux-ai-video
description: AI-powered video workflows using the @mux/ai SDK. Use when working with Mux video assets, generating video summaries, creating chapters, detecting burned-in captions, content moderation, translating captions, or generating embeddings from video content.
---

# Mux AI Video Skill

This skill enables AI-powered video workflows using the [@mux/ai](https://github.com/muxinc/ai) TypeScript SDK. It connects Mux video assets to multi-modal LLMs for intelligent video processing.

## Quick Start

Install the SDK and run workflows:

```bash
npm install @mux/ai
```

```typescript
import { getSummaryAndTags } from "@mux/ai/workflows";

const result = await getSummaryAndTags("your-asset-id", {
  provider: "openai",
  tone: "professional",
  includeTranscript: true
});

console.log(result.title);       // "Getting Started with TypeScript"
console.log(result.description); // "A comprehensive guide to..."
console.log(result.tags);        // ["typescript", "tutorial", "programming"]
```

## Required Environment Variables

Set these in your `.env` file:

```env
# Required - Mux API credentials
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret

# Required for signed playback IDs only
MUX_SIGNING_KEY=your_signing_key_id
MUX_PRIVATE_KEY=your_base64_encoded_private_key

# AI Provider keys (only need the ones you use)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# S3 Storage (for translation workflows with uploadToMux=true)
S3_ENDPOINT=https://your-s3-endpoint.com
S3_REGION=auto
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
```

## Available Workflows

### 1. Video Summarization - `getSummaryAndTags`

Generate SEO-friendly titles, descriptions, and tags:

```typescript
import { getSummaryAndTags } from "@mux/ai/workflows";

const result = await getSummaryAndTags("asset-id", {
  provider: "openai",       // or "anthropic", "google"
  tone: "professional",     // or "neutral", "playful"
  includeTranscript: true
});

// Returns: { title, description, tags, ... }
```

**Providers**: OpenAI, Anthropic, Google
**Requirements**: Video asset (captions optional but recommended)

### 2. Content Moderation - `getModerationScores`

Detect inappropriate (sexual/violent) content:

```typescript
import { getModerationScores } from "@mux/ai/workflows";

const result = await getModerationScores("asset-id", {
  provider: "openai",  // or "hive"
  thresholds: { sexual: 0.7, violence: 0.8 }
});

if (result.exceedsThreshold) {
  console.log("Content flagged:", result.maxScores);
}
```

**Providers**: OpenAI, Hive
**Requirements**: Video asset

### 3. Burned-in Caption Detection - `hasBurnedInCaptions`

Detect hardcoded subtitles in videos:

```typescript
import { hasBurnedInCaptions } from "@mux/ai/workflows";

const result = await hasBurnedInCaptions("asset-id", {
  provider: "openai"  // or "anthropic", "google"
});

console.log(result.hasBurnedInCaptions);  // true/false
console.log(result.confidence);            // 0-1
```

**Providers**: OpenAI, Anthropic, Google
**Requirements**: Video asset

### 4. Chapter Generation - `generateChapters`

Create automatic chapter markers:

```typescript
import { generateChapters } from "@mux/ai/workflows";

const result = await generateChapters("asset-id", "en", {
  provider: "anthropic"
});

// Use with Mux Player
player.addChapters(result.chapters);
// [{ startTime: 0, title: "Introduction" }, ...]
```

**Providers**: OpenAI, Anthropic, Google
**Requirements**: Video + Captions (required)

### 5. Video Embeddings - `generateVideoEmbeddings`

Generate vector embeddings for semantic search:

```typescript
import { generateVideoEmbeddings } from "@mux/ai/workflows";

const result = await generateVideoEmbeddings("asset-id", {
  provider: "openai",
  languageCode: "en",
  chunkingStrategy: {
    type: "token",
    maxTokens: 500,
    overlap: 100
  }
});

// Store in vector database
for (const chunk of result.chunks) {
  await vectorDB.insert({
    embedding: chunk.embedding,
    metadata: {
      assetId: result.assetId,
      startTime: chunk.metadata.startTime,
      endTime: chunk.metadata.endTime
    }
  });
}
```

**Providers**: OpenAI, Google
**Requirements**: Video + Captions (required)

### 6. Caption Translation - `translateCaptions`

Translate captions to different languages:

```typescript
import { translateCaptions } from "@mux/ai/workflows";

const result = await translateCaptions("asset-id", "en", "es", {
  provider: "openai",
  uploadToMux: true  // Requires S3 credentials
});

// Returns translated VTT and optionally uploads to Mux
```

**Providers**: OpenAI, Anthropic, Google
**Requirements**: Video + Captions + S3 (if uploadToMux=true)

### 7. Audio Dubbing - `translateAudio`

Create AI-dubbed audio tracks:

```typescript
import { translateAudio } from "@mux/ai/workflows";

const result = await translateAudio("asset-id", "es", {
  uploadToMux: true
});
```

**Providers**: ElevenLabs only
**Requirements**: Video + Audio + S3 (if uploadToMux=true)

## Primitives (Low-Level Building Blocks)

For custom workflows, use primitives:

```typescript
import { 
  fetchTranscriptForAsset,
  getStoryboardUrl,
  chunkVTTCues
} from "@mux/ai/primitives";

// Fetch transcript
const transcript = await fetchTranscriptForAsset("asset-id", "en");

// Get storyboard URL for visual analysis
const storyboard = getStoryboardUrl("playback-id", { width: 640 });

// Chunk transcript for processing
const chunks = chunkVTTCues(transcript.cues, { 
  maxTokens: 500, 
  overlap: 100 
});
```

## Provider Selection Guide

| Use Case | Recommended Provider |
|----------|---------------------|
| Cost-effective summarization | OpenAI (gpt-4.1) |
| High-quality chapters | Anthropic (claude-sonnet-4-5) |
| Fast moderation | OpenAI omni-moderation |
| Embeddings | OpenAI text-embedding-3-small |
| Audio dubbing | ElevenLabs (only option) |

## Important Notes

1. **Transcripts Matter**: Enable [auto-generated captions](https://www.mux.com/docs/guides/add-autogenerated-captions-and-use-transcripts) on Mux assets for best results with transcript-based workflows.

2. **Signed Playback**: If assets use signed playback URLs, provide `MUX_SIGNING_KEY` and `MUX_PRIVATE_KEY`.

3. **Cost Control**: Workflows use cost-effective models by default (gpt-4.1, claude-sonnet-4-5, gemini-2.0-flash).

4. **TypeScript Types**: Full TypeScript support with comprehensive types for IDE autocomplete.

## Example: Complete Workflow Script

See [scripts/analyze-video.ts](scripts/analyze-video.ts) for a complete example.

## More Documentation

- [Workflows Guide](WORKFLOWS.md) - Detailed workflow documentation
- [API Reference](https://github.com/muxinc/ai/blob/main/docs/API.md)
- [Mux AI SDK GitHub](https://github.com/muxinc/ai)

