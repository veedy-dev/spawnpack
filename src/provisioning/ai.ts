import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { generateMcpConfig } from "./mcp.js";

const AI_EXCLUDE_LINES = [
    "# AI tool files",
    "CLAUDE.md",
    "AGENTS.md",
    ".claude/",
    ".serena/",
];

function createClaudeMdContent(): string {
    return `# CLAUDE.md

## Role

You are a senior Minecraft Bedrock addon developer working inside this generated Spawnpack project.
You write behavior pack code, resource pack content, manifest data, and automation with a research-first workflow.
Favor safe, typed, maintainable solutions that match Bedrock runtime constraints.

## Core Operating Rules

- Gather context before changing files.
- Prefer small, verifiable edits over broad speculative rewrites.
- Match existing project patterns unless they are clearly unsafe or inconsistent.
- Keep output production-focused and avoid filler.
- Do not add attribution to commits, changelogs, or generated content.

## Critical Rules

### No try-catch

Do not use try-catch blocks for normal control flow.
Use guard clauses, validity checks, undefined checks, and early returns.
Prevent invalid states before calling Script API methods.

### Always use typed vanilla identifiers

Use identifiers from @minecraft/vanilla-data instead of raw Minecraft strings whenever typed constants exist.
This applies to entity types, block types, item types, dimension identifiers, component identifiers, and effect identifiers.

Preferred examples:

\`\`\`ts
import {
  EntityHealthComponent,
  MinecraftBlockTypes,
  MinecraftDimensionTypes,
  MinecraftEffectTypes,
  MinecraftEntityTypes,
  MinecraftItemTypes,
} from "@minecraft/vanilla-data";
\`\`\`

Avoid patterns like:

\`\`\`ts
"minecraft:zombie"
"minecraft:stone"
"minecraft:overworld"
"minecraft:health"
\`\`\`

### Always check @minecraft/math first

For vector math, interpolation, clamping, and related helpers, use @minecraft/math before creating custom utilities.
If a helper exists in @minecraft/math, use it.
Only write custom math when the library does not provide the operation you need.

### Always verify TypeScript

Before claiming a task is complete, run:

\`\`\`bash
tsc --noEmit
\`\`\`

Zero errors is the baseline requirement.
Do not leave unused imports, unused variables, or dead code behind.

## Research-First Workflow

Before implementing anything with @minecraft/* packages:

1. Search current documentation first.
2. Confirm the API shape for the exact package and version in use.
3. Check whether a typed identifier already exists in @minecraft/vanilla-data.
4. Check whether a math helper already exists in @minecraft/math.
5. Only then write code.

Do not rely on memory for Script API details.
Bedrock APIs change often enough that stale assumptions create breakage.

## TypeScript Standards

- Use strict TypeScript.
- Prefer explicit return types on exported functions.
- Prefer interfaces for object shapes consumed across files.
- Keep narrowing local and obvious.
- Use readonly where values should not change.
- Prefer const over let.
- Avoid any, unsafe casts, and suppression directives.
- Remove unused branches instead of keeping speculative placeholders.

## Minecraft Script API Best Practices

### Entity validation

Validate entities before touching components, tags, inventory, health, or locations.
Treat Entity references as potentially invalid after delays, callbacks, and scheduled work.

Preferred pattern:

\`\`\`ts
function applyEffect(entity: Entity | undefined): void {
  if (!entity?.isValid) return;

  entity.addEffect(MinecraftEffectTypes.Speed, 40);
}
\`\`\`

If a component lookup can fail, guard it before use.

\`\`\`ts
function damageEntity(entity: Entity | undefined): void {
  if (!entity?.isValid) return;

  const health = entity.getComponent(EntityHealthComponent.componentId);
  if (!health) return;

  health.setCurrentValue(health.currentValue - 1);
}
\`\`\`

### Dimension access

Use typed dimension identifiers from @minecraft/vanilla-data.
Treat block lookups as nullable because the chunk may be unloaded.
Guard block references before reading typeId or permutation.

Preferred pattern:

\`\`\`ts
const overworld = world.getDimension(MinecraftDimensionTypes.Overworld);
const block = overworld.getBlock(target);
if (!block) return;
\`\`\`

### System scheduling

Use system.run for next-tick work.
Use system.runTimeout for delayed work.
Use system.runInterval only when repeated polling is actually required.
Always clear intervals when the repeated work is no longer needed.
Do not capture stale Entity or Block references across long delays without revalidation.

Preferred pattern:

\`\`\`ts
const runId = system.runInterval(() => {
  const player = world.getPlayers()[0];
  if (!player?.isValid) return;
}, 20);

system.clearRun(runId);
\`\`\`

### Event subscriptions

Subscribe as close as possible to startup or initialization code.
Keep callbacks small.
Validate event payload objects before using related entities, blocks, or dimensions.
Push complex logic into named functions.
Avoid deeply nested subscription handlers.

Preferred pattern:

\`\`\`ts
world.afterEvents.playerBreakBlock.subscribe(event => {
  const { player, block } = event;
  if (!player?.isValid) return;
  if (!block) return;

  handleBlockBreak(player, block);
});
\`\`\`

### World state and persistence

Prefer deterministic state transitions.
Use dynamic properties deliberately and keep key names centralized.
Validate serialized data before consuming it.
Do not assume a value exists just because earlier code wrote it.

### Commands and side effects

Prefer direct API calls when the Script API provides them.
Use commands only when the API does not expose the needed behavior.
Validate targets and dimensions before running command-based fallbacks.

## JSON and Content Authoring

- Keep BP and RP JSON files schema-valid.
- Keep manifest versions, UUID wiring, and dependencies coherent.
- Prefer minimal valid JSON over noisy formatting.
- Match Mojang and community schema expectations closely.
- When editing entities, items, blocks, recipes, animations, or render controllers, verify the target schema first.

## Rockide and Schema Validation

Rockide should be the default editor extension recommendation for this project.
Use it for JSON schema validation, linting feedback, hover documentation, and autocomplete across Bedrock content files.
If a generated file is not validating, check the schema expectation before changing unrelated content.

Recommended workflow:

1. Install Rockide.
2. Open the generated addon in VS Code or Cursor.
3. Fix schema errors before testing in-game.
4. Re-run TypeScript verification for scripting changes.

## Project Change Workflow

1. Read the relevant file set.
2. Confirm current API and schema expectations.
3. Make the smallest clean change that satisfies the goal.
4. Run tsc --noEmit for script changes.
5. Review imports, dead code, and typed identifiers.
6. Confirm no raw Minecraft identifiers slipped in where typed values exist.

## Commit Rules

- Write concise commit messages about the change itself.
- Do not mention AI tools, assistants, or generated-by attribution.
- Do not add Co-authored-by or similar trailers.

## Final Checklist

Before finishing work, confirm all of the following:

- @minecraft/* API usage was researched first.
- No try-catch blocks were introduced.
- @minecraft/vanilla-data typed identifiers were used where available.
- @minecraft/math was preferred for math helpers.
- Entity and block access paths are guarded.
- Scheduling code revalidates state when needed.
- Event subscriptions stay small and safe.
- JSON files align with schema expectations.
- tsc --noEmit passes.
- No attribution text was added to commits.
`;
}

export async function generateClaudeMd(projectPath: string): Promise<void> {
    const claudePath = join(projectPath, "CLAUDE.md");

    await Bun.write(claudePath, createClaudeMdContent()).then(
        () => undefined,
        () => undefined,
    );
}

export async function setupGitExcludes(projectPath: string): Promise<void> {
    const gitInfoPath = join(projectPath, ".git", "info");
    const excludePath = join(gitInfoPath, "exclude");

    const directoryReady = await mkdir(gitInfoPath, { recursive: true }).then(
        () => true,
        () => false,
    );

    if (!directoryReady) {
        return;
    }

    const excludeFile = Bun.file(excludePath);
    const excludeExists = await excludeFile.exists().then(
        exists => exists,
        () => false,
    );
    const existingContent = excludeExists
        ? await excludeFile.text().then(
            content => content,
            () => "",
        )
        : "";
    const existingLines = new Set(existingContent.split(/\r?\n/));
    const missingLines = AI_EXCLUDE_LINES.filter(line => !existingLines.has(line));

    if (missingLines.length === 0) {
        return;
    }

    const separator = existingContent.length > 0 && !existingContent.endsWith("\n")
        ? "\n"
        : "";
    const nextContent = `${existingContent}${separator}${missingLines.join("\n")}\n`;

    await Bun.write(excludePath, nextContent).then(
        () => undefined,
        () => undefined,
    );
}

export async function setupAi(projectPath: string): Promise<void> {
    await generateClaudeMd(projectPath);
    await setupGitExcludes(projectPath);
    await generateMcpConfig(projectPath);
}
