import { join } from "node:path";

type McpServerConfig =
    | {
        command: string;
        args: string[];
        env?: Record<string, string>;
    }
    | {
        url: string;
        headers?: Record<string, string>;
    };

function buildMcpServers(): Record<string, McpServerConfig> {
    return {
        exa: {
            command: "npx",
            args: ["-y", "exa-mcp-server"],
            env: {
                EXA_API_KEY: "YOUR_EXA_API_KEY",
            },
        },
        "browser-use": {
            url: "https://api.browser-use.com/v3/mcp",
            headers: {
                "x-browser-use-api-key": "YOUR_BROWSER_USE_API_KEY",
            },
        },
        "sequential-thinking": {
            command: "npx",
            args: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
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
