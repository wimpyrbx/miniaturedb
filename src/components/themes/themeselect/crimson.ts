import { createMantineTheme } from "../../../lib/create-mantine-theme";
import { Theme } from "../../../lib/theme";

export const crimson: Theme = {
  label: "🌹 Crimson",
  mantineTheme: createMantineTheme({
    baseHue: 0,
    baseSaturation: 30,
    colors: {
      primary: [
        "#fff0f0",
        "#ffe4e4",
        "#ffc7c7",
        "#ffa9a9",
        "#ff8d8d",
        "#ff7777",
        "#ff6868",
        "#e85151",
        "#d44141",
        "#bf2e2e",
      ],
      secondary: [
        "#fff4f0",
        "#ffe9e4",
        "#ffd4c7",
        "#ffbea9",
        "#ffaa8d",
        "#ff9977",
        "#ff8d68",
        "#e87651",
        "#d46441",
        "#bf4e2e",
      ],
      tertiary: [
        "#f7f2f2",
        "#e8e5e5",
        "#d2c9c9",
        "#bdaaaa",
        "#ab9090",
        "#a17f7f",
        "#9d7676",
        "#896464",
        "#7b5959",
        "#6d4b4b",
      ],
    },
  }),
}; 