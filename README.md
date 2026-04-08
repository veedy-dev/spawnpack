# Spawnpack

Spawnpack is a Bun-powered CLI for scaffolding Minecraft Bedrock add-on projects with a guided terminal wizard.

It generates BP/RP structure, optional Script API setup, optional rgl integration, marketplace-ready namespaced content folders, and optional AI tooling files.

## Features

- Inline wizard built with `@clack/prompts`
- Behavior Pack and Resource Pack scaffold
- Scripting options: None, JavaScript, TypeScript
- Optional packages:
  - `@minecraft/server`
  - `@minecraft/server-ui`
  - `@minecraft/vanilla-data`
  - `@minecraft/math`
- Optional `rgl` setup for faster Bedrock builds
- Optional marketplace add-on structure using nested `namespace/projectId` folders in BP/RP content directories
- Optional AI setup:
  - `CLAUDE.md`
  - `.mcp.json`
- Optional Rockide recommendation during setup

## Install

### Bun

```bash
bun add -g spawnpack
```

### Run locally

```bash
bun install
bun run src/index.ts
```

## Usage

```bash
spawnpack
```

The wizard walks through:
1. Project name and author
2. Namespace, addon identifier, and project ID
3. Destination folder
4. Marketplace add-on structure toggle
5. Scripting mode
6. Script packages
7. `rgl` toggle
8. Rockide toggle
9. AI setup toggle
10. Review screen and generation

## Generated project options

Depending on your choices, Spawnpack can generate:

- `packs/BP`
- `packs/RP`
- `data/scripts/main.ts`
- `packs/BP/scripts/<namespace>/<projectId>/main.js`
- `package.json`
- `tsconfig.json`
- `dprint.json`
- `config.json` for `rgl`
- `CLAUDE.md`
- `.mcp.json`

## Marketplace structure mode

When enabled, Spawnpack creates marketplace-style nested folders under many BP/RP content directories.

Example:

```text
packs/BP/animation_controllers/publisher/sample/
packs/BP/entities/publisher/sample/
packs/RP/animation_controllers/publisher/sample/
packs/RP/textures/items/publisher/sample/
```

This helps multiple add-ons coexist more safely in the same world by reducing content path collisions.

## Script dependency versions

Spawnpack currently generates these stable package versions by default:

- `@minecraft/server` `2.6.0`
- `@minecraft/server-ui` `2.0.0`
- `@minecraft/vanilla-data` `1.26.13`
- `@minecraft/math` `2.4.0`

## Development

```bash
bun install
bun run typecheck
bun run build
```

## Publish notes

The npm package is configured to publish only:

- `dist/`
- `README.md`
- `package.json`

Internal planning files, Serena state, and local AI/project notes are excluded from the published tarball.
