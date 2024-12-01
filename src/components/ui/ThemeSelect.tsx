import { Select, Group, Text } from '@mantine/core';
import { themes } from '../../theme';
import { useMantineTheme } from '@mantine/core';
import { IconPalette } from '@tabler/icons-react';

interface ThemeSelectProps {
  onChange: (theme: string) => void;
  value: string;
}

export function ThemeSelect({ onChange, value }: ThemeSelectProps) {
  const theme = useMantineTheme();
  
  return (
    <Select
      size="sm"
      leftSection={<IconPalette size={16} />}
      placeholder="Select theme"
      data={themes.map(t => ({
        value: t.label,
        label: t.label,
      }))}
      value={value}
      onChange={onChange}
      styles={{
        input: {
          fontWeight: 500,
        },
      }}
    />
  );
} 