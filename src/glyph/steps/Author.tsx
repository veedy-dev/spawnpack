import { Box, Button, Input, Spacer, Text } from "@semos-labs/glyph";

interface Props {
    value: string;
    onChange: (value: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export function StepAuthor({ value, onChange, onNext, onBack }: Props) {
    return (
        <Box style={{ flexGrow: 1, flexDirection: "column", gap: 1 }}>
            <Text style={{ bold: true, color: "cyan" }}>Author</Text>
            <Text style={{ dim: true }}>Optional. Add your name, studio, or team.</Text>
            <Spacer size={1} />
            <Input
                value={value}
                onChange={onChange}
                placeholder="Your Name or Studio"
                style={{ border: "round", paddingX: 1 }}
                focusedStyle={{ borderColor: "cyan" }}
                autoFocus
                onKeyPress={key => {
                    if (key.name === "return") {
                        onNext();
                        return true;
                    }

                    return undefined;
                }}
            />
            <Text style={{ dim: true }}>Leave blank if you do not want author metadata.</Text>
            <Spacer size={1} />
            <Box style={{ flexDirection: "row", gap: 1 }}>
                <Button label="← Back" onPress={onBack} />
                <Button label="Next →" onPress={onNext} />
            </Box>
        </Box>
    );
}
