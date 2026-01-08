#!/usr/bin/env npx tsx
import fs from "node:fs";
import path from "node:path";

interface CorpusEntry {
  id: string;
  title: string;
  path: string;
  sourceUrl: string;
  order?: number;
  content: string;
}

function loadCorpus(filePath: string): CorpusEntry[] {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Corpus not found at ${filePath}`);
    console.error("Run build-docs-corpus.ts first.");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as CorpusEntry[];
}

function simpleScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let score = 0;
  for (const term of q.split(/\s+/)) {
    if (!term) continue;
    if (t.includes(term)) score += 1;
  }
  return score;
}

function search(corpus: CorpusEntry[], query: string, k = 5): CorpusEntry[] {
  const scored = corpus
    .map((entry) => ({
      entry,
      score: simpleScore(query, `${entry.title}\n${entry.content}`),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.entry);

  return scored;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: npx tsx answer-doc-question.ts \"your question\"");
    process.exit(1);
  }

  const query = args.join(" ");
  const corpusPath = process.env.MUX_DOCS_CORPUS_PATH || path.resolve(".claude/skills/mux-docs/data/mux-docs-corpus.json");
  const corpus = loadCorpus(corpusPath);

  const results = search(corpus, query, 5);
  if (results.length === 0) {
    console.log("No matches found. Try a different query.");
    process.exit(0);
  }

  console.log(`Top matches for: ${query}\n`);
  results.forEach((r, idx) => {
    console.log(`${idx + 1}. ${r.title}`);
    console.log(`   Source: ${r.sourceUrl}`);
    console.log(`   Preview: ${r.content.slice(0, 240).replace(/\s+/g, " ")}...`);
    console.log();
  });
}

main();
