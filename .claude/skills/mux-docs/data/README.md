This folder should contain the generated corpus file `mux-docs-corpus.json` when you choose to ship a prebuilt docs index. The file is produced by running:

```bash
MUX_DOCS_REPO_PATH=/path/to/mux.com \
npx tsx .claude/skills/mux-docs/scripts/build-docs-corpus.ts
```

If committing the corpus, record the source docs repo commit/hash for traceability and keep it refreshed via the `refresh-mux-docs-corpus` GitHub Action (see `.github/workflows/refresh-mux-docs-corpus.yml`).
