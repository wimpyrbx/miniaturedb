import { createMantineTheme } from "../../../lib/create-mantine-theme";
import { Theme } from "../../../lib/theme";

export const sapphire: Theme = {
  label: "💠 Sapphire",
  mantineTheme: createMantineTheme({
    baseHue: 220,
    baseSaturation: 35,
    colors: {
      primary: [
        "#e7f0ff",
        "#d4e4ff",
        "#abc7ff",
        "#7ea9ff",
        "#588dff",
        "#3f77ff",
        "#3168ff",
        "#2351e8",
        "#1b41d4",
        "#0d2ebf",
      ],
      secondary: [
        "#e4f4ff",
        "#d3e9ff",
        "#aadbff",
        "#7cceff",
        "#56c2ff",
        "#3eb8ff",
        "#2fb2ff",
        "#209be8",
        "#178bd4",
        "#0377bf",
      ],
      tertiary: [
        "#f2f3f7",
        "#e5e6e8",
        "#c6c9d2",
        "#a4aabd",
        "#8790ab",
        "#747fa1",
        "#6a769d",
        "#596489",
        "#4e597b",
        "#404b6d",
      ],
    },
  }),
}; 