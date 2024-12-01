import { createMantineTheme } from "../../../lib/create-mantine-theme";
import { Theme } from "../../../lib/theme";

export const ocean: Theme = {
  label: "🌊 Ocean",
  mantineTheme: createMantineTheme({
    baseHue: 200,
    baseSaturation: 30,
    colors: {
      primary: [
        "#e6f4ff",
        "#cce4ff",
        "#99c9ff",
        "#66adff",
        "#3392ff",
        "#0077ff",
        "#0061d1",
        "#004ba3",
        "#003575",
        "#001f47",
      ],
      secondary: [
        "#e6fbff",
        "#ccf7ff",
        "#99efff",
        "#66e7ff",
        "#33dfff",
        "#00d7ff",
        "#00acd1",
        "#0081a3",
        "#005675",
        "#002b47",
      ],
      tertiary: [
        "#f2f7ff",
        "#e5eeff",
        "#ccdcff",
        "#b2cbff",
        "#99b9ff",
        "#80a7ff",
        "#6695ff",
        "#4d84ff",
        "#3372ff",
        "#1a61ff",
      ],
    },
  }),
}; 