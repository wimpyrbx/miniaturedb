import { Box, UnstyledButton, Group, Text, AppShell, SegmentedControl, useMantineColorScheme } from '@mantine/core';
import { IconChevronRight, IconSun, IconMoon } from '@tabler/icons-react';
import { ReactNode, useState } from 'react';
import React from 'react';

const styles = {
  menuItem: {
    display: 'block',
    width: '100%',
    padding: 'var(--mantine-spacing-xs)',
    borderRadius: 'var(--mantine-radius-sm)',
    color: 'inherit',
    '&:hover': {
      backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))',
    },
  },
  menuGroup: {
    borderBottom: '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
    padding: 'var(--mantine-spacing-xs)',
  },
  themeSelector: {
    padding: 'var(--mantine-spacing-xs)',
    borderBottom: '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
  },
  chevron: {
    transition: 'transform 200ms ease',
  },
};

function ThemeSelector() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  
  return (
    <div style={styles.themeSelector}>
      <SegmentedControl
        fullWidth
        size="xs"
        data={[
          {
            value: 'light',
            label: (
              <Group gap={2}>
                <IconSun size={16} />
                <Box>Light</Box>
              </Group>
            ),
          },
          {
            value: 'dark',
            label: (
              <Group gap={2}>
                <IconMoon size={16} />
                <Box>Dark</Box>
              </Group>
            ),
          },
        ]}
        value={colorScheme}
        onChange={(value) => setColorScheme(value as 'light' | 'dark')}
      />
    </div>
  );
}

interface MenuItemProps {
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
}

interface MenuGroupProps {
  label: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <UnstyledButton style={styles.menuItem} onClick={onClick}>
      <Group>
        {icon}
        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  );
}

export function MenuGroup({ label, icon, children }: MenuGroupProps) {
  const [opened, setOpened] = useState(false);

  return (
    <Box style={styles.menuGroup}>
      <UnstyledButton style={styles.menuItem} onClick={() => setOpened(!opened)}>
        <Group justify="space-between">
          <Group>
            {icon}
            <Text size="sm">{label}</Text>
          </Group>
          <IconChevronRight
            style={{
              ...styles.chevron,
              transform: opened ? 'rotate(90deg)' : 'none',
            }}
            size={14}
          />
        </Group>
      </UnstyledButton>
      {opened && children}
    </Box>
  );
}

export function SideBar({ children }: { children: ReactNode }) {
  return (
    <AppShell.Navbar>
      <ThemeSelector />
      {children}
    </AppShell.Navbar>
  );
} 