export type { ProjectConfig, ScriptPackages, ScriptingChoice } from "../config.js";

import type { ScriptPackages, ScriptingChoice } from "../config.js";

export interface WizardState {
    step: number;
    projectName: string;
    author: string;
    namespace: string;
    identifier: string;
    projectId: string;
    destination: string;
    scripting: ScriptingChoice;
    scriptPackages: ScriptPackages;
    useRgl: boolean;
    useAi: boolean;
    installRockide: boolean;
}

export const initialWizardState: WizardState = {
    step: 1,
    projectName: "",
    author: "",
    namespace: "",
    identifier: "",
    projectId: "",
    destination: process.cwd(),
    scripting: "typescript",
    scriptPackages: {
        server: true,
        serverUi: true,
        vanillaData: true,
        math: true,
    },
    useRgl: true,
    useAi: false,
    installRockide: true,
};
