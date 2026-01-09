---
name: mux-docs
description: Answer Mux documentation questions via a local, build-time corpus generated from the mux.com docs repo.
---

# Mux Docs Skill

This skill answers "how do I..." questions about Mux by retrieving text from the official mux.com documentation. It builds a plain-text corpus from the private docs repo and uses it for grounded responses.

## Quick Start

```bash
# 1) Point to your mux.com docs repo (private)
export MUX_DOCS_REPO_PATH=/path/to/mux.com

# 2) Generate the corpus (writes data/mux-docs-corpus.json)
npx tsx .claude/skills/mux-docs/scripts/build-docs-corpus.ts

# 3) Use the corpus in your Claude tool or workflows
# Inject top chunks into prompts for doc Q&A
```

## Inputs

- `MUX_DOCS_REPO_PATH` (required): Path to a local checkout of `muxinc/mux.com` (the repo containing `apps/web/app/docs`).
- `MUX_DOCS_BASE_URL` (optional): Base URL for source links (default: `https://docs.mux.com`).
- `MUX_DOCS_OUTPUT` (optional): Output path for the corpus JSON (default: `.claude/skills/mux-docs/data/mux-docs-corpus.json`).

## What the Builder Does

1. Walks `apps/web/app/docs` for `.md`/`.mdx` files.
2. Reads frontmatter (title/order if present) and strips imports/JSX.
3. Preserves code blocks, flattens Markdown to text, and drops raw HTML.
4. Emits ordered entries with relative path, slug-based source URL, title, and cleaned content.

## Using the Corpus

- Embed and index the JSON entries, then retrieve top matches for a user question and inject them into the Claude prompt with citations (`sourceUrl`).
- Keep the corpus fresh by rerunning the builder when docs change; consider pinning a repo commit for reproducibility.

## Shipping a Prebuilt Corpus

- Build locally, commit `.claude/skills/mux-docs/data/mux-docs-corpus.json`, and note the source docs commit/hash.
- Optional: enable `.github/workflows/refresh-mux-docs-corpus.yml` with secrets:
  - `CI_PUSH_TOKEN`: repo token with push rights (for committing corpus updates).
  - `MUX_DOCS_REPO_URL`: clone URL for the private mux.com repo (read-only).
- The workflow rebuilds weekly (cron) or on `workflow_dispatch`, commits changes if the corpus differs, and pushes.

## Refresh Command

```bash
MUX_DOCS_REPO_PATH=/path/to/mux.com \
MUX_DOCS_OUTPUT=.claude/skills/mux-docs/data/mux-docs-corpus.json \
npx tsx .claude/skills/mux-docs/scripts/build-docs-corpus.ts
```

## Quick Test (local search helper)

After building the corpus, you can sanity-check retrieval without embeddings:

```bash
npx tsx .claude/skills/mux-docs/scripts/answer-doc-question.ts "how to add captions"
# Uses .claude/skills/mux-docs/data/mux-docs-corpus.json by default
# Override corpus path: MUX_DOCS_CORPUS_PATH=/path/to/corpus.json
```

## Default Corpus Path for Claude Code

- Keep the corpus at `.claude/skills/mux-docs/data/mux-docs-corpus.json` so you can simply ask Mux doc questions and instruct Claude to use the “default docs corpus” without retyping the path.
- If you need a different location, set `MUX_DOCS_CORPUS_PATH` before invoking any helpers or mention the alternate path once in your system/pinned note.
