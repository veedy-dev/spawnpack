import { join } from "node:path";

interface McpServerConfig {
    command: string;
    args: string[];
    env?: Record<string, string>;
}

function buildMcpServers(): Record<string, McpServerConfig> {
    return {
        exa: {
            command: "npx",
            args: ["-y", "exa-mcp-server"],
            env: {
                EXA_API_KEY: "YOUR_EXA_API_KEY",
            },
        },
        hyperbrowser: {
            command: "npx",
            args: ["-y", "hyperbrowser-mcp"],
            env: {
                HYPERBROWSER_API_KEY: "YOUR_HYPERBROWSER_API_KEY",
            },
        },
        "sequential-thinking": {
            command: "npx",
            args: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
        },
        serena: {
            command: "uvx",
            args: [
                "--from",
                "git+https://github.com/oraios/serena",
                "serena",
                "start-mcp-server",
                "--context",
                "ide-assistant",
            ],
        },
        grep_app: {
            command: "npx",
            args: ["-y", "grep-mcp"],
        },
        context7: {
            command: "npx",
            args: ["-y", "@upstash/context7-mcp"],
        },
    };
}

export async function generateMcpConfig(projectPath: string): Promise<void> {
    const mcpPath = join(projectPath, ".mcp.json");
    const config = { mcpServers: buildMcpServers() };

    await Bun.write(mcpPath, JSON.stringify(config, null, 2) + "\n").then(
        () => undefined,
        () => undefined,
    );
}
