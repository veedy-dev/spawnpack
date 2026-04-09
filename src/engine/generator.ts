import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { ProjectConfig } from "../config.js";
import { getMarketplaceScopeSegments, getScriptDirectorySegments } from "../config.js";
import { generateBpManifest, generateRpManifest } from "./manifests.js";
import { getMinecraftDependencyVersions } from "./minecraft-package-versions.js";
import {
    generateBlocksJson,
    generateDprintConfig,
    generateGitignore,
    generateItemTexture,
    generateLangFile,
    generateMainJs,
    generateMainTs,
    generatePackageJson,
    generateReadme,
    generateRglConfig,
    generateSoundDefinitions,
    generateSoundsJson,
    generateTerrainTexture,
    generateTsConfig,
} from "./templates.js";

const BP_NAMESPACED_DIRECTORIES = [
    "animation_controllers",
    "animations",
    "blocks",
    "entities",
    "items",
    "loot_tables",
    "recipes",
    "spawn_rules",
    "structures",
    "trading",
] as const;

const RP_NAMESPACED_DIRECTORIES = [
    "animation_controllers",
    "animations",
    "attachables",
    "entity",
    "fogs",
    "particles",
    "render_controllers",
    "sounds",
    "ui",
] as const;

const RP_NAMESPACED_NESTED_DIRECTORIES = [
    ["models", "entity"],
    ["textures", "blocks"],
    ["textures", "entity"],
    ["textures", "items"],
] as const;

function stringifyJson(value: unknown): string {
    return `${JSON.stringify(value, null, 4)}\n`;
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
    await writeFile(filePath, stringifyJson(value), "utf8");
}

async function writeTextFile(filePath: string, value: string): Promise<void> {
    await writeFile(filePath, value, "utf8");
}

function getScopedContentDirectory(basePath: string, folder: string, config: ProjectConfig): string {
    return join(basePath, folder, ...getMarketplaceScopeSegments(config));
}

function getScopedNestedContentDirectory(basePath: string, segments: readonly string[], config: ProjectConfig): string {
    return join(basePath, ...segments, ...getMarketplaceScopeSegments(config));
}

function shouldCreateDirectory(directory: string): boolean {
    return directory !== "." && directory !== "./" && directory !== ".\\";
}

export async function generateProject(config: ProjectConfig): Promise<void> {
    const destination = config.destination;
    const bpPath = join(destination, "packs", "BP");
    const rpPath = join(destination, "packs", "RP");
    const bpScriptPath = join(bpPath, ...getScriptDirectorySegments(config));
    const dataScriptsPath = join(destination, "data", "scripts");

    const directories = [
        destination,
        join(destination, "packs"),
        bpPath,
        join(bpPath, "animation_controllers"),
        join(bpPath, "animations"),
        join(bpPath, "blocks"),
        join(bpPath, "entities"),
        join(bpPath, "items"),
        join(bpPath, "loot_tables"),
        join(bpPath, "recipes"),
        join(bpPath, "spawn_rules"),
        join(bpPath, "structures"),
        join(bpPath, "texts"),
        join(bpPath, "trading"),
        rpPath,
        join(rpPath, "animation_controllers"),
        join(rpPath, "animations"),
        join(rpPath, "attachables"),
        join(rpPath, "entity"),
        join(rpPath, "fogs"),
        join(rpPath, "models"),
        join(rpPath, "models", "entity"),
        join(rpPath, "particles"),
        join(rpPath, "render_controllers"),
        join(rpPath, "sounds"),
        join(rpPath, "texts"),
        join(rpPath, "textures"),
        join(rpPath, "textures", "blocks"),
        join(rpPath, "textures", "entity"),
        join(rpPath, "textures", "items"),
        join(rpPath, "ui"),
    ];

    if (config.useMarketplaceStructure) {
        directories.push(
            ...BP_NAMESPACED_DIRECTORIES.map(folder => getScopedContentDirectory(bpPath, folder, config)),
            ...RP_NAMESPACED_DIRECTORIES.map(folder => getScopedContentDirectory(rpPath, folder, config)),
            ...RP_NAMESPACED_NESTED_DIRECTORIES.map(segments => getScopedNestedContentDirectory(rpPath, segments, config)),
        );
    }

    if (config.scripting === "javascript") {
        directories.push(join(bpPath, "scripts"), join(bpPath, "scripts", config.namespace), bpScriptPath);
    }

    if (config.scripting === "typescript") {
        directories.push(join(destination, "data"), dataScriptsPath);

        if (!config.useRgl) {
            directories.push(join(bpPath, "scripts"), join(bpPath, "scripts", config.namespace), bpScriptPath);
        }
    }

    await Promise.all(
        directories
            .filter(shouldCreateDirectory)
            .map(directory => mkdir(directory, { recursive: true })),
    );

    const bpUuid = crypto.randomUUID();
    const rpUuid = crypto.randomUUID();
    const versions = await getMinecraftDependencyVersions();

    const writes: Promise<void>[] = [
        writeJsonFile(join(bpPath, "manifest.json"), generateBpManifest(config, bpUuid, rpUuid, versions)),
        writeJsonFile(join(rpPath, "manifest.json"), generateRpManifest(config, rpUuid, bpUuid)),
        writeTextFile(join(bpPath, "texts", "en_US.lang"), generateLangFile(config.projectName, "behavior")),
        writeTextFile(join(rpPath, "texts", "en_US.lang"), generateLangFile(config.projectName, "resource")),
        writeJsonFile(join(rpPath, "blocks.json"), generateBlocksJson()),
        writeJsonFile(join(rpPath, "sounds.json"), generateSoundsJson()),
        writeJsonFile(join(rpPath, "sounds", "sound_definitions.json"), generateSoundDefinitions()),
        writeJsonFile(join(rpPath, "textures", "item_texture.json"), generateItemTexture(config)),
        writeJsonFile(join(rpPath, "textures", "terrain_texture.json"), generateTerrainTexture(config)),
        writeTextFile(join(rpPath, "textures", "flipbook_textures.json"), "[]"),
        writeTextFile(join(bpPath, "texts", "languages.json"), '["en_US"]'),
        writeTextFile(join(rpPath, "texts", "languages.json"), '["en_US"]'),
        writeTextFile(join(destination, ".gitignore"), generateGitignore()),
        writeTextFile(join(destination, "README.md"), generateReadme(config)),
    ];

    if (config.scripting !== "none") {
        writes.push(writeJsonFile(join(destination, "package.json"), generatePackageJson(config, versions)));
    }

    if (config.scripting === "javascript") {
        writes.push(writeTextFile(join(bpScriptPath, "main.js"), generateMainJs(config)));
    }

    if (config.scripting === "typescript") {
        writes.push(
            writeJsonFile(join(destination, "tsconfig.json"), generateTsConfig(config)),
            writeJsonFile(join(destination, "dprint.json"), generateDprintConfig()),
            writeTextFile(join(dataScriptsPath, "main.ts"), generateMainTs(config)),
        );
    }

    if (config.scripting !== "none" && config.useRgl) {
        writes.push(writeJsonFile(join(destination, "config.json"), generateRglConfig(config)));
    }

    await Promise.all(writes);
}
