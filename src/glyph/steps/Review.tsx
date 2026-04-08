import { Box, Button, Spacer, Text } from "@semos-labs/glyph";

import type { WizardState } from "../types.js";

interface Props {
    state: WizardState;
    onBack: () => void;
    onNext: () => void;
}

function formatPackages(state: WizardState): string {
    const packages: string[] = ["@minecraft/server"];

    if (state.scriptPackages.serverUi) packages.push("@minecraft/server-ui");
    if (state.scriptPackages.vanillaData) packages.push("@minecraft/vanilla-data");
    if (state.scriptPackages.math) packages.push("@minecraft/math");

    return packages.join(", ");
}

function yesNo(value: boolean): string {
    return value ? "Yes" : "No";
}

export function StepReview({ state, onBack, onNext }: Props) {
    return (
        <Box style={{ flexGrow: 1, flexDirection: "column", gap: 1 }}>
            <Text style={{ bold: true, color: "cyan" }}>Review configuration</Text>
            <Text style={{ dim: true }}>Make sure everything looks right before generation starts.</Text>
            <Spacer size={1} />
            <Box style={{ border: "round", borderColor: "cyan", padding: 2, flexDirection: "column", gap: 1 }}>
                <Text>Project name: {state.projectName}</Text>
                <Text>Author: {state.author || "(none)"}</Text>
                <Text>Namespace: {state.namespace}</Text>
                <Text>Identifier: {state.identifier}</Text>
                <Text>Project ID: {state.projectId}</Text>
                <Text>Destination: {state.destination}</Text>
                <Text>Scripting: {state.scripting}</Text>
                {state.scripting !== "none" ? <Text>Packages: {formatPackages(state)}</Text> : null}
                {state.scripting !== "none" ? <Text>Use RGL: {yesNo(state.useRgl)}</Text> : null}
                <Text>Install Rockide: {yesNo(state.installRockide)}</Text>
                <Text>Set up AI: {yesNo(state.useAi)}</Text>
            </Box>
            <Spacer size={1} />
            <Box style={{ flexDirection: "row", gap: 1 }}>
                <Button label="← Back" onPress={onBack} />
                <Button label="Generate →" onPress={onNext} />
            </Box>
        </Box>
    );
}
