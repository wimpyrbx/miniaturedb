import { createMantineTheme } from "../lib/create-mantine-theme";
import { Theme } from "../lib/theme";

export const sunset: Theme = {
  label: "🌅 Sunset",
  mantineTheme: createMantineTheme({
    baseHue: 20,
    baseSaturation: 40,
    colors: {
      primary: [
        "#fff1e6",
        "#ffe0cc",
        "#ffc199",
        "#ffa266",
        "#ff8333",
        "#ff6400",
        "#d15200",
        "#a34000",
        "#752e00",
        "#471c00",
      ],
      secondary: [
        "#fff5e6",
        "#ffeacc",
        "#ffd599",
        "#ffc066",
        "#ffab33",
        "#ff9600",
        "#d17a00",
        "#a35e00",
        "#754300",
        "#472800",
      ],
      tertiary: [
        "#ffede6",
        "#ffdacc",
        "#ffb599",
        "#ff9066",
        "#ff6b33",
        "#ff4600",
        "#d13800",
        "#a32b00",
        "#751f00",
        "#471200",
      ],
    },
  }),
}; 