# Mux AI Workflows - Detailed Reference

This document provides in-depth documentation for each workflow in the @mux/ai SDK.

## Table of Contents

1. [getSummaryAndTags](#getsummaryandtags)
2. [getModerationScores](#getmoderationscores)
3. [hasBurnedInCaptions](#hasburnedincaptions)
4. [generateChapters](#generatechapters)
5. [generateVideoEmbeddings](#generatevideoembeddings)
6. [translateCaptions](#translatecaptions)
7. [translateAudio](#translateaudio)

---

## getSummaryAndTags

Generate SEO-optimized titles, descriptions, and tags from video content.

### Function Signature

```typescript
async function getSummaryAndTags(
  assetId: string,
  options?: {
    provider?: "openai" | "anthropic" | "google";
    model?: string;
    tone?: "neutral" | "playful" | "professional";
    includeTranscript?: boolean;
    maxTags?: number;
    languageCode?: string;
  }
): Promise<{
  title: string;
  description: string;
  tags: string[];
  provider: string;
  model: string;
}>
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `assetId` | string | required | Mux asset ID |
| `provider` | string | "openai" | AI provider to use |
| `model` | string | provider default | Override the model |
| `tone` | string | "neutral" | Writing style |
| `includeTranscript` | boolean | true | Include transcript in analysis |
| `maxTags` | number | 10 | Maximum number of tags |
| `languageCode` | string | "en" | Caption language code |

### Example

```typescript
import { getSummaryAndTags } from "@mux/ai/workflows";

const result = await getSummaryAndTags("asset-abc123", {
  provider: "anthropic",
  tone: "professional",
  includeTranscript: true,
  maxTags: 5
});

console.log(`Title: ${result.title}`);
console.log(`Description: ${result.description}`);
console.log(`Tags: ${result.tags.join(", ")}`);
```

---

## getModerationScores

Detect potentially inappropriate content (sexual, violent) in video frames.

### Function Signature

```typescript
async function getModerationScores(
  assetId: string,
  options?: {
    provider?: "openai" | "hive";
    thresholds?: {
      sexual?: number;
      violence?: number;
    };
    sampleRate?: number;
  }
): Promise<{
  exceedsThreshold: boolean;
  maxScores: {
    sexual: number;
    violence: number;
  };
  frameScores: Array<{
    timestamp: number;
    scores: { sexual: number; violence: number };
  }>;
}>
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `assetId` | string | required | Mux asset ID |
| `provider` | string | "openai" | Moderation provider |
| `thresholds.sexual` | number | 0.5 | Sexual content threshold |
| `thresholds.violence` | number | 0.5 | Violence threshold |
| `sampleRate` | number | 1 | Frames per second to analyze |

### Example

```typescript
import { getModerationScores } from "@mux/ai/workflows";

const result = await getModerationScores("asset-abc123", {
  provider: "openai",
  thresholds: {
    sexual: 0.7,
    violence: 0.8
  }
});

if (result.exceedsThreshold) {
  console.log("⚠️ Content flagged for review");
  console.log(`Max sexual score: ${result.maxScores.sexual}`);
  console.log(`Max violence score: ${result.maxScores.violence}`);
}
```

---

## hasBurnedInCaptions

Detect if a video has hardcoded/burned-in subtitles.

### Function Signature

```typescript
async function hasBurnedInCaptions(
  assetId: string,
  options?: {
    provider?: "openai" | "anthropic" | "google";
    model?: string;
    sampleFrames?: number;
  }
): Promise<{
  hasBurnedInCaptions: boolean;
  confidence: number;
  reasoning: string;
}>
```

### Example

```typescript
import { hasBurnedInCaptions } from "@mux/ai/workflows";

const result = await hasBurnedInCaptions("asset-abc123", {
  provider: "openai",
  sampleFrames: 5
});

if (result.hasBurnedInCaptions) {
  console.log(`Burned-in captions detected (confidence: ${result.confidence})`);
  console.log(`Reason: ${result.reasoning}`);
}
```

---

## generateChapters

Automatically generate chapter markers from video transcript.

### Function Signature

```typescript
async function generateChapters(
  assetId: string,
  languageCode: string,
  options?: {
    provider?: "openai" | "anthropic" | "google";
    model?: string;
    minChapterDuration?: number;
    maxChapters?: number;
  }
): Promise<{
  chapters: Array<{
    startTime: number;
    endTime: number;
    title: string;
  }>;
  provider: string;
  model: string;
}>
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `assetId` | string | required | Mux asset ID |
| `languageCode` | string | required | Transcript language (e.g., "en") |
| `provider` | string | "openai" | AI provider |
| `minChapterDuration` | number | 30 | Min seconds per chapter |
| `maxChapters` | number | 20 | Maximum chapters |

### Example

```typescript
import { generateChapters } from "@mux/ai/workflows";

const result = await generateChapters("asset-abc123", "en", {
  provider: "anthropic",
  minChapterDuration: 60,
  maxChapters: 10
});

for (const chapter of result.chapters) {
  const startMin = Math.floor(chapter.startTime / 60);
  const startSec = Math.floor(chapter.startTime % 60);
  console.log(`${startMin}:${startSec.toString().padStart(2, "0")} - ${chapter.title}`);
}
```

---

## generateVideoEmbeddings

Generate vector embeddings for semantic video search.

### Function Signature

```typescript
async function generateVideoEmbeddings(
  assetId: string,
  options?: {
    provider?: "openai" | "google";
    model?: string;
    languageCode?: string;
    chunkingStrategy?: {
      type: "token" | "sentence" | "time";
      maxTokens?: number;
      overlap?: number;
      maxSeconds?: number;
    };
  }
): Promise<{
  assetId: string;
  chunks: Array<{
    text: string;
    embedding: number[];
    metadata: {
      startTime: number;
      endTime: number;
      tokenCount: number;
    };
  }>;
}>
```

### Example

```typescript
import { generateVideoEmbeddings } from "@mux/ai/workflows";

const result = await generateVideoEmbeddings("asset-abc123", {
  provider: "openai",
  languageCode: "en",
  chunkingStrategy: {
    type: "token",
    maxTokens: 500,
    overlap: 100
  }
});

// Store in your vector database
for (const chunk of result.chunks) {
  await vectorDB.upsert({
    id: `${result.assetId}-${chunk.metadata.startTime}`,
    values: chunk.embedding,
    metadata: {
      text: chunk.text,
      assetId: result.assetId,
      startTime: chunk.metadata.startTime,
      endTime: chunk.metadata.endTime
    }
  });
}
```

---

## translateCaptions

Translate video captions to different languages.

### Function Signature

```typescript
async function translateCaptions(
  assetId: string,
  fromLanguageCode: string,
  toLanguageCode: string,
  options?: {
    provider?: "openai" | "anthropic" | "google";
    model?: string;
    uploadToMux?: boolean;
  }
): Promise<{
  vtt: string;
  trackId?: string;  // If uploadToMux=true
  provider: string;
  model: string;
}>
```

### Example

```typescript
import { translateCaptions } from "@mux/ai/workflows";

// Translate English captions to Spanish
const result = await translateCaptions("asset-abc123", "en", "es", {
  provider: "openai",
  uploadToMux: true  // Automatically adds track to Mux asset
});

console.log("Translated VTT:", result.vtt);
if (result.trackId) {
  console.log("Added to Mux as track:", result.trackId);
}
```

**Note**: Requires S3 credentials when `uploadToMux: true`.

---

## translateAudio

Create AI-dubbed audio tracks in different languages.

### Function Signature

```typescript
async function translateAudio(
  assetId: string,
  toLanguageCode: string,
  options?: {
    uploadToMux?: boolean;
    voiceSettings?: {
      stability?: number;
      similarityBoost?: number;
    };
  }
): Promise<{
  audioUrl: string;
  trackId?: string;  // If uploadToMux=true
}>
```

### Example

```typescript
import { translateAudio } from "@mux/ai/workflows";

// Create Spanish dubbed audio
const result = await translateAudio("asset-abc123", "es", {
  uploadToMux: true
});

console.log("Dubbed audio URL:", result.audioUrl);
if (result.trackId) {
  console.log("Added to Mux as audio track:", result.trackId);
}
```

**Note**: Requires ElevenLabs API key and S3 credentials when `uploadToMux: true`.

---

## Provider Comparison

| Workflow | OpenAI | Anthropic | Google | Hive | ElevenLabs |
|----------|--------|-----------|--------|------|------------|
| getSummaryAndTags | ✅ | ✅ | ✅ | ❌ | ❌ |
| getModerationScores | ✅ | ❌ | ❌ | ✅ | ❌ |
| hasBurnedInCaptions | ✅ | ✅ | ✅ | ❌ | ❌ |
| generateChapters | ✅ | ✅ | ✅ | ❌ | ❌ |
| generateVideoEmbeddings | ✅ | ❌ | ✅ | ❌ | ❌ |
| translateCaptions | ✅ | ✅ | ✅ | ❌ | ❌ |
| translateAudio | ❌ | ❌ | ❌ | ❌ | ✅ |

## Default Models

| Provider | Default Model |
|----------|---------------|
| OpenAI | gpt-4.1 |
| Anthropic | claude-sonnet-4-5 |
| Google | gemini-2.0-flash |
| OpenAI (embeddings) | text-embedding-3-small |
| Google (embeddings) | gemini-embedding-001 |
| OpenAI (moderation) | omni-moderation-latest |

