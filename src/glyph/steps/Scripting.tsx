import { Box, Button, Radio, Spacer, Text } from "@semos-labs/glyph";

import type { ScriptingChoice } from "../types.js";

interface Props {
    value: ScriptingChoice;
    onSelect: (value: ScriptingChoice) => void;
    onBack: () => void;
}

const items = [
    { label: "Manifest only", value: "none", hint: "No Script API files" },
    { label: "JavaScript", value: "javascript", hint: "Plain JS entrypoint" },
    { label: "TypeScript", value: "typescript", hint: "Recommended" },
] satisfies Array<{ label: string; value: ScriptingChoice; hint: string }>;

export function StepScripting({ value, onSelect, onBack }: Props) {
    return (
        <Box style={{ flexGrow: 1, flexDirection: "column", gap: 1 }}>
            <Text style={{ bold: true, color: "cyan" }}>Script API</Text>
            <Text style={{ dim: true }}>Use ↑ and ↓ to move. Press Enter or Space to choose and continue.</Text>
            <Spacer size={1} />
            <Radio<ScriptingChoice>
                items={items.map(item => ({
                    label: `${item.label} — ${item.hint}`,
                    value: item.value,
                }))}
                value={value}
                onChange={onSelect}
                direction="column"
                gap={1}
                style={{ flexDirection: "column", gap: 1 }}
                itemStyle={{ paddingLeft: 1 }}
                focusedItemStyle={{ underline: true }}
                selectedItemStyle={{ color: "green", bold: true }}
            />
            <Spacer size={1} />
            <Box style={{ flexDirection: "row", gap: 1 }}>
                <Button label="← Back" onPress={onBack} />
            </Box>
        </Box>
    );
}
