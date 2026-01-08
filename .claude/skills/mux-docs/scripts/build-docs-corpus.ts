#!/usr/bin/env npx tsx
import fs from "node:fs";
import path from "node:path";

interface FrontmatterResult {
  data: Record<string, string | number>;
  body: string;
}

interface CorpusEntry {
  id: string;
  title: string;
  path: string;
  sourceUrl: string;
  order?: number;
  content: string;
}

const docsRepoPath = process.env.MUX_DOCS_REPO_PATH || path.resolve(process.cwd(), "../mux.com");
const docsDir = process.env.MUX_DOCS_DIR || path.join(docsRepoPath, "apps", "web", "app", "docs");
const outputPath = process.env.MUX_DOCS_OUTPUT || path.resolve(".claude/skills/mux-docs/data/mux-docs-corpus.json");
const baseUrl = process.env.MUX_DOCS_BASE_URL || "https://docs.mux.com";

if (!fs.existsSync(docsDir)) {
  console.error(`❌ Docs directory not found: ${docsDir}`);
  console.error("Set MUX_DOCS_REPO_PATH to your local mux.com checkout.");
  process.exit(1);
}

function parseFrontmatter(source: string): FrontmatterResult {
  const match = source.match(/^---\s*[\r\n]([\s\S]*?)[\r\n]---\s*[\r\n]?/);
  if (!match) {
    return { data: {}, body: source };
  }

  const rawFrontmatter = match[1].trim();
  const body = source.slice(match[0].length);
  const data: Record<string, string | number> = {};

  for (const line of rawFrontmatter.split(/\r?\n/)) {
    const [key, ...rest] = line.split(":");
    if (!key || rest.length === 0) continue;
    const value = rest.join(":").trim().replace(/^['"]|['"]$/g, "");
    const maybeNumber = Number(value);
    data[key.trim()] = Number.isNaN(maybeNumber) ? value : maybeNumber;
  }

  return { data, body };
}

function stripMarkdownAndMdx(body: string): string {
  const codeBlocks: string[] = [];
  const placeholder = (index: number) => `@@CODE_BLOCK_${index}@@`;

  let working = body.replace(/```[\s\S]*?```/g, (match) => {
    const idx = codeBlocks.length;
    codeBlocks.push(match.trim());
    return placeholder(idx);
  });

  working = working
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      return !(trimmed.startsWith("import ") || trimmed.startsWith("export "));
    })
    .join("\n");

  working = working.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "");
  working = working.replace(/<[^>\n]+>/g, "");
  working = working.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
  working = working.replace(/`([^`]+)`/g, "$1");
  working = working.replace(/\*\*([^*]+)\*\*/g, "$1");
  working = working.replace(/\*([^*]+)\*/g, "$1");
  working = working.replace(/__([^_]+)__/g, "$1");
  working = working.replace(/#+\s*/g, "");
  working = working.replace(/\n{3,}/g, "\n\n");

  const restored = working.replace(/@@CODE_BLOCK_(\d+)@@/g, (_, idx) => {
    const block = codeBlocks[Number(idx)];
    return block ? `\n${block}\n` : "";
  });

  return restored
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function walkDocs(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDocs(fullPath));
    } else if (/\.mdx?$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function toSlug(relativePath: string): string {
  let slug = relativePath.replace(/\\/g, "/");
  slug = slug.replace(/\/page\.mdx?$/, "/");
  slug = slug.replace(/index\.mdx?$/, "");
  slug = slug.replace(/\.mdx?$/, "");
  if (slug.startsWith("/")) slug = slug.slice(1);
  return slug;
}

function buildCorpus(): CorpusEntry[] {
  const files = walkDocs(docsDir).sort();
  const corpus: CorpusEntry[] = [];

  files.forEach((filePath, idx) => {
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, body } = parseFrontmatter(raw);
    const content = stripMarkdownAndMdx(body);
    const relative = path.relative(docsDir, filePath);
    const slug = toSlug(relative);
    const sourceUrl = new URL(slug, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();

    corpus.push({
      id: `${idx + 1}-${slug || "root"}`,
      title: (data.title as string) || slug || relative,
      path: relative,
      sourceUrl,
      order: (data.order as number) || undefined,
      content,
    });
  });

  corpus.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
      return (a.order as number) - (b.order as number);
    }
    return a.path.localeCompare(b.path);
  });

  return corpus;
}

function main() {
  console.log("📚 Building Mux docs corpus...");
  const corpus = buildCorpus();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(corpus, null, 2), "utf8");
  console.log(`✅ Wrote ${corpus.length} entries to ${outputPath}`);
}

main();
