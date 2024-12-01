import { Theme } from "../../../lib/theme";
import { forest } from "./forest";
import { ocean } from "./ocean";
import { sunset } from "./sunset";
import { midnight } from "./midnight";
import { lavender } from "./lavender";
import { crimson } from "./crimson";
import { emerald } from "./emerald";
import { amber } from "./amber";
import { sapphire } from "./sapphire";
import { graphite } from "./graphite";
import { slate } from "./slate";
import { MantineTheme, MantineThemeOverride } from '@mantine/core';

const focusStyles = (theme: MantineTheme) => ({
  outline: 'none',
  borderColor: `${theme.colors.teal[5]} !important`,
  boxShadow: `0 0 0 1px ${theme.colors.teal[5]}`,
});

export const themes: Theme[] = [
  ocean,
  forest,
  sunset,
  midnight,
  lavender,
  crimson,
  emerald,
  amber,
  sapphire,
  graphite,
  slate,
];

export { 
  forest, ocean, sunset, midnight, 
  lavender, crimson, emerald, amber, sapphire,
  graphite, slate 
}; 