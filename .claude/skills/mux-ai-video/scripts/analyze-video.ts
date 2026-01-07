#!/usr/bin/env npx tsx
/// <reference types="node" />
/**
 * Mux AI Video Analysis Script
 * 
 * Analyzes a Mux video asset using the @mux/ai SDK workflows.
 * 
 * Usage:
 *   npx tsx analyze-video.ts <asset-id> [options]
 * 
 * Options:
 *   --provider <openai|anthropic|google>  AI provider (default: openai)
 *   --summarize                           Generate summary and tags
 *   --chapters                            Generate chapters
 *   --moderate                            Run content moderation
 *   --all                                 Run all analyses
 * 
 * Example:
 *   npx tsx analyze-video.ts abc123 --all --provider anthropic
 */

import "dotenv/config";
import { 
  getSummaryAndTags, 
  getModerationScores,
  generateChapters 
} from "@mux/ai/workflows";

type Provider = "openai" | "anthropic" | "google";

interface AnalysisOptions {
  assetId: string;
  provider: Provider;
  summarize: boolean;
  chapters: boolean;
  moderate: boolean;
}

function parseArgs(): AnalysisOptions {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0].startsWith("--")) {
    console.error("Usage: npx tsx analyze-video.ts <asset-id> [options]");
    console.error("\nOptions:");
    console.error("  --provider <openai|anthropic|google>  AI provider (default: openai)");
    console.error("  --summarize                           Generate summary and tags");
    console.error("  --chapters                            Generate chapters");
    console.error("  --moderate                            Run content moderation");
    console.error("  --all                                 Run all analyses");
    process.exit(1);
  }

  const assetId = args[0];
  const hasAll = args.includes("--all");
  
  let provider: Provider = "openai";
  const providerIdx = args.indexOf("--provider");
  if (providerIdx !== -1 && args[providerIdx + 1]) {
    provider = args[providerIdx + 1] as Provider;
  }

  return {
    assetId,
    provider,
    summarize: hasAll || args.includes("--summarize"),
    chapters: hasAll || args.includes("--chapters"),
    moderate: hasAll || args.includes("--moderate"),
  };
}

async function analyzeSummary(assetId: string, provider: Provider) {
  console.log("\n📝 Generating Summary and Tags...\n");
  
  const result = await getSummaryAndTags(assetId, {
    provider,
    tone: "professional",
    includeTranscript: true,
  });

  console.log(`Title: ${result.title}`);
  console.log(`\nDescription:\n${result.description}`);
  console.log(`\nTags: ${result.tags.join(", ")}`);
  console.log(`\nAsset ID: ${result.assetId}`);
  
  return result;
}

async function analyzeChapters(assetId: string, provider: Provider) {
  console.log("\n📑 Generating Chapters...\n");
  
  const result = await generateChapters(assetId, "en", {
    provider,
  });

  console.log("Chapters:");
  for (const chapter of result.chapters) {
    const startMin = Math.floor(chapter.startTime / 60);
    const startSec = Math.floor(chapter.startTime % 60);
    const timestamp = `${startMin}:${startSec.toString().padStart(2, "0")}`;
    console.log(`  ${timestamp} - ${chapter.title}`);
  }
  console.log(`\nLanguage: ${result.languageCode}`);
  
  return result;
}

async function analyzeModeration(assetId: string) {
  console.log("\n🛡️ Running Content Moderation...\n");
  
  const result = await getModerationScores(assetId, {
    provider: "openai",
    thresholds: {
      sexual: 0.5,
      violence: 0.5
    }
  });

  const status = result.exceedsThreshold ? "⚠️ FLAGGED" : "✅ PASSED";
  console.log(`Status: ${status}`);
  console.log(`Max Sexual Score: ${(result.maxScores.sexual * 100).toFixed(1)}%`);
  console.log(`Max Violence Score: ${(result.maxScores.violence * 100).toFixed(1)}%`);
  
  if (result.exceedsThreshold) {
    console.log("\n⚠️ This content may require manual review.");
  }
  
  return result;
}

async function main() {
  const options = parseArgs();
  
  console.log("═".repeat(60));
  console.log("🎬 Mux AI Video Analysis");
  console.log("═".repeat(60));
  console.log(`Asset ID: ${options.assetId}`);
  console.log(`Provider: ${options.provider}`);

  // Check required env vars
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    console.error("\n❌ Error: MUX_TOKEN_ID and MUX_TOKEN_SECRET are required");
    process.exit(1);
  }

  const analyses: Promise<unknown>[] = [];
  
  if (options.summarize) {
    analyses.push(analyzeSummary(options.assetId, options.provider));
  }
  
  if (options.chapters) {
    analyses.push(analyzeChapters(options.assetId, options.provider));
  }
  
  if (options.moderate) {
    analyses.push(analyzeModeration(options.assetId));
  }

  if (analyses.length === 0) {
    console.log("\nNo analysis selected. Use --summarize, --chapters, --moderate, or --all");
    process.exit(1);
  }

  try {
    await Promise.all(analyses);
    console.log("\n" + "═".repeat(60));
    console.log("✅ Analysis complete!");
    console.log("═".repeat(60));
  } catch (error) {
    console.error("\n❌ Analysis failed:", error);
    process.exit(1);
  }
}

main();
