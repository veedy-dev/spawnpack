import type { MinecraftDependencyVersions, ProjectConfig } from "../config.js";
import { VERSIONS, getScriptEntryPath } from "../config.js";

const PACK_VERSION = "1.0.0";

function getSelectedScriptDependencies(config: ProjectConfig, versions: MinecraftDependencyVersions): Record<string, string> {
    const dependencies: Record<string, string> = {};

    if (config.scriptPackages.server) {
        dependencies["@minecraft/server"] = versions.server;
    }

    if (config.scriptPackages.serverUi) {
        dependencies["@minecraft/server-ui"] = versions.serverUi;
    }

    if (config.scriptPackages.vanillaData) {
        dependencies["@minecraft/vanilla-data"] = versions.vanillaData;
    }

    if (config.scriptPackages.math) {
        dependencies["@minecraft/math"] = versions.math;
    }

    return dependencies;
}

export function generatePackageJson(config: ProjectConfig, versions: MinecraftDependencyVersions): Record<string, unknown> {
    const scripts: Record<string, string> = {};

    if (config.scripting === "typescript") {
        if (!config.useRgl) {
            scripts.build = "tsc --project tsconfig.json";
        }

        scripts.typecheck = "tsc --project tsconfig.json --noEmit";
        scripts.format = "dprint fmt";
    }

    if (config.scripting === "javascript") {
        scripts.check = "bun --smol packs/BP/scripts";
    }

    const packageJson: Record<string, unknown> = {
        name: `${config.identifier}-${config.projectId}`,
        version: PACK_VERSION,
        private: true,
        type: "module",
        scripts,
        dependencies: getSelectedScriptDependencies(config, versions),
    };

    if (config.scripting === "typescript") {
        packageJson.devDependencies = {
            dprint: "^0.49.1",
            typescript: "^5.7.3",
        };
    }

    return packageJson;
}

export function generateTsConfig(config: ProjectConfig): Record<string, unknown> {
    const compilerOptions: Record<string, unknown> = {
        target: "ES2020",
        module: "ES2020",
        moduleResolution: "bundler",
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        isolatedModules: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        rootDir: "data/scripts",
        types: [],
    };

    if (config.useRgl) {
        compilerOptions.noEmit = true;
    } else {
        compilerOptions.outDir = `packs/BP/${getScriptEntryPath(config).replace(/\/main\.js$/, "")}`;
    }

    return {
        compilerOptions,
        include: ["data/scripts/**/*.ts"],
    };
}

export function generateDprintConfig(): Record<string, unknown> {
    return {
        indentWidth: 4,
        lineWidth: 160,
        typescript: {
            deno: true,
            indentWidth: 4,
            lineWidth: 160,
            "module.sortImportDeclarations": "caseSensitive",
            "importDeclaration.sortNamedImports": "caseSensitive",
        },
        excludes: ["**/node_modules", "**/*-lock.json"],
        plugins: [
            "https://plugins.dprint.dev/typescript-0.95.12.wasm",
            "https://plugins.dprint.dev/json-0.21.0.wasm",
            "https://plugins.dprint.dev/markdown-0.20.0.wasm",
        ],
    };
}

export function generateRglConfig(config: ProjectConfig): Record<string, unknown> {
    return {
        $schema: "https://raw.githubusercontent.com/ink0rr/rgl-schemas/main/config/v1.0.json",
        author: config.author,
        name: config.projectName,
        packs: {
            behaviorPack: "./packs/BP",
            resourcePack: "./packs/RP",
        },
        regolith: {
            dataPath: "./data",
            filterDefinitions: {
                esbuild: {
                    url: "github.com/ink0rr/regolith-filters",
                    version: VERSIONS.esbuildFilter,
                },
            },
            profiles: {
                default: {
                    export: { target: "development" },
                    filters: [
                        {
                            filter: "esbuild",
                            settings: {
                                outfile: `./BP/${getScriptEntryPath(config)}`,
                                sourcemap: true,
                                minify: false,
                            },
                        },
                    ],
                },
                build: {
                    export: { target: "local" },
                    filters: [
                        {
                            filter: "esbuild",
                            settings: {
                                outfile: `./BP/${getScriptEntryPath(config)}`,
                                minify: true,
                            },
                        },
                    ],
                },
            },
        },
    };
}

export function generateMainTs(config: ProjectConfig): string {
    return `import { world } from "@minecraft/server";

world.afterEvents.worldLoad.subscribe(() => {
    console.warn("[${config.identifier}:${config.projectId}] Addon loaded!");
});
`;
}

export function generateMainJs(config: ProjectConfig): string {
    return `import { world } from "@minecraft/server";

world.afterEvents.worldLoad.subscribe(() => {
    console.warn("[${config.identifier}:${config.projectId}] Addon loaded!");
});
`;
}

export function generateLangFile(projectName: string, packType: "behavior" | "resource"): string {
    const suffix = packType === "behavior" ? "Behavior Pack" : "Resource Pack";

    return `pack.name=${projectName} ${suffix}
pack.description=Generated with Spawnpack
`;
}

export function generateGitignore(): string {
    return `node_modules/
dist/
.logs/
*.zip
`;
}

export function generateReadme(config: ProjectConfig): string {
    const scriptSource = config.scripting === "none"
        ? "None"
        : config.scripting === "typescript"
            ? "data/scripts/main.ts"
            : `packs/BP/${getScriptEntryPath(config)}`;
    const runtimeEntry = config.scripting === "none" ? "None" : `packs/BP/${getScriptEntryPath(config)}`;
    const installStep = config.scripting !== "none"
        ? "1. Install dependencies with `bun install` or `npm install`."
        : "1. No package install is required for this scaffold.";
    const buildSteps = config.scripting === "none"
        ? "2. Edit your BP/RP JSON files directly inside `packs/`."
        : config.useRgl
            ? "2. Run `rgl watch` while developing to rebuild and export your add-on automatically.\n3. Run `rgl run build` when you want a production build."
            : config.scripting === "typescript"
                ? "2. Write your gameplay scripts in `data/scripts/`.\n3. Run `bun run build` or `npm run build` to compile TypeScript into `packs/BP/scripts/`."
                : "2. Write your gameplay scripts in `packs/BP/scripts/` and let Minecraft copy the pack into `com.mojang`.";
    const aiSection = config.useAi
        ? `## AI Tooling\n\nSpawnpack generated \`CLAUDE.md\` and \`.mcp.json\` for AI-assisted development.\n\nAdd your own API keys before using the MCP tools:\n\n- Exa API keys: https://dashboard.exa.ai/api-keys\n- Exa API key docs: https://exa.ai/docs/reference/team-management/create-api-key\n- Browser Use API keys: https://cloud.browser-use.com/settings?tab=api-keys&new=1\n- Browser Use MCP docs: https://docs.browser-use.com/cloud/guides/mcp-server\n\nUpdate the placeholder values in \`.mcp.json\` with your own tokens.\n\n`
        : "";

    return `# ${config.projectName}

## Overview

- Behavior Pack: \`packs/BP\`
- Resource Pack: \`packs/RP\`
- Script API setup: ${config.scripting}
- Script source: ${scriptSource}
- Runtime entry: ${runtimeEntry}

## Getting Started

${installStep}
${buildSteps}

## Working with Scripts

${config.scripting === "none"
        ? "This project was generated without Script API support. Add scripting later if you need gameplay logic."
        : config.scripting === "typescript"
            ? `- Write your TypeScript entrypoint in \`data/scripts/main.ts\`.\n- Add more TypeScript files anywhere under \`data/scripts/\` and import them from \`main.ts\`.\n- rgl compiles your TypeScript from \`data/scripts/\` into \`${runtimeEntry}\`.`
            : `- Write your JavaScript entrypoint directly in \`${runtimeEntry}\`.\n- Add additional JavaScript files beside \`main.js\` and import them from there.\n- Minecraft copies the BP/RP content directly into \`com.mojang\`, so there is no TypeScript compile step.`}

${config.useRgl
        ? `## rgl Workflow

- \`rgl watch\` rebuilds your scripts and exports your add-on while you work.
- \`rgl run\` builds a development export once.
- \`rgl run build\` creates a production-ready build.

The generated \`config.json\` already points the script bundle to \`${runtimeEntry}\`.

`
        : ""}${aiSection}---

<sub>Generated with Spawnpack</sub>
`;
}

export function generateBlocksJson(): Record<string, unknown> {
    return { format_version: "1.21.40" };
}

export function generateSoundsJson(): Record<string, unknown> {
    return { entity_sounds: {} };
}

export function generateSoundDefinitions(): Record<string, unknown> {
    return { format_version: "1.14.0", sound_definitions: {} };
}

export function generateItemTexture(config: ProjectConfig): Record<string, unknown> {
    return {
        resource_pack_name: config.projectName,
        texture_name: "atlas.items",
        texture_data: {},
    };
}

export function generateTerrainTexture(config: ProjectConfig): Record<string, unknown> {
    return {
        resource_pack_name: config.projectName,
        texture_name: "atlas.terrain",
        texture_data: {},
        num_mip_levels: 4,
        padding: 8,
    };
}
