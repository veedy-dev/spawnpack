import { useState } from "react";
import { Box, Button, Input, Spacer, Text } from "@semos-labs/glyph";

interface Props {
    value: string;
    onChange: (value: string) => void;
    onNext: () => void;
    onBack?: () => void;
}

export function StepProjectName({ value, onChange, onNext, onBack }: Props) {
    const [error, setError] = useState("");

    const handleNext = () => {
        const trimmed = value.trim();

        if (!trimmed) {
            setError("Project name is required.");
            return;
        }

        if (/[<>:\"/\\|?*]/.test(trimmed)) {
            setError("Invalid characters.");
            return;
        }

        if (trimmed.length > 64) {
            setError("Max 64 characters.");
            return;
        }

        setError("");
        onNext();
    };

    return (
        <Box style={{ flexGrow: 1, flexDirection: "column", gap: 2 }}>
            <Text>What should we call your addon project?</Text>
            <Input
                value={value}
                onChange={nextValue => {
                    setError("");
                    onChange(nextValue);
                }}
                placeholder="My Cool Addon"
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
            <Text style={{ dim: true }}>Use something readable. We will derive sensible defaults from it in the next steps.</Text>
            <Spacer size={1} />
            <Box style={{ flexDirection: "row", gap: 1 }}>
                {onBack ? <Button label="← Back" onPress={onBack} /> : null}
                <Button label="Next →" onPress={handleNext} />
            </Box>
        </Box>
    );
}
