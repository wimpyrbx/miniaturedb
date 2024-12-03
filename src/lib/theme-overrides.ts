/**
 * @file theme-overrides.ts
 * @description Theme overrides for Mantine components
 */

import { MantineThemeOverride } from '@mantine/core';

export const themeOverrides: MantineThemeOverride = {
  components: {
    Button: {
      styles: {
        root: {
          // Ensure consistent cursor style for disabled buttons
          '&[data-disabled="true"]': {
            cursor: 'not-allowed',
          },
        },
      },
    },
  },
};