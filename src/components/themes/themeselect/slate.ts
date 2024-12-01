import { createMantineTheme } from "../../../lib/create-mantine-theme";
import { Theme } from "../../../lib/theme";

export const slate: Theme = {
  label: "🌫️ Slate",
  mantineTheme: createMantineTheme({
    baseHue: 215,
    baseSaturation: 15,
    colors: {
      primary: [
        "#f1f4f8",
        "#e3e9f0",
        "#c7d2e1",
        "#aabbd2",
        "#90a7c4",
        "#7d98ba",
        "#738fb3",
        "#627ca0",
        "#576f92",
        "#495f80",
      ],
      secondary: [
        "#f3f6f9",
        "#e7edf3",
        "#ccd8e6",
        "#b1c4d9",
        "#99b3cd",
        "#88a5c4",
        "#7f9cbd",
        "#6d87a8",
        "#627a99",
        "#546987",
      ],
      tertiary: [
        "#f2f4f6",
        "#e5e8ec",
        "#c9ced6",
        "#adb4c0",
        "#9299a8",
        "#7f8696",
        "#757d8e",
        "#646b7b",
        "#595f6e",
        "#4c515e",
      ],
    },
  }),
}; 