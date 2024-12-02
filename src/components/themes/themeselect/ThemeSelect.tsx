import { Radio, Stack } from '@mantine/core';
import { themes } from '.';

interface ThemeSelectProps {
  onChange: (theme: string) => void;
  value: string;
}

export function ThemeSelect({ onChange, value }: ThemeSelectProps) {
  return (
    <Radio.Group
      value={value}
      onChange={onChange}
    >
      <Stack gap="xs">
        {themes.map((theme) => (
          <div
            key={theme.label}
            onClick={() => onChange(theme.label)}
            style={{
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: 'var(--mantine-radius-sm)',
              backgroundColor: value === theme.label ? 
                'var(--mantine-color-teal-9)' : 
                'var(--mantine-color-dark-7)',
              transition: 'background-color 150ms ease',
            }}
            onMouseEnter={(e) => {
              if (value !== theme.label) {
                e.currentTarget.style.backgroundColor = 'var(--mantine-color-dark-6)';
              }
            }}
            onMouseLeave={(e) => {
              if (value !== theme.label) {
                e.currentTarget.style.backgroundColor = 'var(--mantine-color-dark-7)';
              }
            }}
          >
            <Radio
              value={theme.label}
              label={theme.label}
              styles={{
                root: {
                  width: '100%',
                },
                radio: {
                  backgroundColor: 'var(--mantine-color-dark-6)',
                  borderColor: 'var(--mantine-color-dark-4)',
                },
                label: {
                  color: 'var(--mantine-color-white)',
                },
              }}
            />
          </div>
        ))}
      </Stack>
    </Radio.Group>
  );
} 