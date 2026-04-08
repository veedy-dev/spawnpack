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

export function StepNamespace({ value, suggested, onChange, onNext, onBack }: Props) {
    const [error, setError] = useState("");
    const suggestion = useMemo(() => {
        const normalized = sanitizeIdentifier(suggested).replace(/-/g, "_");
        return normalized || "my_addon";
    }, [suggested]);

    const handleNext = () => {
        const nextValue = (value.trim() || suggestion).trim();

        if (!/^[a-z0-9_]+$/.test(nextValue)) {
            setError("Use lowercase letters, numbers, and underscores only.");
            return;
        }

        setError("");
        onChange(nextValue);
        onNext();
    };

    return (
        <Box style={{ flexGrow: 1, flexDirection: "column", gap: 1 }}>
            <Text style={{ bold: true, color: "cyan" }}>Namespace</Text>
            <Text style={{ dim: true }}>Used in identifiers like namespace:item_name.</Text>
            <Spacer size={1} />
            <Input
                value={value}
                onChange={nextValue => {
                    setError("");
                    onChange(nextValue);
                }}
                placeholder={suggestion}
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
            <Text style={{ dim: true }}>Leave it empty to use {suggestion}.</Text>
            <Spacer size={1} />
            <Box style={{ flexDirection: "row", gap: 1 }}>
                <Button label="← Back" onPress={onBack} />
                <Button label="Next →" onPress={handleNext} />
            </Box>
        </Box>
    );
}
