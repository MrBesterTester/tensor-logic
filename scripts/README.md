# Scripts

<!-- TOC -->

- [generate-toc.ts](#generate-tocts)
  - [Usage](#usage)
  - [Features](#features)
  - [Git Hook](#git-hook)
  - [Manual TOC Generation](#manual-toc-generation)

<!-- /TOC -->
## generate-toc.ts

Automatically generates a 3-level Table of Contents (TOC) for Markdown files.

**Note:** All scripts in this directory are written in TypeScript with strict type checking. When creating new scripts, use TypeScript and ensure they compile with `npm run build:scripts`.

### Usage

The script is written in TypeScript and must be built first:

```bash
npm run build:scripts
node scripts/dist/generate-toc.js <path-to-markdown-file>
```

Or use the TypeScript source directly with a TypeScript runner (if you have one installed):

```bash
npx tsx scripts/generate-toc.ts <path-to-markdown-file>
```

### Features

- Generates TOC for H1, H2, and H3 headings
- Automatically inserts/updates TOC between `<!-- TOC -->` and `<!-- /TOC -->` markers
- Creates anchor links using slugified heading text
- Preserves existing TOC if markers are present, otherwise inserts after first H1

### Git Hook

A pre-commit hook is installed at `.git/hooks/pre-commit` that automatically generates TOCs for all staged `.md` files before each commit.

### Manual TOC Generation

To manually generate TOC for all markdown files:

```bash
npm run build:scripts
find docs -name "*.md" -exec node scripts/dist/generate-toc.js {} \;
```

