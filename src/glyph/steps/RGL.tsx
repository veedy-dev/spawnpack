import { Box, Button, Checkbox, Spacer, Text } from "@semos-labs/glyph";

interface Props {
    value: boolean;
    onChange: (value: boolean) => void;
    onNext: () => void;
    onBack: () => void;
}

export function StepRGL({ value, onChange, onNext, onBack }: Props) {
    return (
        <Box style={{ flexGrow: 1, flexDirection: "column", gap: 1 }}>
            <Text style={{ bold: true, color: "cyan" }}>RGL compiler</Text>
            <Text style={{ dim: true }}>Optional but recommended for script-based projects.</Text>
            <Spacer size={1} />
            <Checkbox checked={value} label="Use RGL compiler" onChange={onChange} />
            <Text style={{ dim: true }}>RGL can build Bedrock addons much faster than Regolith.</Text>
            <Spacer size={1} />
            <Box style={{ flexDirection: "row", gap: 1 }}>
                <Button label="← Back" onPress={onBack} />
                <Button label="Next →" onPress={onNext} />
            </Box>
        </Box>
    );
}
