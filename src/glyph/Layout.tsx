import type { ReactNode } from "react";
import { Box, Spacer, Text } from "@semos-labs/glyph";

interface LayoutProps {
    step: number;
    totalSteps: number;
    title?: string;
    children: ReactNode;
}

type ViewportSize = "small" | "medium" | "large";

function getTerminalWidth(): number {
    return process.stdout.columns ?? 80;
}

function getTerminalHeight(): number {
    return process.stdout.rows ?? 24;
}

function getViewportSize(width: number): ViewportSize {
    if (width < 50) {
        return "small";
    }
    if (width < 80) {
        return "medium";
    }
    return "large";
}

function getMaxContentWidth(viewportSize: ViewportSize): number {
    switch (viewportSize) {
        case "small":
            return 38;
        case "medium":
            return 46;
        case "large":
            return 54;
    }
}

export function Layout({ step, totalSteps, title, children }: LayoutProps) {
    const width = getTerminalWidth();
    const height = getTerminalHeight();
    const viewportSize = getViewportSize(width);
    const isSmall = viewportSize === "small";
    const isShort = height < 26;

    const contentPaddingX = isSmall ? 1 : 2;
    const contentPaddingY = isShort ? 0 : 1;
    const maxContentWidth = getMaxContentWidth(viewportSize);

    const headerLabel = isSmall
        ? `${step}/${totalSteps}${title ? ` ${title}` : ""}`
        : `Step ${step} of ${totalSteps}${title ? ` · ${title}` : ""}`;

    const shortcuts = isSmall
        ? ["[enter] next", "[esc] back"]
        : ["[↑↓] move", "[enter] confirm", "[esc] back"];

    return (
        <Box style={{ flexDirection: "column" }}>
            <Box
                style={{
                    bg: "cyan",
                    paddingX: 1,
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                <Text style={{ bold: true, color: "white" }}>spawnpack</Text>
                <Spacer />
                <Text style={{ color: "white" }}>{headerLabel}</Text>
            </Box>

            <Box
                style={{
                    paddingLeft: contentPaddingX,
                    paddingRight: contentPaddingX,
                    paddingTop: contentPaddingY,
                    paddingBottom: contentPaddingY,
                    flexDirection: "column",
                    maxWidth: maxContentWidth,
                    gap: isShort ? 0 : 1,
                }}
            >
                {children}
            </Box>

            {isShort ? null : (
                <Box
                    style={{
                        paddingX: 1,
                        flexDirection: "row",
                        gap: 1,
                        alignItems: "center",
                    }}
                >
                    {shortcuts.map(shortcut => (
                        <Text key={shortcut} style={{ dim: true }}>
                            {shortcut}
                        </Text>
                    ))}
                    <Spacer />
                    {!isSmall && <Text style={{ dim: true }}>spawnpack</Text>}
                </Box>
            )}
        </Box>
    );
}
