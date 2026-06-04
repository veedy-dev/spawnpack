import {
    type ManifestDependency,
    type ManifestModule,
    type MinecraftDependencyVersions,
    type PackManifest,
    type ProjectConfig,
    VERSIONS,
    getScriptEntryPath,
} from "../config.js";

const PACK_VERSION: [number, number, number] = [1, 0, 0];

function getAuthors(author: string): string[] {
    return author.trim() === "" ? [] : [author];
}

function getManifestScriptDependencies(config: ProjectConfig, versions: MinecraftDependencyVersions): ManifestDependency[] {
    const dependencies: ManifestDependency[] = [];

    if (config.scriptPackages.server) {
        dependencies.push({ module_name: "@minecraft/server", version: versions.server });
    }

    if (config.scriptPackages.serverUi) {
        dependencies.push({ module_name: "@minecraft/server-ui", version: versions.serverUi });
    }

    return dependencies;
}

function getBpModules(config: ProjectConfig): ManifestModule[] {
    const modules: ManifestModule[] = [{ type: "data", uuid: crypto.randomUUID(), version: PACK_VERSION }];

    if (config.scripting !== "none") {
        modules.push({
            type: "script",
            uuid: crypto.randomUUID(),
            version: PACK_VERSION,
            language: "javascript",
            entry: getScriptEntryPath(config),
        });
    }

    return modules;
}

export function generateBpManifest(config: ProjectConfig, bpUuid: string, rpUuid: string, versions: MinecraftDependencyVersions): PackManifest {
    const dependencies: ManifestDependency[] = [{ uuid: rpUuid, version: PACK_VERSION }];

    if (config.scripting !== "none") {
        dependencies.push(...getManifestScriptDependencies(config, versions));
    }

    return {
        format_version: VERSIONS.manifestFormat,
        metadata: {
            authors: getAuthors(config.author),
            product_type: "addon",
        },
        header: {
            name: "pack.name",
            description: "pack.description",
            pack_scope: "world",
            uuid: bpUuid,
            version: PACK_VERSION,
            min_engine_version: VERSIONS.minEngineVersion,
        },
        capabilities: ["pbr"],
        modules: getBpModules(config),
        dependencies,
    };
}

export function generateRpManifest(config: ProjectConfig, rpUuid: string, bpUuid: string): PackManifest {
    return {
        format_version: VERSIONS.manifestFormat,
        metadata: {
            authors: getAuthors(config.author),
            product_type: "addon",
        },
        header: {
            name: "pack.name",
            description: "pack.description",
            pack_scope: "world",
            uuid: rpUuid,
            version: PACK_VERSION,
            min_engine_version: VERSIONS.minEngineVersion,
        },
        capabilities: ["pbr"],
        modules: [{ type: "resources", uuid: crypto.randomUUID(), version: PACK_VERSION }],
        dependencies: [{ uuid: bpUuid, version: PACK_VERSION }],
    };
}
