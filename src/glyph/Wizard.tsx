import { useMemo, useState } from "react";
import { Keybind } from "@semos-labs/glyph";

import type { ProjectConfig, ScriptingChoice } from "../config.js";
import { Layout } from "./Layout.js";
import { StepAI } from "./steps/AI.js";
import { StepAuthor } from "./steps/Author.js";
import { StepDestination } from "./steps/Destination.js";
import { StepGenerating } from "./steps/Generating.js";
import { StepIdentifier } from "./steps/Identifier.js";
import { StepNamespace } from "./steps/Namespace.js";
import { StepPackages } from "./steps/Packages.js";
import { StepProjectId } from "./steps/ProjectId.js";
import { StepProjectName } from "./steps/ProjectName.js";
import { StepReview } from "./steps/Review.js";
import { StepRGL } from "./steps/RGL.js";
import { StepRockide } from "./steps/Rockide.js";
import { StepScripting } from "./steps/Scripting.js";
import { type WizardState, initialWizardState } from "./types.js";

const TOTAL_STEPS = 11;
const REVIEW_STEP = 12;
const GENERATING_STEP = 13;

function buildConfig(state: WizardState): ProjectConfig {
    return {
        projectName: state.projectName.trim(),
        author: state.author.trim(),
        namespace: state.namespace.trim(),
        identifier: state.identifier.trim(),
        projectId: state.projectId.trim(),
        destination: state.destination.trim(),
        scripting: state.scripting,
        scriptPackages: { ...state.scriptPackages, server: true },
        useRgl: state.scripting === "none" ? false : state.useRgl,
        useAi: state.useAi,
        installRockide: state.installRockide,
    };
}

function getStepTitle(step: number): string {
    switch (step) {
        case 1:
            return "Project Name";
        case 2:
            return "Author";
        case 3:
            return "Namespace";
        case 4:
            return "Identifier";
        case 5:
            return "Project ID";
        case 6:
            return "Destination";
        case 7:
            return "Script API";
        case 8:
            return "Packages";
        case 9:
            return "RGL";
        case 10:
            return "Rockide";
        case 11:
            return "AI";
        case REVIEW_STEP:
            return "Review";
        default:
            return "Generating";
    }
}

function getNextStep(state: WizardState): number | null {
    switch (state.step) {
        case 1:
            return 2;
        case 2:
            return 3;
        case 3:
            return 4;
        case 4:
            return 5;
        case 5:
            return 6;
        case 6:
            return 7;
        case 7:
            return state.scripting === "none" ? 10 : 8;
        case 8:
            return 9;
        case 9:
            return 10;
        case 10:
            return 11;
        case 11:
            return REVIEW_STEP;
        case REVIEW_STEP:
            return GENERATING_STEP;
        default:
            return null;
    }
}

function getPreviousStep(state: WizardState): number | null {
    switch (state.step) {
        case 1:
            return null;
        case 2:
            return 1;
        case 3:
            return 2;
        case 4:
            return 3;
        case 5:
            return 4;
        case 6:
            return 5;
        case 7:
            return 6;
        case 8:
            return 7;
        case 9:
            return 8;
        case 10:
            return state.scripting === "none" ? 7 : 9;
        case 11:
            return 10;
        case REVIEW_STEP:
            return 11;
        default:
            return null;
    }
}

function getLayoutStep(step: number): number {
    if (step >= REVIEW_STEP) {
        return TOTAL_STEPS;
    }

    return step;
}

export function Wizard() {
    const [state, setState] = useState<WizardState>(initialWizardState);

    const update = (partial: Partial<WizardState>) => {
        setState(current => ({ ...current, ...partial }));
    };

    const config = useMemo(() => buildConfig(state), [state]);

    const goNext = () => {
        const nextStep = getNextStep(state);

        if (nextStep !== null) {
            update({ step: nextStep });
        }
    };

    const goBack = () => {
        const previousStep = getPreviousStep(state);

        if (previousStep !== null) {
            update({ step: previousStep });
        }
    };

    const handleScriptingSelect = (scripting: ScriptingChoice) => {
        setState(current => ({
            ...current,
            scripting,
            useRgl: scripting === "none" ? false : current.useRgl,
            step: scripting === "none" ? 10 : 8,
        }));
    };

    const content = (() => {
        switch (state.step) {
            case 1:
                return <StepProjectName value={state.projectName} onChange={projectName => update({ projectName })} onNext={goNext} />;
            case 2:
                return <StepAuthor value={state.author} onChange={author => update({ author })} onBack={goBack} onNext={goNext} />;
            case 3:
                return (
                    <StepNamespace
                        value={state.namespace}
                        suggested={state.projectName}
                        onChange={namespace => update({ namespace })}
                        onBack={goBack}
                        onNext={goNext}
                    />
                );
            case 4:
                return (
                    <StepIdentifier
                        value={state.identifier}
                        suggested={state.projectName}
                        onChange={identifier => update({ identifier })}
                        onBack={goBack}
                        onNext={goNext}
                    />
                );
            case 5:
                return <StepProjectId value={state.projectId} suggested={state.projectName} onChange={projectId => update({ projectId })} onBack={goBack} onNext={goNext} />;
            case 6:
                return <StepDestination value={state.destination} suggested={state.projectName} onChange={destination => update({ destination })} onBack={goBack} onNext={goNext} />;
            case 7:
                return <StepScripting value={state.scripting} onSelect={handleScriptingSelect} onBack={goBack} />;
            case 8:
                return (
                    <StepPackages
                        value={state.scriptPackages}
                        onChange={scriptPackages => update({ scriptPackages: { ...scriptPackages, server: true } })}
                        onBack={goBack}
                        onNext={goNext}
                    />
                );
            case 9:
                return <StepRGL value={state.useRgl} onChange={useRgl => update({ useRgl })} onBack={goBack} onNext={goNext} />;
            case 10:
                return <StepRockide value={state.installRockide} onChange={installRockide => update({ installRockide })} onBack={goBack} onNext={goNext} />;
            case 11:
                return <StepAI value={state.useAi} onChange={useAi => update({ useAi })} onBack={goBack} onNext={goNext} />;
            case REVIEW_STEP:
                return <StepReview state={state} onBack={goBack} onNext={goNext} />;
            case GENERATING_STEP:
                return <StepGenerating config={config} />;
            default:
                return null;
        }
    })();

    const canGoBack = getPreviousStep(state) !== null;
    const title = getStepTitle(state.step);
    const layoutStep = getLayoutStep(state.step);

    return (
        <Layout step={layoutStep} totalSteps={TOTAL_STEPS} title={title}>
            {canGoBack ? <Keybind keypress="escape" onPress={goBack} global /> : null}
            {content}
        </Layout>
    );
}
