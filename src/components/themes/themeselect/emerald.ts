import { createMantineTheme } from "../../../lib/create-mantine-theme";
import { Theme } from "../../../lib/theme";

export const emerald: Theme = {
  label: "💎 Emerald",
  mantineTheme: createMantineTheme({
    baseHue: 140,
    baseSaturation: 35,
    colors: {
      primary: [
        "#e7fff0",
        "#d4ffe4",
        "#abffc7",
        "#7effa9",
        "#58ff8d",
        "#3fff75",
        "#31ff6b",
        "#23e859",
        "#1bd44d",
        "#0dbf3f",
      ],
      secondary: [
        "#e4fff4",
        "#d3ffe9",
        "#aaffd4",
        "#7cffbe",
        "#56ffaa",
        "#3effd9",
        "#2fffd0",
        "#20c0b8",
        "#17aaa3",
        "#03928d",
      ],
      tertiary: [
        "#f2f7f3",
        "#e5e8e6",
        "#c6d2c9",
        "#a4bdaa",
        "#87ab90",
        "#74a17f",
        "#6a9d76",
        "#598964",
        "#4e7b59",
        "#406d4b",
      ],
    },
  }),
}; 