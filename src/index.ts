#!/usr/bin/env bun

import { outro, spinner } from "@clack/prompts";
import pc from "picocolors";
import { generateProject } from "./engine/generator.js";
import { setupAi } from "./provisioning/ai.js";
import { runProvisioning } from "./provisioning/tools.js";
import { showPostGeneration } from "./tui/display.js";
import { runWizard } from "./tui/wizard.js";

const teal = (value: string): string => `\x1b[38;2;47;208;181m${value}\x1b[39m`;

const config = await runWizard();

if (config === null) {
    process.exit(0);
}

const generation = spinner();
generation.start(teal("Generating your Bedrock addon scaffold..."));
await generateProject(config);

if (config.useAi) {
    await setupAi(config.destination);
}

await runProvisioning(config);
generation.stop(pc.green("Spawnpack scaffold generated."));
showPostGeneration(config);
outro(teal("Your addon is ready."));
