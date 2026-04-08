import { useEffect, useState } from "react";
import { Box, Spacer, Spinner, Text } from "@semos-labs/glyph";

import { generateProject } from "../../engine/generator.js";
import { setupAi } from "../../provisioning/ai.js";
import { runProvisioning } from "../../provisioning/tools.js";
import type { ProjectConfig } from "../types.js";

interface Props {
    config: ProjectConfig;
}

interface ProvisioningResults {
    rgl: boolean | null;
    rockide: boolean | null;
    dependencies: boolean | null;
}

function statusLine(label: string, value: boolean | null): string {
    if (value === null) {
        return `${label}: skipped`;
    }

    return `${label}: ${value ? "done" : "failed"}`;
}

export function StepGenerating({ config }: Props) {
    const [status, setStatus] = useState("Preparing scaffold...");
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<ProvisioningResults | null>(null);

    useEffect(() => {
        let cancelled = false;

        const generate = async () => {
            try {
                setStatus("Creating directory structure...");
                await Bun.sleep(100);
                if (cancelled) return;

                await generateProject(config);
                if (cancelled) return;

                if (config.useAi) {
                    setStatus("Setting up AI environment...");
                    await setupAi(config.destination);
                    if (cancelled) return;
                }

                if (config.useRgl || config.installRockide || config.scripting !== "none") {
                    setStatus("Installing tooling...");
                    const provisioningResults = await runProvisioning(config);
                    if (cancelled) return;
                    setResults(provisioningResults);
                }

                setStatus("Done!");
                setDone(true);
            } catch (cause) {
                if (!cancelled) {
                    setError(cause instanceof Error ? cause.message : "Unknown error");
                }
            }
        };

        void generate();

        return () => {
            cancelled = true;
        };
    }, [config]);

    return (
        <Box style={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 2 }}>
            <Box style={{ border: "round", borderColor: error ? "red" : done ? "green" : "cyan", padding: 3, width: 64, alignItems: "center" }}>
                {done ? (
                    <>
                        <Text style={{ bold: true, color: "green" }}>✓ Generation complete</Text>
                        <Spacer size={1} />
                        <Text>{config.projectName}</Text>
                        <Text style={{ dim: true }}>ready at {config.destination}</Text>
                        {results ? (
                            <>
                                <Spacer size={1} />
                                <Text style={{ dim: true }}>{statusLine("RGL", results.rgl)}</Text>
                                <Text style={{ dim: true }}>{statusLine("Rockide", results.rockide)}</Text>
                                <Text style={{ dim: true }}>{statusLine("Dependencies", results.dependencies)}</Text>
                            </>
                        ) : null}
                        <Spacer size={1} />
                        <Text style={{ dim: true }}>You can close the app and start building.</Text>
                    </>
                ) : error ? (
                    <>
                        <Text style={{ bold: true, color: "red" }}>Generation failed</Text>
                        <Spacer size={1} />
                        <Text style={{ color: "red" }}>{error}</Text>
                    </>
                ) : (
                    <Spinner label={status} />
                )}
            </Box>
        </Box>
    );
}
