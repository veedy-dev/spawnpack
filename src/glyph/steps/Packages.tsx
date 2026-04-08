import { Box, Button, Checkbox, Spacer, Text } from "@semos-labs/glyph";

import type { ScriptPackages } from "../types.js";

interface Props {
    value: ScriptPackages;
    onChange: (value: ScriptPackages) => void;
    onNext: () => void;
    onBack: () => void;
}

export function StepPackages({ value, onChange, onNext, onBack }: Props) {
    const update = (key: keyof ScriptPackages, checked: boolean) => {
        onChange({ ...value, [key]: checked });
    };

    return (
        <Box style={{ flexGrow: 1, flexDirection: "column", gap: 1 }}>
            <Text style={{ bold: true, color: "cyan" }}>Script packages</Text>
            <Text style={{ dim: true }}>Pick the Minecraft packages to include in package.json.</Text>
            <Spacer size={1} />
            <Checkbox checked label="@minecraft/server" onChange={() => undefined} disabled style={{ bold: true }} />
            <Text style={{ dim: true }}>The server package is always included when scripting is enabled.</Text>
            <Checkbox checked={value.serverUi} label="@minecraft/server-ui" onChange={checked => update("serverUi", checked)} />
            <Checkbox checked={value.vanillaData} label="@minecraft/vanilla-data" onChange={checked => update("vanillaData", checked)} />
            <Checkbox checked={value.math} label="@minecraft/math" onChange={checked => update("math", checked)} />
            <Spacer size={1} />
            <Box style={{ flexDirection: "row", gap: 1 }}>
                <Button label="← Back" onPress={onBack} />
                <Button label="Next →" onPress={onNext} />
            </Box>
        </Box>
    );
}
