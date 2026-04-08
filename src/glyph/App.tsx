import { type AppHandle, Box, FocusScope, JumpNav, render } from "@semos-labs/glyph";

import { Wizard } from "./Wizard.js";

function App() {
    return (
        <FocusScope trap>
            <JumpNav activationKey="ctrl+o">
                <Box style={{ flexDirection: "column" }}>
                    <Wizard />
                </Box>
            </JumpNav>
        </FocusScope>
    );
}

export function runApp(): AppHandle {
    return render(<App />);
}
