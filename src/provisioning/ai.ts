import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { getAiDocFilename, type AiSetupChoice } from "../config.js";
import { generateMcpConfig } from "./mcp.js";

const AI_EXCLUDE_LINES = [
    "# AI tool files",
    "/CLAUDE.md",
    "/AGENTS.md",
    "/.mcp.json",
    "/opencode.json",
    "/.claude/",
];

function getTemplateUrls(filename: string): URL[] {
    return [
        new URL(`../templates/${filename}`, import.meta.url),
        new URL(`../../templates/${filename}`, import.meta.url),
    ];
}

async function createAiDocContent(filename: string): Promise<string> {
    const templateUrls = getTemplateUrls(filename);

    for (const templateUrl of templateUrls) {
        const templateFile = Bun.file(templateUrl);
        const exists = await templateFile.exists().then(
            value => value,
            () => false,
        );

        if (exists) {
            return await templateFile.text();
        }
    }

    return await Bun.file(templateUrls[0]).text();
}

export async function generateAiDoc(projectPath: string, aiSetup: AiSetupChoice): Promise<void> {
    const filename = getAiDocFilename(aiSetup);

    if (filename === null) {
        return;
    }

    const outputPath = join(projectPath, filename);
    const content = await createAiDocContent(filename);

    await Bun.write(outputPath, content).then(
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

async function writeOpencodePluginConfig(projectPath: string): Promise<void> {
    const configPath = join(projectPath, "opencode.json");
    const pluginId = "@dietrichgebert/ponytail";
    const file = Bun.file(configPath);
    const exists = await file.exists().then(value => value, () => false);
    let nextConfig: Record<string, unknown> = {
        $schema: "https://opencode.ai/config.json",
        plugin: [pluginId],
    };

    if (exists) {
        try {
            const parsed = await file.json() as Record<string, unknown>;
            const plugins = Array.isArray(parsed.plugin) ? [...parsed.plugin as string[]] : [];

            if (!plugins.includes(pluginId)) {
                plugins.push(pluginId);
            }

            nextConfig = { ...parsed, plugin: plugins };
        } catch {
            // fall back to the default config on parse failure
        }
    }

    await Bun.write(configPath, `${JSON.stringify(nextConfig, null, 4)}\n`).then(
        () => undefined,
        () => undefined,
    );
}

export async function setupAi(projectPath: string, aiSetup: AiSetupChoice, installPonytail: boolean): Promise<void> {
    if (aiSetup === "none") {
        return;
    }

    await generateAiDoc(projectPath, aiSetup);
    await setupGitExcludes(projectPath);
    await generateMcpConfig(projectPath);

    if (installPonytail && aiSetup === "other") {
        await writeOpencodePluginConfig(projectPath);
    }
}
