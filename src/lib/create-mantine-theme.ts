import {
  createTheme,
  DEFAULT_THEME,
  DefaultMantineColor,
  MantineColorsTuple,
  MantineThemeOverride,
  mergeMantineTheme,
} from "@mantine/core";

type CustomColor = "primary" | "secondary" | "tertiary" | DefaultMantineColor;

/**
 * Adds the primary, secondary and tertiary colors to the MantineThemeColors interface for type safety
 */
declare module "@mantine/core" {
  export interface MantineThemeColorsOverride {
    colors: Record<CustomColor, MantineColorsTuple>;
  }
}

type createMantineThemeProps = {
  baseHue: number;
  baseSaturation: number;
  colors: {
    primary: MantineColorsTuple;
    secondary: MantineColorsTuple;
    tertiary: MantineColorsTuple;
  };
} & Omit<MantineThemeOverride, "colors">;

/**
 * Creates a Mantine theme with the specified base hue/saturation and primary, secondary and
 * tertiary colors.
 */
export function createMantineTheme({
  baseHue,
  baseSaturation,
  colors,
  ...custom
}: createMantineThemeProps) {
  if (baseHue < 0 || baseHue > 360) {
    throw new Error("Hue must be between 0 and 360");
  }

  if (baseSaturation < 0 || baseSaturation > 100) {
    throw new Error("Saturation must be between 0 and 100");
  }

  return mergeMantineTheme(
    DEFAULT_THEME,
    createTheme({
      colors: {
        ...colors,
        dark: [
          `hsl(${baseHue} ${baseSaturation}% 95%)`,
          `hsl(${baseHue} ${baseSaturation}% 80%)`,
          `hsl(${baseHue} ${baseSaturation}% 70%)`,
          `hsl(${baseHue} ${baseSaturation}% 60%)`,
          `hsl(${baseHue} ${baseSaturation}% 30%)`,
          `hsl(${baseHue} ${baseSaturation}% 25%)`,
          `hsl(${baseHue} ${baseSaturation}% 13%)`,
          `hsl(${baseHue} ${baseSaturation}% 9%)`,
          `hsl(${baseHue} ${baseSaturation}% 8%)`,
          `hsl(${baseHue} ${baseSaturation}% 5%)`,
        ] as MantineColorsTuple,
        gray: [
          `hsl(${baseHue} 17% 98%)`,
          `hsl(${baseHue} 17% 95%)`,
          `hsl(${baseHue} 16% 90%)`,
          `hsl(${baseHue} 14% 75%)`,
          `hsl(${baseHue} 14% 70%)`,
          `hsl(${baseHue} 10% 60%)`,
          `hsl(${baseHue} 8% 45%)`,
          `hsl(${baseHue} 10% 30%)`,
          `hsl(${baseHue} 10% 25%)`,
          `hsl(${baseHue} 10% 15%)`,
        ] as MantineColorsTuple,
      },
      black: `hsl(${baseHue} 10% 10%)`,
      white: `hsl(${baseHue} 10% 94%)`,
      primaryColor: "primary",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      headings: { 
        fontFamily: "'Outfit', sans-serif",
        fontWeight: "600",
      },
      defaultRadius: "md",
      ...custom,
    })
  );
} 