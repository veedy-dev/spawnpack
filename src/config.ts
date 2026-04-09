export interface ProjectConfig {
    projectName: string;
    author: string;
    projectId: string;
    identifier: string;
    destination: string;
    scripting: ScriptingChoice;
    scriptPackages: ScriptPackages;
    useMarketplaceStructure: boolean;
    useRgl: boolean;
    useAi: boolean;
    installRockide: boolean;
}

export type ScriptingChoice = "none" | "javascript" | "typescript";

export interface ScriptPackages {
    server: boolean;
    serverUi: boolean;
    vanillaData: boolean;
    math: boolean;
}

export interface ManifestModule {
    type: string;
    uuid: string;
    version: [number, number, number];
    description?: string;
    language?: string;
    entry?: string;
}

export interface ManifestDependency {
    uuid?: string;
    module_name?: string;
    version: string | [number, number, number];
}

export interface PackManifest {
    format_version: number;
    metadata: {
        authors: string[];
        product_type: string;
    };
    header: {
        name: string;
        description: string;
        pack_scope: string;
        uuid: string;
        version: [number, number, number];
        min_engine_version: [number, number, number];
    };
    capabilities: string[];
    modules: ManifestModule[];
    dependencies: ManifestDependency[];
}

export interface MinecraftDependencyVersions {
    server: string;
    serverUi: string;
    vanillaData: string;
    math: string;
}

export const VERSIONS = {
    minEngineVersion: [1, 26, 0] as [number, number, number],
    manifestFormat: 2,
    esbuildFilter: "0.3.0",
} as const;

export const DEFAULT_MINECRAFT_DEPENDENCY_VERSIONS: MinecraftDependencyVersions = {
    server: "2.6.0",
    serverUi: "2.0.0",
    vanillaData: "1.26.13",
    math: "2.4.0",
};

export const DEFAULT_SCRIPT_PACKAGES: ScriptPackages = {
    server: true,
    serverUi: false,
    vanillaData: false,
    math: false,
};

export function generateProjectId(projectName: string): string {
    return sanitizeIdentifier(projectName).slice(0, 10) || "sample";
}

export function sanitizeIdentifier(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
}

export function getMarketplaceScopeSegments(config: Pick<ProjectConfig, "identifier" | "projectId" | "useMarketplaceStructure">): string[] {
    return config.useMarketplaceStructure ? [config.identifier, config.projectId] : [];
}

export function getMarketplaceScopeLabel(config: Pick<ProjectConfig, "identifier" | "projectId">): string {
    return `${config.identifier}/${config.projectId}`;
}

export function getScriptDirectorySegments(config: Pick<ProjectConfig, "identifier" | "projectId">): string[] {
    return ["scripts", config.identifier, config.projectId];
}

export function getScriptEntryPath(config: Pick<ProjectConfig, "identifier" | "projectId">): string {
    return [...getScriptDirectorySegments(config), "main.js"].join("/");
}
