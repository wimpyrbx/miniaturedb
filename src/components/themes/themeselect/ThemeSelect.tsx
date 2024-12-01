import { Select } from '@mantine/core';
import { themes } from '.';
import { IconPalette } from '@tabler/icons-react';

interface ThemeSelectProps {
  onChange: (theme: string) => void;
  value: string;
}

export function ThemeSelect({ onChange, value }: ThemeSelectProps) {
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
      onChange={(newValue) => newValue && onChange(newValue)}
      styles={{
        input: {
          fontWeight: 500,
        },
      }}
    />
  );
} 