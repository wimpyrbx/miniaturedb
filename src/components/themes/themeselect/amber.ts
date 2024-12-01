import { createMantineTheme } from "../../../lib/create-mantine-theme";
import { Theme } from "../../../lib/theme";

export const amber: Theme = {
  label: "🌅 Amber",
  mantineTheme: createMantineTheme({
    baseHue: 45,
    baseSaturation: 40,
    colors: {
      primary: [
        "#fff8e7",
        "#fff2d4",
        "#ffe4ab",
        "#ffd57e",
        "#ffc758",
        "#ffbc3f",
        "#ffb631",
        "#e89e23",
        "#d48b1b",
        "#bf760d",
      ],
      secondary: [
        "#fff4e4",
        "#ffe9d3",
        "#ffd4aa",
        "#ffbe7c",
        "#ffaa56",
        "#ff993e",
        "#ff8d2f",
        "#e87620",
        "#d46417",
        "#bf4e03",
      ],
      tertiary: [
        "#f7f5f2",
        "#e8e6e5",
        "#d2ccc6",
        "#bdaea4",
        "#ab9587",
        "#a1827f",
        "#9d7876",
        "#896459",
        "#7b594e",
        "#6d4b40",
      ],
    },
  }),
}; 