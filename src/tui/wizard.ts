import {
    cancel,
    confirm,
    intro,
    isCancel,
    multiselect,
    select,
    text,
} from "@clack/prompts";
import pc from "picocolors";
import {
    DEFAULT_SCRIPT_PACKAGES,
    generateProjectId,
    type ProjectConfig,
    type ScriptPackages,
    type ScriptingChoice,
} from "../config.js";
import { showReview } from "./display.js";

type ScriptPackageKey = keyof ScriptPackages;

const teal = (value: string): string => `\x1b[38;2;47;208;181m${value}\x1b[39m`;
const bgTeal = (value: string): string => `\x1b[48;2;47;208;181m${value}\x1b[49m`;

function abortWizard(): null {
    cancel(pc.red("Spawnpack cancelled."));
    return null;
}

function toScriptPackages(selected: ScriptPackageKey[]): ScriptPackages {
    return {
        server: selected.includes("server"),
        serverUi: selected.includes("serverUi"),
        vanillaData: selected.includes("vanillaData"),
        math: selected.includes("math"),
    };
}

export async function runWizard(): Promise<ProjectConfig | null> {
    intro(
        `${bgTeal(pc.bold(pc.white(" Spawnpack ")))} ${teal("Initialize your Minecraft Bedrock addon")}`,
    );

    const projectName = await text({
        message: pc.bold("Project name"),
        placeholder: "My Cool Addon",
        validate(value) {
            const trimmed = (value ?? "").trim();

            if (trimmed.length === 0) {
                return "Project name is required.";
            }

            if (/[<>:"/\\|?*]/.test(trimmed)) {
                return "Invalid characters in name (avoid < > : \" / \\ | ? *).";
            }

            if (trimmed.length > 64) {
                return "Name is too long (max 64 characters).";
            }

            return undefined;
        },
    });

    if (isCancel(projectName)) {
        return abortWizard();
    }

    const trimmedProjectName = projectName.trim();
    const defaultNamespace = "sample";
    const suggestedProjectId = generateProjectId(trimmedProjectName);

    const author = await text({
        message: `${pc.bold("Author")} ${pc.dim("optional")}`,
        placeholder: "Your Name or Studio",
    });

    if (isCancel(author)) {
        return abortWizard();
    }

    const namespace = await text({
        message: `${pc.bold("Namespace")} ${pc.dim("used in identifiers like namespace:item_name")}`,
        placeholder: defaultNamespace,
        initialValue: defaultNamespace,
        validate(value) {
            const trimmed = (value ?? "").trim();

            if (trimmed.length === 0) {
                return "Namespace is required.";
            }

            if (!/^[a-z0-9_]+$/.test(trimmed)) {
                return "Use lowercase letters, numbers, and underscores only.";
            }

            return undefined;
        },
    });

    if (isCancel(namespace)) {
        return abortWizard();
    }

    const namespaceValue = namespace.trim();

    const useMarketplaceStructure = await confirm({
        message: `${pc.bold("Marketplace Add-On structure?")} ${pc.dim("Nest BP/RP content under publisher_id/project_id for better coexistence")}`,
        initialValue: false,
    });

    if (isCancel(useMarketplaceStructure)) {
        return abortWizard();
    }

    let identifierValue = namespaceValue;
    let projectIdValue = suggestedProjectId;

    if (useMarketplaceStructure) {
        const publisherId = await text({
            message: `${pc.bold("Publisher ID")} ${pc.dim("used for scoped folders like publisher_id/project_id")}`,
            placeholder: namespaceValue,
            initialValue: namespaceValue,
            validate(value) {
                const trimmed = (value ?? "").trim();

                if (trimmed.length === 0) {
                    return "Publisher ID is required.";
                }

                if (!/^[a-z0-9_]+$/.test(trimmed)) {
                    return "Use lowercase letters, numbers, and underscores only.";
                }

                return undefined;
            },
        });

        if (isCancel(publisherId)) {
            return abortWizard();
        }

        identifierValue = publisherId.trim();

        const projectId = await text({
            message: `${pc.bold("Project ID")} ${pc.dim("1-10 lowercase letters, numbers, or underscores")}`,
            placeholder: suggestedProjectId,
            initialValue: suggestedProjectId,
            validate(value) {
                const trimmed = (value ?? "").trim();

                if (!/^[a-z0-9_]{1,10}$/.test(trimmed)) {
                    return "Project ID must be 1-10 lowercase letters, numbers, or underscores.";
                }

                return undefined;
            },
        });

        if (isCancel(projectId)) {
            return abortWizard();
        }

        projectIdValue = projectId.trim();
    }

    const destination = await text({
        message: pc.bold("Destination folder"),
        placeholder: ".",
        initialValue: ".",
        validate(value) {
            const trimmed = (value ?? "").trim();

            if (trimmed.length === 0) {
                return "Destination folder is required.";
            }

            if (/[<>"|?*]/.test(trimmed)) {
                return "Invalid characters in path (avoid < > \" | ? *).";
            }

            if (trimmed.length > 200) {
                return "Path is too long (max 200 characters).";
            }

            return undefined;
        },
    });

    if (isCancel(destination)) {
        return abortWizard();
    }

    const scripting = await select<ScriptingChoice>({
        message: pc.bold("Scripting API"),
        initialValue: "typescript",
        options: [
            { value: "none", label: "None", hint: "manifest-only addon scaffold" },
            { value: "javascript", label: "JavaScript", hint: "script entry with JS tooling" },
            { value: "typescript", label: "TypeScript", hint: "recommended" },
        ],
    });

    if (isCancel(scripting)) {
        return abortWizard();
    }

    let scriptPackages: ScriptPackages = { ...DEFAULT_SCRIPT_PACKAGES };
    let useRgl = false;

    if (scripting !== "none") {
        const selectedPackages = await multiselect<ScriptPackageKey>({
            message: pc.bold("Script packages"),
            required: false,
            initialValues: Object.entries(DEFAULT_SCRIPT_PACKAGES)
                .filter(([, enabled]) => enabled)
                .map(([key]) => key as ScriptPackageKey),
            options: [
                { value: "server", label: "@minecraft/server", hint: "core Bedrock Script API for gameplay, world, blocks, and entities" },
                { value: "serverUi", label: "@minecraft/server-ui", hint: "UI forms and dialogs" },
                { value: "vanillaData", label: "@minecraft/vanilla-data", hint: "built-in constants and enums" },
                { value: "math", label: "@minecraft/math", hint: "vector and math helpers" },
            ],
        });

        if (isCancel(selectedPackages)) {
            return abortWizard();
        }

        scriptPackages = toScriptPackages(Array.from(new Set(["server", ...selectedPackages])));

        const rglChoice = await confirm({
            message: `${pc.bold("Use rgl?")} ${pc.dim("fast Bedrock addon compiler, 16x faster than Regolith")}`,
            initialValue: true,
        });

        if (isCancel(rglChoice)) {
            return abortWizard();
        }

        useRgl = rglChoice;
    }

    const installRockide = await confirm({
        message: `${pc.bold("Install Rockide?")} ${pc.dim("VSCode extension for Bedrock JSON autocompletion")}`,
        initialValue: true,
    });

    if (isCancel(installRockide)) {
        return abortWizard();
    }

    const useAi = await confirm({
        message: `${pc.bold("AI setup?")} ${pc.dim("generate CLAUDE.md with Bedrock development rules")}`,
        initialValue: false,
    });

    if (isCancel(useAi)) {
        return abortWizard();
    }

    const config: ProjectConfig = {
        projectName: trimmedProjectName,
        author: author.trim(),
        namespace: namespaceValue,
        identifier: identifierValue,
        projectId: projectIdValue,
        destination: destination.trim(),
        scripting,
        scriptPackages: scripting === "none" ? { ...DEFAULT_SCRIPT_PACKAGES } : scriptPackages,
        useMarketplaceStructure,
        useRgl: scripting === "none" ? false : useRgl,
        useAi,
        installRockide,
    };

    showReview(config);

    const shouldGenerate = await confirm({
        message: `${pc.bold("Generate addon scaffold?")} ${pc.dim("create the project files now")}`,
        initialValue: true,
    });

    if (isCancel(shouldGenerate) || !shouldGenerate) {
        return abortWizard();
    }

    return config;
}
