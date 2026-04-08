import { resolve } from "node:path";
import { useMemo, useState } from "react";
import { Box, Button, Input, Spacer, Text } from "@semos-labs/glyph";

import { sanitizeIdentifier } from "../../config.js";

interface Props {
    value: string;
    suggested: string;
    onChange: (value: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export function StepDestination({ value, suggested, onChange, onNext, onBack }: Props) {
    const [error, setError] = useState("");
    const cwd = process.cwd();
    const projectFolder = useMemo(() => {
        const slug = sanitizeIdentifier(suggested).replace(/_/g, "-") || "my-addon";
        return resolve(cwd, slug);
    }, [cwd, suggested]);

    const handleNext = () => {
        const nextValue = (value.trim() || cwd).trim();

        if (/[<>"|?*]/.test(nextValue)) {
            setError("Invalid characters in path.");
            return;
        }

        if (nextValue.length > 240) {
            setError("Path is too long.");
            return;
        }

        setError("");
        onChange(nextValue);
        onNext();
    };

    return (
        <Box style={{ flexGrow: 1, flexDirection: "column", gap: 1 }}>
            <Text style={{ bold: true, color: "cyan" }}>Destination</Text>
            <Text style={{ dim: true }}>Paste a folder path from Explorer or use one of the quick picks below.</Text>
            <Spacer size={1} />
            <Input
                value={value}
                onChange={nextValue => {
                    setError("");
                    onChange(nextValue);
                }}
                placeholder={cwd}
                style={{ border: "round", paddingX: 1 }}
                focusedStyle={{ borderColor: "cyan" }}
                autoFocus
                onKeyPress={key => {
                    if (key.name === "return") {
                        handleNext();
                        return true;
                    }

                    return undefined;
                }}
            />
            {error ? <Text style={{ color: "red", bold: true }}>{error}</Text> : null}
            <Text style={{ dim: true }}>Quick picks</Text>
            <Box style={{ flexDirection: "column", gap: 1 }}>
                <Button label="Use current folder" onPress={() => onChange(cwd)} />
                <Text style={{ dim: true }}>{cwd}</Text>
                <Button label="Create project subfolder" onPress={() => onChange(projectFolder)} />
                <Text style={{ dim: true }}>{projectFolder}</Text>
            </Box>
            <Text style={{ dim: true }}>Press Enter with an empty field to use the current folder.</Text>
            <Spacer size={1} />
            <Box style={{ flexDirection: "row", gap: 1 }}>
                <Button label="← Back" onPress={onBack} />
                <Button label="Next →" onPress={handleNext} />
            </Box>
        </Box>
    );
}
