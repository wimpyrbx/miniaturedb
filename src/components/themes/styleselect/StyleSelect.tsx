import { SegmentedControl } from '@mantine/core';
import { IconLayoutGrid, IconLayoutList } from '@tabler/icons-react';

interface StyleSelectProps {
  onChange: (style: 'default' | 'compact') => void;
  value: 'default' | 'compact';
}

export function StyleSelect({ onChange, value }: StyleSelectProps) {
  return (
    <SegmentedControl
      size="xs"
      fullWidth
      data={[
        {
          value: 'default',
          label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconLayoutGrid size={16} />
              <span>Default</span>
            </div>
          ),
        },
        {
          value: 'compact',
          label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconLayoutList size={16} />
              <span>Compact</span>
            </div>
          ),
        },
      ]}
      value={value}
      onChange={(newValue) => onChange(newValue as 'default' | 'compact')}
    />
  );
} 