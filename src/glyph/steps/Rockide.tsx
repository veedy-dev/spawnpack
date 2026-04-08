import { Box, Button, Checkbox, Spacer, Text } from "@semos-labs/glyph";

interface Props {
    value: boolean;
    onChange: (value: boolean) => void;
    onNext: () => void;
    onBack: () => void;
}

export function StepRockide({ value, onChange, onNext, onBack }: Props) {
    return (
        <Box style={{ flexGrow: 1, flexDirection: "column", gap: 1 }}>
            <Text style={{ bold: true, color: "cyan" }}>Rockide extension</Text>
            <Text style={{ dim: true }}>Set up editor tooling for Bedrock JSON files.</Text>
            <Spacer size={1} />
            <Checkbox checked={value} label="Install Rockide VSCode extension" onChange={onChange} />
            <Text style={{ dim: true }}>Adds schema-aware autocompletion and validation for addon JSON.</Text>
            <Spacer size={1} />
            <Box style={{ flexDirection: "row", gap: 1 }}>
                <Button label="← Back" onPress={onBack} />
                <Button label="Next →" onPress={onNext} />
            </Box>
        </Box>
    );
}
