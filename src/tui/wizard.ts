import {
    cancel,
    confirm,
    intro,
    isCancel,
    log,
    multiselect,
    outro,
    select,
    spinner,
    text,
} from "@clack/prompts";
import pc from "picocolors";
import {
    DEFAULT_SCRIPT_PACKAGES,
    generateProjectId,
    sanitizeIdentifier,
    type ProjectConfig,
    type ScriptPackages,
    type ScriptingChoice,
} from "../config.js";
import { showPreview } from "./display.js";

type ScriptPackageKey = keyof ScriptPackages;

function abortWizard(): null {
    cancel(pc.red("Spawnpack cancelled."));
    return null;
}

function createScriptPackages(selected: ScriptPackageKey[]): ScriptPackages {
    return {
        server: selected.includes("server"),
        serverUi: selected.includes("serverUi"),
        vanillaData: selected.includes("vanillaData"),
        math: selected.includes("math"),
    };
}

function boolToYesNo(value: boolean): string {
    return value ? pc.green("Yes") : pc.red("No");
}

function formatPackages(pkg: ScriptPackages): string {
    const items: string[] = [];
    if (pkg.server) items.push("@minecraft/server");
    if (pkg.serverUi) items.push("@minecraft/server-ui");
    if (pkg.vanillaData) items.push("@minecraft/vanilla-data");
    if (pkg.math) items.push("@minecraft/math");
    return items.length > 0 ? items.join(", ") : pc.dim("None");
}

export async function runWizard(): Promise<ProjectConfig | null> {
    intro(
        `${pc.white(pc.bgCyan(pc.bold(" Spawnpack ")))} ${pc.dim("Initialize your Minecraft Bedrock addon")}`,
    );

    // ─── Step 1: Project name ────────────────────────────────────────────────
    const projectName = await text({
        message: pc.bold("Project name"),
        placeholder: "My Cool Addon",
        validate(value) {
            const trimmed = value.trim();
            if (trimmed.length === 0) return "Project name is required.";
            if (/[<>:"/\\|?*]/.test(trimmed)) return "Invalid characters in name (avoid < > : \" / \\ | ? *).";
            if (trimmed.length > 64) return "Name is too long (max 64 characters).";
            return undefined;
        },
    });

    if (isCancel(projectName)) return abortWizard();

    const trimmedProjectName = projectName.trim();

    // ─── Step 2: Author ─────────────────────────────────────────────────────
    const author = await text({
        message: pc.bold("Author") + pc.dim(" (optional)"),
        placeholder: "Your Name or Studio",
    });

    if (isCancel(author)) return abortWizard();

    // ─── Step 3: Namespace ──────────────────────────────────────────────────
    const suggestedNamespace = sanitizeIdentifier(trimmedProjectName).replace(/-/g, "_");

    const namespace = await text({
        message: `${pc.bold("Namespace")} ${pc.dim("• used in identifiers like namespace:item_name")}`,
        placeholder: "my_namespace",
        initialValue: suggestedNamespace,
        validate(value) {
            const trimmed = value.trim();
            if (trimmed.length === 0) return "Namespace is required.";
            if (!/^[a-z0-9_]+$/.test(trimmed)) return "Use lowercase letters, numbers, and underscores only.";
            return undefined;
        },
    });

    if (isCancel(namespace)) return abortWizard();

    const namespaceValue = namespace.trim();

    // ─── Step 4: Identifier ─────────────────────────────────────────────────
    const defaultIdentifier = sanitizeIdentifier(trimmedProjectName).replace(/-/g, "_") || "cool_addon";

    const identifier = await text({
        message: `${pc.bold("Addon identifier")} ${pc.dim(`• this identifies the addon as ${namespaceValue}:identifier`)}`,
        placeholder: defaultIdentifier,
        initialValue: defaultIdentifier,
        validate(value) {
            const trimmed = value.trim();
            if (trimmed.length === 0) return "Addon identifier is required.";
            if (!/^[a-z0-9_]+$/.test(trimmed)) return "Use lowercase letters, numbers, and underscores only.";
            return undefined;
        },
    });

    if (isCancel(identifier)) return abortWizard();

    // ─── Step 5: Project ID ─────────────────────────────────────────────────
    const suggestedProjectId = generateProjectId(trimmedProjectName);

    log.message(
        `${pc.cyan("Suggested abbreviation:")} ${pc.bold(suggestedProjectId)} ${pc.dim("• Press Enter to accept or type your own")}`,
        { symbol: pc.cyan("◇") },
    );

    const projectId = await text({
        message: pc.bold("Project ID") + pc.dim(" (2-4 chars)"),
        initialValue: suggestedProjectId,
        placeholder: suggestedProjectId,
        validate(value) {
            const trimmed = value.trim();
            if (!/^[a-z0-9]{2,4}$/.test(trimmed)) return "Project ID must be 2-4 lowercase letters or numbers.";
            if (/^\.\.|\/$/.test(trimmed)) return "Project ID cannot look like a path.";
            return undefined;
        },
    });

    if (isCancel(projectId)) return abortWizard();

    // ─── Step 6: Destination ───────────────────────────────────────────────
    const destination = await text({
        message: pc.bold("Destination folder"),
        initialValue: ".",
        placeholder: ".",
        validate(value) {
            const trimmed = value.trim();
            if (trimmed.length === 0) return "Destination folder is required.";
            if (/[<>"/|?*]/.test(trimmed)) return "Invalid characters in path (avoid < > \" / | ? *).";
            if (trimmed.length > 200) return "Path is too long (max 200 characters).";
            return undefined;
        },
    });

    if (isCancel(destination)) return abortWizard();

    // ─── Step 7: Scripting ─────────────────────────────────────────────────
    const scripting = await select<ScriptingChoice>({
        message: pc.bold("Scripting API"),
        initialValue: "typescript",
        options: [
            { value: "none", label: "None", hint: "manifest-only addon scaffold" },
            { value: "javascript", label: "JavaScript", hint: "script entry with JS tooling" },
            { value: "typescript", label: "TypeScript", hint: "recommended" },
        ],
    });

    if (isCancel(scripting)) return abortWizard();

    let scriptPackages: ScriptPackages = { ...DEFAULT_SCRIPT_PACKAGES };
    let useRgl = false;

    // ─── Step 8: Script packages + RGL ────────────────────────────────────
    if (scripting !== "none") {
        log.info(pc.dim("Navigate with " + pc.cyan("↑↓") + " • Toggle with " + pc.cyan("Space") + " • Confirm with " + pc.cyan("Enter")));

        const selectedPackages = await multiselect<ScriptPackageKey>({
            message: pc.bold("Script packages"),
            required: true,
            initialValues: ["server", "serverUi", "vanillaData", "math"].filter(k => DEFAULT_SCRIPT_PACKAGES[k as keyof ScriptPackages]) as ScriptPackageKey[],
            options: [
                {
                    value: "server",
                    label: "@minecraft/server",
                    hint: "always included",
                },
                {
                    value: "serverUi",
                    label: "@minecraft/server-ui",
                    hint: "UI forms and dialogs",
                },
                {
                    value: "vanillaData",
                    label: "@minecraft/vanilla-data",
                    hint: "built-in constants and enums",
                },
                {
                    value: "math",
                    label: "@minecraft/math",
                    hint: "vector and math helpers",
                },
            ],
        });

        if (isCancel(selectedPackages)) return abortWizard();

        const normalizedPackages = Array.from(
            new Set<ScriptPackageKey>(["server", ...selectedPackages]),
        );
        scriptPackages = createScriptPackages(normalizedPackages);

        const rglChoice = await confirm({
            message: `${pc.bold("Use RGL?")} ${pc.dim("• Fast Bedrock addon compiler (16x faster than Regolith)")}`,
            initialValue: true,
        });

        if (isCancel(rglChoice)) return abortWizard();
        useRgl = rglChoice;
    }

    // ─── Step 9: AI ────────────────────────────────────────────────────────
    const useAi = await confirm({
        message: `${pc.bold("Use AI?")} ${pc.dim("• Generate CLAUDE.md with Minecraft Bedrock development rules")}`,
        initialValue: false,
    });

    if (isCancel(useAi)) return abortWizard();

    // ─── Step 10: Rockide ───────────────────────────────────────────────────
    const installRockide = await confirm({
        message: `${pc.bold("Install Rockide?")} ${pc.dim("• VSCode extension for Bedrock JSON autocompletion and validation")}`,
        initialValue: true,
    });

    if (isCancel(installRockide)) return abortWizard();

    // ─── Step 11: Review ────────────────────────────────────────────────────
    const config: ProjectConfig = {
        projectName: trimmedProjectName,
        author: author.trim(),
        namespace: namespaceValue,
        identifier: identifier.trim(),
        projectId: projectId.trim(),
        destination: destination.trim(),
        scripting,
        scriptPackages: scripting === "none" ? { ...DEFAULT_SCRIPT_PACKAGES } : scriptPackages,
        useRgl: scripting === "none" ? false : useRgl,
        useAi,
        installRockide,
    };

    console.log();
    console.log(pc.bold(pc.cyan("─".repeat(50))));
    console.log(pc.bold("  Review your settings"));
    console.log(pc.cyan("─".repeat(50)));
    console.log(`${pc.dim("Project name    →")} ${pc.bold(config.projectName)}`);
    console.log(`${pc.dim("Author          →")} ${config.author || pc.dim("(none)")}`);
    console.log(`${pc.dim("Namespace       →")} ${pc.bold(config.namespace)}`);
    console.log(`${pc.dim("Identifier      →")} ${pc.bold(config.identifier)}`);
    console.log(`${pc.dim("Project ID     →")} ${pc.bold(config.projectId)}`);
    console.log(`${pc.dim("Destination     →")} ${pc.bold(config.destination)}`);
    console.log(`${pc.dim("Scripting       →")} ${pc.bold(scripting)}`);
    if (scripting !== "none") {
        console.log(`${pc.dim("Packages        →")} ${formatPackages(config.scriptPackages)}`);
        console.log(`${pc.dim("RGL             →")} ${boolToYesNo(config.useRgl)}`);
    }
    console.log(`${pc.dim("AI (CLAUDE.md)   →")} ${boolToYesNo(config.useAi)}`);
    console.log(`${pc.dim("Rockide         →")} ${boolToYesNo(config.installRockide)}`);
    console.log(pc.cyan("─".repeat(50)));
    console.log(pc.dim("  You can cancel now or press Enter to generate."));
    console.log();

    showPreview(config);

    const shouldGenerate = await confirm({
        message: pc.bold("Generate Add-On scaffold?"),
        initialValue: true,
    });

    if (isCancel(shouldGenerate) || !shouldGenerate) {
        return abortWizard();
    }

    const s = spinner();
    s.start(pc.dim("Sharpening the blueprint..."));
    await Promise.resolve();
    s.stop(pc.green("Blueprint ready."));

    outro(`${pc.green("Ready to generate.")} ${pc.dim("Handing config to the engine...")}`);

    return config;
}
