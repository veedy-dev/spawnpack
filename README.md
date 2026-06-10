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
- Optional Rockide recommendation during setup
- Optional AI setup:
  - `CLAUDE.md` for Claude
  - `AGENTS.md` for Other
  - `.mcp.json`

## Runtime Requirement

Spawnpack is published on npm, but it runs on **Bun**.

Install Bun first:
- https://bun.sh/

## Install

### Global install with Bun

```bash
bun add -g spawnpack
```

### Global install with npm

```bash
npm i -g spawnpack
```

### One-off run with Bun

```bash
bunx spawnpack
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

Show the installed version:

```bash
spawnpack -v
spawnpack --version
```

The wizard walks through:

1. Project name and author
2. Marketplace add-on structure toggle
3. Destination folder
4. Script API setup
5. Publisher ID and Project ID when needed
6. Script packages
7. `rgl` toggle
8. Rockide toggle
9. AI setup choice (`None`, `Claude`, or `Other`)
10. Review screen and generation

## Generated project options

Depending on your choices, Spawnpack can generate:

- `packs/BP`
- `packs/RP`
- `data/scripts/main.ts`
- `packs/BP/scripts/<publisher-id>/<project-id>/main.js`
- `package.json`
- `tsconfig.json`
- `dprint.json`
- `config.json` for `rgl`
- `CLAUDE.md`
- `AGENTS.md`
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

Spawnpack fetches the latest stable npm versions for:

- `@minecraft/server`
- `@minecraft/server-ui`
- `@minecraft/vanilla-data`
- `@minecraft/math`

If version lookup fails, it falls back to baked stable defaults.

Only runtime Script API modules, currently `@minecraft/server` and `@minecraft/server-ui`, are written to the behavior pack manifest. npm-side libraries such as `@minecraft/vanilla-data` and `@minecraft/math` stay in the generated `package.json` for imports and bundling.

## Development

```bash
bun install
bun run typecheck
bun run build
```

## Publish notes

The npm package is configured to publish only:

- `dist/spawnpack.js`
- `templates/CLAUDE.md`
- `templates/AGENTS.md`
- `README.md`
- `LICENSE`
- `package.json`

Internal planning files and local AI/project notes are excluded from the published tarball.
