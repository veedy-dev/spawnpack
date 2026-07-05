import type { MinecraftDependencyVersions, ProjectConfig } from "../config.js";
import { VERSIONS, getAiDocFilename, getScriptEntryPath } from "../config.js";

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

        scripts.typecheck = config.useRgl
            ? "tsc --project data/scripts/tsconfig.json --noEmit"
            : "tsc --project tsconfig.json --noEmit";
        scripts.format = "dprint fmt";
    }

    if (config.scripting === "javascript") {
        scripts.check = "bun --smol packs/BP/scripts";
    }

    const packageJson: Record<string, unknown> = {
        name: `${config.identifier}-${config.projectId}`,
        version: PACK_VERSION,
        private: true,
        ...(config.useRgl ? { workspaces: ["./filters/*"] } : {}),
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
        $schema: "https://raw.githubusercontent.com/ink0rr/rgl-schemas/main/config/v1.1.json",
        author: config.author,
        name: config.projectName,
        packs: {
            behaviorPack: "./packs/BP",
            resourcePack: "./packs/RP",
        },
        regolith: {
            dataPath: "./data",
            filterDefinitions: {
                typegen: {
                    runWith: "nodejs",
                    script: "./filters/typegen/main.js",
                },
                rolldown: {
                    runWith: "nodejs",
                    script: "./filters/rolldown/main.js",
                },
            },
            profiles: {
                default: {
                    export: { target: "development" },
                    filters: [
                        { filter: "typegen" },
                        { filter: "rolldown" },
                    ],
                },
                build: {
                    export: { target: "local" },
                    filters: [
                        { filter: "typegen" },
                        { filter: "rolldown", arguments: ["--prod"] },
                    ],
                },
                preview: {
                    export: { target: "development" },
                    filters: [
                        { profile: "build" },
                    ],
                },
            },
        },
    };
}

function getRolldownExternalModules(config: ProjectConfig): string[] {
    return ["@minecraft/server", ...(config.scriptPackages.serverUi ? ["@minecraft/server-ui"] : [])];
}

export function generateRolldownFilterMain(config: ProjectConfig): string {
    const external = getRolldownExternalModules(config).map(moduleName => JSON.stringify(moduleName)).join(", ");
    const outfile = `./BP/${getScriptEntryPath(config)}`;

    return `import { build, defineConfig } from "rolldown";

const arg = process.argv[2];

const config = defineConfig({
\texternal: [${external}],
\tinput: "./data/scripts/main.ts",
\toutput: {
\t\tformat: "esm",
\t\tfile: ${JSON.stringify(outfile)},
\t\tsourcemap: true,
\t},
\ttsconfig: "./data/scripts/tsconfig.json",
});

if (arg === "--prod") {
\tconfig.output.minify = true;
\tconfig.output.sourcemap = false;
\tconfig.transform = {
\t\tdropLabels: ["DEBUG"],
\t};
}

await build(config);
`;
}

export function generateRolldownFilterPackageJson(): Record<string, unknown> {
    return {
        name: "rolldown-filter",
        private: true,
        type: "module",
        dependencies: {
            rolldown: VERSIONS.rolldown,
        },
    };
}

export function generateTypegenFilterPackageJson(): Record<string, unknown> {
    return {
        name: "typegen",
        private: true,
        type: "module",
        dependencies: {
            "es-toolkit": VERSIONS.esToolkit,
            "jsonc-parser": VERSIONS.jsoncParser,
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

export function generateScriptsTsConfig(): Record<string, unknown> {
    return {
        compilerOptions: {
            lib: [
                "ES2015",
                "ES2016.Array.Include",
                "ES2017.ArrayBuffer",
                "ES2017.Date",
                "ES2017.Object",
                "ES2017.String",
                "ES2017.TypedArrays",
                "ES2018.AsyncIterable",
                "ES2018.AsyncGenerator",
                "ES2018.Promise",
                "ES2018.Regexp",
                "ES2019.Array",
                "ES2019.Object",
                "ES2019.String",
                "ES2019.Symbol",
                "ES2020.BigInt",
                "ES2020.Date",
                "ES2020.Number",
                "ES2015.Promise",
                "ES2020.String",
                "ES2020.Promise",
                "ES2020.Symbol.WellKnown",
                "ES2021.Promise",
                "ES2021.String",
                "ES2022.Array",
                "ES2022.Error",
                "ES2022.Object",
                "ES2022.RegExp",
                "ES2022.String",
                "ES2023.Array",
                "ES2023.Collection",
                "ES2024.ArrayBuffer",
                "ES2024.Collection",
                "ES2024.Object",
                "ES2024.Promise",
                "ES2024.Regexp",
                "ES2024.String",
            ],
            target: "es2024",
            module: "es2022",
            moduleDetection: "force",
            allowJs: true,
            moduleResolution: "bundler",
            noEmit: true,
            strict: true,
            skipLibCheck: true,
            noFallthroughCasesInSwitch: true,
            noImplicitOverride: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            paths: { "~/*": ["./*"] },
        },
    };
}

export function generateGitignore(config: ProjectConfig): string {
    const lines = ["node_modules/", "dist/", ".logs/", "*.zip"];

    if (config.useRgl) {
        lines.push("/.regolith", "/build");
    }

    if (config.useRgl && config.scripting === "typescript") {
        lines.push("data/scripts/generated_types.ts");
    }

    return `${lines.join("\n")}\n`;
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
    const aiDocFilename = getAiDocFilename(config.aiSetup);
    const ponytailAiLine = config.installPonytail
        ? config.aiSetup === "other"
            ? "Ponytail is enabled via `opencode.json`.\n\n"
            : "To enable ponytail in Claude Code, run `/plugin marketplace add DietrichGebert/ponytail` then `/plugin install ponytail@ponytail`.\n\n"
        : "";
    const aiSection = aiDocFilename !== null
        ? `## AI Tooling\n\nSpawnpack generated \`${aiDocFilename}\` and \`.mcp.json\` for AI-assisted development. The configured MCP servers work out of the box — no API keys required.\n\nExa's hosted MCP runs on a rate-limited free tier. If you need higher limits, you can add your own Exa API key to \`.mcp.json\` (optional): https://dashboard.exa.ai/api-keys\n\n${ponytailAiLine}`
        : "";
    const scriptPackageSection = config.scripting !== "none"
        ? `## Script Packages\n\nSelected npm packages are installed through \`package.json\`. Only runtime Script API modules such as \`@minecraft/server\` and \`@minecraft/server-ui\` are written to \`packs/BP/manifest.json\`; npm-side libraries such as \`@minecraft/vanilla-data\` and \`@minecraft/math\` are imported and bundled from \`package.json\`.\n\n`
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

${scriptPackageSection}${config.useRgl
        ? `## rgl Workflow

- \`rgl watch\` rebuilds your scripts and exports your add-on while you work.
- \`rgl run\` builds a development export once.
- \`rgl run build\` creates a production-ready build.
- \`typegen\` auto-generates typed custom IDs (\`BlockId\`/\`EntityId\`/\`ItemId\`) into \`data/scripts/generated_types.ts\` on each build.

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
