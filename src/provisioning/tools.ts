import type { ProjectConfig } from "../config.js";
import { join } from "node:path";

function runCommand(command: string[], cwd?: string): Promise<boolean> {
    return Promise.resolve()
        .then(() => Bun.spawn({
            cmd: command,
            cwd,
            stdout: "pipe",
            stderr: "pipe",
        }))
        .then(
            process => process.exited.then(code => code === 0, () => false),
            () => false,
        );
}

export async function isCommandAvailable(command: string): Promise<boolean> {
    const lookupCommand = process.platform === "win32"
        ? ["where", command]
        : ["which", command];

    return runCommand(lookupCommand);
}

export async function installRgl(): Promise<boolean> {
    if (await isCommandAvailable("rgl")) {
        return true;
    }

    if (process.platform !== "win32") {
        return false;
    }

    const installed = await runCommand([
        "powershell",
        "-Command",
        "irm rgl.ink0rr.dev/install.ps1 | iex",
    ]);

    if (!installed) {
        return false;
    }

    return isCommandAvailable("rgl");
}

export async function installRockide(): Promise<boolean> {
    if (await isCommandAvailable("code")) {
        return runCommand([
            "code",
            "--install-extension",
            "rockide.rockide-vscode",
        ]);
    }

    if (await isCommandAvailable("cursor")) {
        return runCommand([
            "cursor",
            "--install-extension",
            "rockide.rockide-vscode",
        ]);
    }

    return false;
}

export async function installDependencies(projectPath: string): Promise<boolean> {
    const pkgPath = join(projectPath, "package.json");
    const pkgExists = await Bun.file(pkgPath).exists();

    if (!pkgExists) {
        return true;
    }

    const command = await isCommandAvailable("bun")
        ? ["bun", "install"]
        : ["npm", "install"];

    return runCommand(command, projectPath);
}

export async function runProvisioning(config: ProjectConfig): Promise<{
    rgl: boolean | null;
    rockide: boolean | null;
    dependencies: boolean | null;
}> {
    const results: {
        rgl: boolean | null;
        rockide: boolean | null;
        dependencies: boolean | null;
    } = {
        rgl: null,
        rockide: null,
        dependencies: null,
    };

    if (config.useRgl) {
        results.rgl = await installRgl();
    }

    if (config.installRockide) {
        results.rockide = await installRockide();
    }

    if (config.scripting !== "none") {
        results.dependencies = await installDependencies(config.destination);
    }

    return results;
}
