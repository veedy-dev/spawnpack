import { log } from "@clack/prompts";
import pc from "picocolors";
import {
    getAiDocFilename,
    getMarketplaceScopeLabel,
    type AiSetupChoice,
    type ProjectConfig,
    type ScriptPackages,
    type ScriptingChoice,
} from "../config.js";

const teal = (value: string): string => `\x1b[38;2;47;208;181m${value}\x1b[39m`;

function bgTeal(value: string): string {
    return `\x1b[48;2;47;208;181m${value}\x1b[49m`;
}

function whiteOnTeal(value: string): string {
    return bgTeal(`\x1b[97m${value}\x1b[39m`);
}

function getScriptingLabel(choice: ScriptingChoice): string {
    if (choice === "typescript") {
        return "TypeScript";
    }

    if (choice === "javascript") {
        return "JavaScript";
    }

    return "None";
}

function getAiSetupLabel(choice: AiSetupChoice): string {
    if (choice === "claude") {
        return "Claude";
    }

    if (choice === "other") {
        return "Other";
    }

    return "None";
}

function getSelectedPackages(scriptPackages: ScriptPackages): string[] {
    const packages: string[] = [];

    if (scriptPackages.server) {
        packages.push("@minecraft/server");
    }

    if (scriptPackages.serverUi) {
        packages.push("@minecraft/server-ui");
    }

    if (scriptPackages.vanillaData) {
        packages.push("@minecraft/vanilla-data");
    }

    if (scriptPackages.math) {
        packages.push("@minecraft/math");
    }

    return packages;
}

function formatValue(value: string): string {
    return pc.bold(pc.white(value));
}

function formatToggle(enabled: boolean): string {
    return enabled ? pc.green("Yes") : pc.dim("No");
}

function padLabel(label: string): string {
    return label.padEnd(22, " ");
}

function getTreeRoot(config: ProjectConfig): string {
    const destination = config.destination.trim();

    if (destination === "." || destination === "./") {
        return ".";
    }

    return destination.replace(/[\\/]+$/, "");
}

function pushScopedFolder(
    lines: string[],
    folderPrefix: string,
    scopePrefix: string,
    folder: string,
    config: ProjectConfig,
): void {
    lines.push(pc.dim(`${folderPrefix}${folder}/`));

    if (config.useMarketplaceStructure) {
        lines.push(pc.dim(`${scopePrefix}${getMarketplaceScopeLabel(config)}/`));
    }
}

export function showFolderTree(config: ProjectConfig): string {
    const lines = [pc.bold(pc.white(getTreeRoot(config)))];

    lines.push(pc.dim("├─ packs/"));
    lines.push(pc.dim("│  ├─ BP/"));
    pushScopedFolder(lines, "│  │  ├─ ", "│  │  │  └─ ", "animation_controllers", config);
    pushScopedFolder(lines, "│  │  ├─ ", "│  │  │  └─ ", "animations", config);
    pushScopedFolder(lines, "│  │  ├─ ", "│  │  │  └─ ", "blocks", config);
    pushScopedFolder(lines, "│  │  ├─ ", "│  │  │  └─ ", "entities", config);
    pushScopedFolder(lines, "│  │  ├─ ", "│  │  │  └─ ", "items", config);
    pushScopedFolder(lines, "│  │  ├─ ", "│  │  │  └─ ", "loot_tables", config);
    pushScopedFolder(lines, "│  │  ├─ ", "│  │  │  └─ ", "recipes", config);
    pushScopedFolder(lines, "│  │  ├─ ", "│  │  │  └─ ", "spawn_rules", config);
    pushScopedFolder(lines, "│  │  ├─ ", "│  │  │  └─ ", "structures", config);
    lines.push(pc.dim("│  │  ├─ texts/"));
    pushScopedFolder(lines, "│  │  ├─ ", "│  │  │  └─ ", "trading", config);

    if (config.scripting === "javascript" || (config.scripting === "typescript" && !config.useRgl)) {
        lines.push(pc.dim(`│  │  ├─ scripts/${config.identifier}/${config.projectId}/`));
    }

    lines.push(pc.dim("│  │  └─ manifest.json"));
    lines.push(pc.dim("│  └─ RP/"));
    pushScopedFolder(lines, "│     ├─ ", "│     │  └─ ", "animation_controllers", config);
    pushScopedFolder(lines, "│     ├─ ", "│     │  └─ ", "animations", config);
    pushScopedFolder(lines, "│     ├─ ", "│     │  └─ ", "attachables", config);
    pushScopedFolder(lines, "│     ├─ ", "│     │  └─ ", "entity", config);
    pushScopedFolder(lines, "│     ├─ ", "│     │  └─ ", "fogs", config);
    lines.push(pc.dim("│     ├─ models/entity/"));

    if (config.useMarketplaceStructure) {
        lines.push(pc.dim(`│     │  └─ ${getMarketplaceScopeLabel(config)}/`));
    }

    pushScopedFolder(lines, "│     ├─ ", "│     │  └─ ", "particles", config);
    pushScopedFolder(lines, "│     ├─ ", "│     │  └─ ", "render_controllers", config);
    pushScopedFolder(lines, "│     ├─ ", "│     │  └─ ", "sounds", config);
    lines.push(pc.dim("│     ├─ texts/"));
    lines.push(pc.dim("│     ├─ textures/blocks/"));

    if (config.useMarketplaceStructure) {
        lines.push(pc.dim(`│     │  └─ ${getMarketplaceScopeLabel(config)}/`));
    }

    lines.push(pc.dim("│     ├─ textures/entity/"));

    if (config.useMarketplaceStructure) {
        lines.push(pc.dim(`│     │  └─ ${getMarketplaceScopeLabel(config)}/`));
    }

    lines.push(pc.dim("│     ├─ textures/items/"));

    if (config.useMarketplaceStructure) {
        lines.push(pc.dim(`│     │  └─ ${getMarketplaceScopeLabel(config)}/`));
    }

    pushScopedFolder(lines, "│     ├─ ", "│     │  └─ ", "ui", config);
    lines.push(pc.dim("│     ├─ blocks.json"));
    lines.push(pc.dim("│     ├─ sounds.json"));
    lines.push(pc.dim("│     ├─ sound_definitions.json"));
    lines.push(pc.dim("│     ├─ item_texture.json"));
    lines.push(pc.dim("│     ├─ terrain_texture.json"));
    lines.push(pc.dim("│     ├─ flipbook_textures.json"));
    lines.push(pc.dim("│     └─ manifest.json"));

    if (config.scripting === "typescript") {
        lines.push(pc.dim("├─ data/scripts/"));
        lines.push(pc.dim("│  └─ main.ts"));
        lines.push(pc.dim("├─ tsconfig.json"));
        lines.push(pc.dim("├─ dprint.json"));
    }

    if (config.scripting === "javascript") {
        lines.push(pc.dim(`├─ packs/BP/scripts/${config.identifier}/${config.projectId}/main.js`));
    }

    if (config.scripting !== "none") {
        lines.push(pc.dim("├─ package.json"));
    }

    if (config.useRgl) {
        lines.push(pc.dim("├─ config.json"));
    }

    const aiDocFilename = getAiDocFilename(config.aiSetup);

    if (aiDocFilename !== null) {
        lines.push(pc.dim(`├─ ${aiDocFilename}`));
        lines.push(pc.dim("├─ .mcp.json"));
    }

    lines.push(pc.dim("├─ .gitignore"));
    lines.push(pc.dim("└─ README.md"));

    return lines.join("\n");
}

export function showReview(config: ProjectConfig): void {
    const border = teal("│");
    const packages = config.scripting === "none"
        ? pc.dim("None")
        : getSelectedPackages(config.scriptPackages).length > 0
            ? formatValue(getSelectedPackages(config.scriptPackages).join(", "))
            : pc.dim("None");

    const lines = [
        `${whiteOnTeal(" Spawnpack ")} ${pc.dim("Review your Bedrock addon scaffold")}`,
        "",
        `${border}  ${pc.dim(padLabel("Project:"))} ${formatValue(config.projectName)}`,
        `${border}  ${pc.dim(padLabel("Author:"))} ${config.author ? formatValue(config.author) : pc.dim("—")}`,
        ...(config.useMarketplaceStructure
            ? [
                `${border}  ${pc.dim(padLabel("Publisher ID:"))} ${formatValue(config.identifier)}`,
                `${border}  ${pc.dim(padLabel("Project ID:"))} ${formatValue(config.projectId)}`,
                `${border}  ${pc.dim(padLabel("Marketplace structure:"))} ${formatValue(getMarketplaceScopeLabel(config))}`,
            ]
            : [
                `${border}  ${pc.dim(padLabel("Marketplace structure:"))} ${pc.dim("Disabled")}`,
            ]),
        `${border}  ${pc.dim(padLabel("Destination:"))} ${formatValue(config.destination)}`,
        `${border}  ${pc.dim(padLabel("Scripting:"))} ${formatValue(getScriptingLabel(config.scripting))}`,
        `${border}  ${pc.dim(padLabel("Packages:"))} ${packages}`,
        `${border}  ${pc.dim(padLabel("rgl:"))} ${formatToggle(config.useRgl)}`,
        `${border}  ${pc.dim(padLabel("Rockide:"))} ${formatToggle(config.installRockide)}`,
        `${border}  ${pc.dim(padLabel("AI Setup:"))} ${formatValue(getAiSetupLabel(config.aiSetup))}`,
        "",
        `${border}  ${teal(pc.bold("Planned structure"))}`,
        ...showFolderTree(config).split("\n").map(line => `${border}  ${line}`),
    ];

    log.message(lines.join("\n"), { symbol: teal("◆") });
}

export function showPostGeneration(config: ProjectConfig): void {
    const nextSteps = [teal(pc.bold("Next steps"))];

    if (config.destination !== "." && config.destination !== "./") {
        nextSteps.push(`  ${pc.cyan("cd")} ${formatValue(config.destination)}`);
    }

    if (config.scripting !== "none") {
        nextSteps.push(`  ${pc.cyan("bun install")} ${pc.dim("or")} ${pc.cyan("npm install")} ${pc.dim("Install project dependencies")}`);
    }

    if (config.useRgl) {
        nextSteps.push(`  ${pc.cyan("rgl watch")} ${pc.dim("Watch files and rebuild/export while you work")}`);
    }

    const usefulCommands = [teal(pc.bold("Useful commands"))];

    if (config.useRgl) {
        usefulCommands.push(`  ${pc.cyan("rgl run")} ${pc.dim("Build for development")}`);
        usefulCommands.push(`  ${pc.cyan("rgl run build")} ${pc.dim("Build for distribution")}`);
    }

    if (config.scripting === "typescript") {
        usefulCommands.push(`  ${pc.cyan("bun run typecheck")} ${pc.dim("or")} ${pc.cyan("npm run typecheck")} ${pc.dim("Check TypeScript types")}`);
    }

    if (config.scripting === "none" && !config.useRgl) {
        usefulCommands.push(`  ${pc.dim("No extra build commands needed for this scaffold")}`);
    }

    if (config.aiSetup !== "none") {
        usefulCommands.push("");
        usefulCommands.push(`${teal(pc.bold("Note"))} ${pc.dim(".mcp.json is ready to use — the configured MCP servers need no API keys.")}`);
    }

    log.message([...nextSteps, "", ...usefulCommands].join("\n"), {
        symbol: teal("▲"),
    });
}
