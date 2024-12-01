import { createMantineTheme } from "../../../lib/create-mantine-theme";
import { Theme } from "../../../lib/theme";

export const graphite: Theme = {
  label: "⚫ Graphite",
  mantineTheme: createMantineTheme({
    baseHue: 210,
    baseSaturation: 10,
    colors: {
      primary: [
        "#f2f3f4",
        "#e5e7e9",
        "#c9ccd1",
        "#adb2b9",
        "#9299a3",
        "#7f8793",
        "#757e8b",
        "#646d7a",
        "#596272",
        "#4c5666",
      ],
      secondary: [
        "#f4f5f7",
        "#e9ebee",
        "#d1d5db",
        "#b9bfc8",
        "#a3aab7",
        "#939ba9",
        "#8b93a2",
        "#7a8291",
        "#727989",
        "#666e7c",
      ],
      tertiary: [
        "#f2f2f4",
        "#e5e5e7",
        "#c9c9cc",
        "#adaeb2",
        "#929399",
        "#7f8085",
        "#757678",
        "#646567",
        "#59595c",
        "#4c4c4f",
      ],
    },
  }),
}; 