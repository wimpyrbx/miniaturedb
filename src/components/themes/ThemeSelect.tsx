import { Select, MantineColorScheme } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';

export function ThemeSelect() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <Select
      label="Theme"
      value={colorScheme}
      onChange={(value) => setColorScheme(value as MantineColorScheme)}
      data={[
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ]}
    />
  );
} 