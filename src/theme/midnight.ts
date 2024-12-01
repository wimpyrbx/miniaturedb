import { createMantineTheme } from "../lib/create-mantine-theme";
import { Theme } from "../lib/theme";

export const midnight: Theme = {
  label: "🌙 Midnight",
  mantineTheme: createMantineTheme({
    baseHue: 240,
    baseSaturation: 35,
    colors: {
      primary: [
        "#eeeeff",
        "#ddddff",
        "#bbbbff",
        "#9999ff",
        "#7777ff",
        "#5555ff",
        "#4444cc",
        "#333399",
        "#222266",
        "#111133",
      ],
      secondary: [
        "#f2e6ff",
        "#e6ccff",
        "#cc99ff",
        "#b366ff",
        "#9933ff",
        "#8000ff",
        "#6600cc",
        "#4d0099",
        "#330066",
        "#1a0033",
      ],
      tertiary: [
        "#e6e6ff",
        "#ccccff",
        "#9999ff",
        "#6666ff",
        "#3333ff",
        "#0000ff",
        "#0000cc",
        "#000099",
        "#000066",
        "#000033",
      ],
    },
  }),
}; 