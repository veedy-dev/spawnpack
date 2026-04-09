import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { generateMcpConfig } from "./mcp.js";

const AI_EXCLUDE_LINES = [
    "# AI tool files",
    "CLAUDE.md",
    "AGENTS.md",
    ".mcp.json",
    ".claude/",
    ".serena/",
];

const CLAUDE_TEMPLATE_URLS = [
    new URL("../templates/CLAUDE.md", import.meta.url),
    new URL("../../templates/CLAUDE.md", import.meta.url),
];

async function createClaudeMdContent(): Promise<string> {
    for (const templateUrl of CLAUDE_TEMPLATE_URLS) {
        const templateFile = Bun.file(templateUrl);
        const exists = await templateFile.exists().then(
            value => value,
            () => false,
        );

        if (exists) {
            return await templateFile.text();
        }
    }

    return await Bun.file(CLAUDE_TEMPLATE_URLS[0]).text();
}

export async function generateClaudeMd(projectPath: string): Promise<void> {
    const claudePath = join(projectPath, "CLAUDE.md");
    const content = await createClaudeMdContent();

    await Bun.write(claudePath, content).then(
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
