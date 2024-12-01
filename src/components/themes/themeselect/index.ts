import { Theme } from "../../../lib/theme";
import { forest } from "./forest";
import { ocean } from "./ocean";
import { sunset } from "./sunset";
import { midnight } from "./midnight";
import { MantineTheme, MantineThemeOverride } from '@mantine/core';

const focusStyles = (theme: MantineTheme) => ({
  outline: 'none',
  borderColor: `${theme.colors.teal[5]} !important`,
  boxShadow: `0 0 0 1px ${theme.colors.teal[5]}`,
});

export const themes: Theme[] = [
  {
    label: 'Ocean',
    mantineTheme: {
      primaryColor: 'blue',
      components: {
        NavLink: {
          styles: (theme: MantineTheme) => ({
            root: {
              '&[data-active]': {
                backgroundColor: 'transparent !important',
                '&:hover': {
                  backgroundColor: 'var(--mantine-color-dark-6)',
                },
              },
              '&:active': {
                backgroundColor: 'transparent !important',
              },
              '&:hover': {
                backgroundColor: 'var(--mantine-color-dark-6)',
              },
              '&:focus': {
                backgroundColor: 'transparent !important',
              },
              '--_active-bg': 'transparent !important',
              '--_hover-bg': 'var(--mantine-color-dark-6)',
            },
          }),
        },
        UnstyledButton: {
          styles: (theme: MantineTheme) => ({
            root: {
              '&:focus': {
                outline: 'none !important',
                '-webkit-focus-ring-color': 'transparent !important',
              },
              '&:focus-visible': {
                outline: 'none !important',
                '-webkit-focus-ring-color': 'transparent !important',
              },
              '&:active': {
                outline: 'none !important',
                border: 'none !important',
                backgroundColor: 'transparent !important',
              },
              '--_active-bg': 'transparent !important',
              '--_hover-bg': 'var(--mantine-color-dark-6)',
            },
          }),
        },
        Tabs: {
          styles: (theme: MantineTheme) => ({
            tab: {
              '&:focus': {
                ...focusStyles(theme),
                backgroundColor: 'transparent',
              },
              '&:focus-within': {
                outline: 'none',
              },
              '&[data-selected]': {
                borderColor: theme.colors.teal[5],
                '&:focus': focusStyles(theme),
              },
              '&:hover': {
                backgroundColor: 'var(--mantine-color-dark-6)',
              },
            },
            tabsList: {
              borderBottom: 'var(--mantine-color-dark-4)',
            }
          }),
        },
        Input: {
          styles: (theme: MantineTheme) => ({
            input: {
              backgroundColor: 'var(--mantine-color-dark-7)',
              '&:focus': focusStyles(theme),
              transition: 'all 150ms ease',
            },
          }),
        },
        Select: {
          styles: (theme: MantineTheme) => ({
            input: {
              backgroundColor: 'var(--mantine-color-dark-7)',
              '&:focus': focusStyles(theme),
            },
            dropdown: {
              backgroundColor: 'var(--mantine-color-dark-7)',
            },
          }),
        },
        Button: {
          styles: {
            root: {
              '&:focus': {
                outline: 'none !important',
                '-webkit-focus-ring-color': 'transparent !important',
              },
              '&:focus-visible': {
                outline: 'none !important',
                '-webkit-focus-ring-color': 'transparent !important',
              },
            },
          },
        },
      } as MantineThemeOverride['components'],
      vars: {
        activeColor: 'transparent',
        hoverColor: 'var(--mantine-color-dark-6)',
      },
    },
  },
  forest,
  ocean,
  sunset,
  midnight,
];

export { forest, ocean, sunset, midnight }; 