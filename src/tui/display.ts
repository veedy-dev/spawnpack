import { log } from "@clack/prompts";
import pc from "picocolors";
import type { ProjectConfig, ScriptingChoice } from "../config.js";

function getScriptingLabel(choice: ScriptingChoice): string {
    if (choice === "typescript") {
        return "TypeScript";
    }

    if (choice === "javascript") {
        return "JavaScript";
    }

    return "None";
}

function getSelectedPackages(config: ProjectConfig): string[] {
    if (config.scripting === "none") {
        return [];
    }

    const packages: string[] = [];

    if (config.scriptPackages.server) {
        packages.push("@minecraft/server");
    }

    if (config.scriptPackages.serverUi) {
        packages.push("@minecraft/server-ui");
    }

    if (config.scriptPackages.vanillaData) {
        packages.push("@minecraft/vanilla-data");
    }

    if (config.scriptPackages.math) {
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
    return label.padEnd(12, " ");
}

function getTreeRoot(config: ProjectConfig): string {
    const destination = config.destination.trim();

    if (destination === "." || destination === "./") {
        return config.projectName;
    }

    return destination.replace(/[\\/]+$/, "");
}

export function showFolderTree(config: ProjectConfig): string {
    const lines = [pc.bold(pc.cyan(getTreeRoot(config)))];

    lines.push(pc.dim("├─ packs/"));
    lines.push(pc.dim("│  ├─ BP/"));
    lines.push(pc.dim("│  │  ├─ entities/"));
    lines.push(pc.dim("│  │  ├─ items/"));
    lines.push(pc.dim("│  │  ├─ blocks/"));

    if (config.scripting !== "none") {
        lines.push(pc.dim(`│  │  ├─ scripts/${config.namespace}/${config.projectId}/`));
    }

    lines.push(pc.dim("│  │  ├─ texts/"));
    lines.push(pc.dim("│  │  └─ manifest.json"));
    lines.push(pc.dim("│  └─ RP/"));
    lines.push(pc.dim("│     ├─ entity/"));
    lines.push(pc.dim("│     ├─ models/"));
    lines.push(pc.dim("│     ├─ textures/"));
    lines.push(pc.dim("│     ├─ sounds/"));
    lines.push(pc.dim("│     └─ manifest.json"));

    if (config.scripting === "typescript") {
        lines.push(pc.dim("├─ data/"));
        lines.push(pc.dim("│  └─ scripts/"));
        lines.push(pc.dim("│     └─ main.ts"));
    }

    if (config.scripting !== "none") {
        lines.push(pc.dim("├─ package.json"));
    }

    if (config.scripting === "typescript") {
        lines.push(pc.dim("├─ tsconfig.json"));
        lines.push(pc.dim("├─ dprint.json"));
    }

    if (config.useRgl) {
        lines.push(pc.dim("├─ config.json"));
    }

    if (config.useAi) {
        lines.push(pc.dim("├─ CLAUDE.md"));
        lines.push(pc.dim("├─ .mcp.json"));
    }

    lines.push(pc.dim("├─ .gitignore"));
    lines.push(pc.dim("└─ README.md"));

    return lines.join("\n");
}

export function showPreview(config: ProjectConfig): void {
    const packages = getSelectedPackages(config);
    const preview = [
        pc.cyan("┌ Project Summary"),
        pc.cyan("│"),
        `${pc.cyan("│")}  ${pc.dim(padLabel("Name:"))} ${formatValue(config.projectName)}`,
        `${pc.cyan("│")}  ${pc.dim(padLabel("Author:"))} ${config.author ? formatValue(config.author) : pc.dim("—")}`,
        `${pc.cyan("│")}  ${pc.dim(padLabel("Namespace:"))} ${formatValue(config.namespace)}`,
        `${pc.cyan("│")}  ${pc.dim(padLabel("Identifier:"))} ${formatValue(config.identifier)}`,
        `${pc.cyan("│")}  ${pc.dim(padLabel("Project ID:"))} ${formatValue(config.projectId)}`,
        `${pc.cyan("│")}  ${pc.dim(padLabel("Destination:"))} ${formatValue(config.destination)}`,
        pc.cyan("│"),
        `${pc.cyan("│")}  ${pc.dim(padLabel("Scripting:"))} ${formatValue(getScriptingLabel(config.scripting))}`,
        `${pc.cyan("│")}  ${pc.dim(padLabel("Packages:"))} ${packages.length > 0 ? formatValue(packages.join(", ")) : pc.dim("None")}`,
        `${pc.cyan("│")}  ${pc.dim(padLabel("RGL:"))} ${formatToggle(config.useRgl)}`,
        `${pc.cyan("│")}  ${pc.dim(padLabel("AI Setup:"))} ${formatToggle(config.useAi)}`,
        `${pc.cyan("│")}  ${pc.dim(padLabel("Rockide:"))} ${formatToggle(config.installRockide)}`,
        pc.cyan("│"),
        `${pc.cyan("│")}  ${pc.yellow("Planned structure")}`,
        ...showFolderTree(config).split("\n").map(line => `${pc.cyan("│")}  ${line}`),
        pc.cyan("└"),
    ].join("\n");

    log.message(preview, { symbol: pc.cyan("◆") });
}

export function showPostGeneration(config: ProjectConfig): void {
    const nextSteps = [pc.bold(pc.green("Next steps:")), `  ${pc.cyan("cd")} ${formatValue(config.destination)}`];

    if (config.scripting !== "none") {
        nextSteps.push(`  ${pc.cyan("bun install")}`);
    }

    if (config.useRgl) {
        nextSteps.push(`  ${pc.cyan("rgl watch")}`);
    }

    const usefulCommands = [pc.bold(pc.yellow("Useful commands:"))];

    if (config.useRgl) {
        usefulCommands.push(`  ${pc.cyan("rgl run")} ${pc.dim("Build for development")}`);
        usefulCommands.push(`  ${pc.cyan("rgl run build")} ${pc.dim("Build for distribution")}`);
    }

    if (config.scripting === "typescript") {
        usefulCommands.push(`  ${pc.cyan("bun run typecheck")} ${pc.dim("Check TypeScript types")}`);
    }

    if (config.scripting === "javascript" && !config.useRgl) {
        usefulCommands.push(`  ${pc.dim("No additional scripting commands enabled")}`);
    }

    if (config.scripting === "none" && !config.useRgl) {
        usefulCommands.push(`  ${pc.dim("No build commands required for this scaffold")}`);
    }

    log.message([...nextSteps, "", ...usefulCommands].join("\n"), {
        symbol: pc.green("▲"),
    });
}
