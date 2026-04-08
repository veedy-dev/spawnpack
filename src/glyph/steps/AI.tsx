import { Box, Button, Checkbox, Spacer, Text } from "@semos-labs/glyph";

interface Props {
    value: boolean;
    onChange: (value: boolean) => void;
    onNext: () => void;
    onBack: () => void;
}

export function StepAI({ value, onChange, onNext, onBack }: Props) {
    return (
        <Box style={{ flexGrow: 1, flexDirection: "column", gap: 1 }}>
            <Text style={{ bold: true, color: "cyan" }}>AI environment</Text>
            <Text style={{ dim: true }}>Generate AI-friendly project guidance and MCP config.</Text>
            <Spacer size={1} />
            <Checkbox checked={value} label="Set up AI development environment" onChange={onChange} />
            <Text style={{ dim: true }}>Creates CLAUDE.md and related Bedrock development tooling files.</Text>
            <Spacer size={1} />
            <Box style={{ flexDirection: "row", gap: 1 }}>
                <Button label="← Back" onPress={onBack} />
                <Button label="Next →" onPress={onNext} />
            </Box>
        </Box>
    );
}
