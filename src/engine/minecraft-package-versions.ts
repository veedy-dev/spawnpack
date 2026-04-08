import {
    DEFAULT_MINECRAFT_DEPENDENCY_VERSIONS,
    type MinecraftDependencyVersions,
} from "../config.js";

const PACKAGE_NAMES = {
    server: "@minecraft/server",
    serverUi: "@minecraft/server-ui",
    vanillaData: "@minecraft/vanilla-data",
    math: "@minecraft/math",
} as const;

type PackageKey = keyof MinecraftDependencyVersions;

type RegistryPackument = {
    versions?: Record<string, unknown>;
    "dist-tags"?: {
        latest?: string;
    };
};

let cachedVersionsPromise: Promise<MinecraftDependencyVersions> | undefined;

function isStableVersion(version: string): boolean {
    return !version.includes("-");
}

function compareVersions(left: string, right: string): number {
    const leftParts = left.split(".").map(Number);
    const rightParts = right.split(".").map(Number);
    const length = Math.max(leftParts.length, rightParts.length);

    for (let index = 0; index < length; index += 1) {
        const leftPart = leftParts[index] ?? 0;
        const rightPart = rightParts[index] ?? 0;

        if (leftPart !== rightPart) {
            return leftPart - rightPart;
        }
    }

    return 0;
}

async function fetchLatestStablePackageVersion(packageName: string, fallbackVersion: string): Promise<string> {
    const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`, {
        headers: {
            accept: "application/json",
        },
    });

    if (!response.ok) {
        return fallbackVersion;
    }

    const packument = await response.json() as RegistryPackument;
    const latestTag = packument["dist-tags"]?.latest;

    if (typeof latestTag === "string" && isStableVersion(latestTag)) {
        return latestTag;
    }

    const stableVersions = Object.keys(packument.versions ?? {}).filter(isStableVersion);

    if (stableVersions.length === 0) {
        return fallbackVersion;
    }

    stableVersions.sort(compareVersions);
    return stableVersions.at(-1) ?? fallbackVersion;
}

async function resolveLatestVersions(): Promise<MinecraftDependencyVersions> {
    const [server, serverUi, vanillaData, math] = await Promise.all(
        (Object.entries(PACKAGE_NAMES) as [PackageKey, string][]).map(async ([key, packageName]) => {
            const fallbackVersion = DEFAULT_MINECRAFT_DEPENDENCY_VERSIONS[key];

            try {
                return await fetchLatestStablePackageVersion(packageName, fallbackVersion);
            } catch {
                return fallbackVersion;
            }
        }),
    );

    return {
        server,
        serverUi,
        vanillaData,
        math,
    };
}

export async function getMinecraftDependencyVersions(): Promise<MinecraftDependencyVersions> {
    cachedVersionsPromise ??= resolveLatestVersions();
    return await cachedVersionsPromise;
}
