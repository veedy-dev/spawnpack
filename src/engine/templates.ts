import type { ProjectConfig } from "../config.js";
import { VERSIONS, getMarketplaceScopeLabel, getScriptEntryPath } from "../config.js";

const PACK_VERSION = "1.0.0";

function getSelectedScriptDependencies(config: ProjectConfig): Record<string, string> {
    const dependencies: Record<string, string> = {};

    if (config.scriptPackages.server) {
        dependencies["@minecraft/server"] = VERSIONS.server;
    }

    if (config.scriptPackages.serverUi) {
        dependencies["@minecraft/server-ui"] = VERSIONS.serverUi;
    }

    if (config.scriptPackages.vanillaData) {
        dependencies["@minecraft/vanilla-data"] = VERSIONS.vanillaData;
    }

    if (config.scriptPackages.math) {
        dependencies["@minecraft/math"] = VERSIONS.math;
    }

    return dependencies;
}

export function generatePackageJson(config: ProjectConfig): Record<string, unknown> {
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
        name: `${config.namespace}-${config.projectId}`,
        version: PACK_VERSION,
        private: true,
        type: "module",
        scripts,
        dependencies: getSelectedScriptDependencies(config),
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
    console.warn("[${config.namespace}:${config.identifier}] Addon loaded!");
});
`;
}

export function generateMainJs(config: ProjectConfig): string {
    return `import { world } from "@minecraft/server";

world.afterEvents.worldLoad.subscribe(() => {
    console.warn("[${config.namespace}:${config.identifier}] Addon loaded!");
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
    return `# ${config.projectName}

Generated with Spawnpack.

## Packs

- Behavior Pack: packs/BP
- Resource Pack: packs/RP
- Marketplace structure: ${config.useMarketplaceStructure ? `${getMarketplaceScopeLabel(config)} nested content folders enabled` : "Disabled"}

## Scripts

- Scripting: ${config.scripting}
- Source: ${config.scripting === "none" ? "None" : config.scripting === "typescript" ? "data/scripts/main.ts" : `packs/BP/${getScriptEntryPath(config)}`}
- Runtime entry: ${config.scripting === "none" ? "None" : `packs/BP/${getScriptEntryPath(config)}`}
`;
}

export function generateBlocksJson(): Record<string, unknown> {
    return {};
}

export function generateSoundsJson(): Record<string, unknown> {
    return {};
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
