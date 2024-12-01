import { createMantineTheme } from "../../../lib/create-mantine-theme";
import { Theme } from "../../../lib/theme";

export const lavender: Theme = {
  label: "🌸 Lavender",
  mantineTheme: createMantineTheme({
    baseHue: 280,
    baseSaturation: 25,
    colors: {
      primary: [
        "#f9f0ff",
        "#f3e4ff",
        "#e4c7ff",
        "#d5a9ff",
        "#c78dff",
        "#bc77ff",
        "#b668ff",
        "#9e51e8",
        "#8c41d4",
        "#762ebf",
      ],
      secondary: [
        "#fff0f9",
        "#ffe4f3",
        "#ffc7e4",
        "#ffa9d5",
        "#ff8dc7",
        "#ff77bc",
        "#ff68b6",
        "#e851a0",
        "#d4418c",
        "#bf2e76",
      ],
      tertiary: [
        "#f2f2f7",
        "#e5e5e8",
        "#c6c6d2",
        "#a4a4bd",
        "#8787ab",
        "#7474a1",
        "#6a6a9d",
        "#595989",
        "#4e4e7b",
        "#40406d",
      ],
    },
  }),
}; 