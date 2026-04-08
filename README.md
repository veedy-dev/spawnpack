# Spawnpack

A modern interactive CLI tool for scaffolding Minecraft Bedrock addon projects. Built with TypeScript and Bun.

## Overview

Spawnpack generates production-ready Minecraft Bedrock addon project structures with:
- **Behavior Pack & Resource Pack** scaffold matching Marketplace guidelines
- **Script API setup** — JavaScript or TypeScript with `@minecraft/server`
- **RGL (Regolith in Rust)** build tooling integration
- **AI configuration** — CLAUDE.md and MCP server setup for AI-assisted development
- **Rockide** VSCode extension installation prompt

## Install

```bash
bun install -g spawnpack
```

Or run directly:

```bash
bun run src/index.ts
```

## Usage

```bash
spawnpack
```

The interactive wizard will guide you through:
1. Project name and author
2. Namespace and project ID
3. Scripting choice (None / JavaScript / TypeScript)
4. Optional packages (`@minecraft/server`, `@minecraft/server-ui`, `@minecraft/vanilla-data`, `@minecraft/math`)
5. RGL build tooling toggle
6. AI setup (CLAUDE.md + MCP servers)
7. Rockide VSCode extension

## Generated Structure

```
project/
├── packs/
│   ├── BP/
│   │   ├── manifest.json
│   │   ├── texts/
│   │   ├── entities/, items/, blocks/, ...
│   │   └── scripts/<namespace>/<projectId>/
│   └── RP/
│       ├── manifest.json
│       ├── texts/
│       ├── textures/, models/, sounds/, ...
├── package.json        (if scripting enabled)
├── tsconfig.json       (if TypeScript)
├── dprint.json         (if TypeScript)
├── config.json         (if RGL enabled)
├── CLAUDE.md           (if AI enabled)
└── .mcp.json           (if AI enabled)
```

## AI Setup

When AI setup is enabled, Spawnpack generates:

- **`CLAUDE.md`** — Project-specific rules and context for AI coding assistants
- **`.mcp.json`** — MCP server configuration with:
  - `exa` — Web and GitHub code search
  - `hyperbrowser` — Browser automation
  - `sequential-thinking` — Chain-of-thought reasoning
  - `serena` — LSP-based code intelligence
  - `grep_app` — GitHub repository search
  - `context7` — Library documentation lookup

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript (strict mode)
- **TUI**: `@clack/prompts`
- **Styling**: `picocolors`
