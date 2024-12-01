import { Box, UnstyledButton, Group, Text, AppShell, SegmentedControl, useMantineColorScheme, ColorSwatch, Stack, Divider } from '@mantine/core';
import { IconChevronRight, IconSun, IconMoon, IconLogout, IconPalette } from '@tabler/icons-react';
import { ReactNode, useState, useMemo } from 'react';
import { ThemeSelect } from '../../themes/themeselect/ThemeSelect';
import { StyleSelect } from '../../themes/styleselect/StyleSelect';
import { themes } from '../../themes/themeselect';
import { Theme } from '../../../lib/theme';

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
  themeControls: {
    padding: 'var(--mantine-spacing-xs)',
    borderTop: '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--mantine-spacing-xs)',
  },
  sidebarContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
  },
  mainContent: {
    flex: 1,
  },
  logoutButton: {
    padding: 'var(--mantine-spacing-xs)',
    borderTop: '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
  },
  colorSwatches: {
    display: 'flex',
    gap: 'var(--mantine-spacing-xs)',
    flexWrap: 'wrap' as const,
  }
};

function generateBackgroundColors(theme: Theme, colorScheme: 'light' | 'dark') {
  const { colors } = theme.mantineTheme;
  
  if (colorScheme === 'light') {
    return {
      main: [
        { bg: '#ffffff', text: '#1A1B1E' }, // White with dark text
        { bg: colors?.gray?.[1] || '#f1f3f5', text: '#1A1B1E' }, // Light gray
        { bg: colors?.primary?.[1] || '#e6f4ff', text: '#1A1B1E' }, // Light primary
        { bg: colors?.secondary?.[1] || '#e6fbff', text: '#1A1B1E' }, // Light secondary
      ],
      sidebar: [
        { bg: colors?.dark?.[2] || '#2C2E33', text: '#ffffff' }, // Dark gray
        { bg: colors?.dark?.[3] || '#373A40', text: '#ffffff' }, // Medium dark
        { bg: `${colors?.primary?.[7]}CC` || '#004ba3CC', text: '#ffffff' }, // Dimmed primary
        { bg: `${colors?.secondary?.[7]}CC` || '#0081a3CC', text: '#ffffff' }, // Dimmed secondary
      ],
    };
  } else {
    return {
      main: [
        { bg: colors?.dark?.[7] || '#1A1B1E', text: '#ffffff' }, // Dark background
        { bg: colors?.dark?.[6] || '#25262B', text: '#ffffff' }, // Slightly lighter dark
        { bg: `${colors?.primary?.[8]}CC` || '#003575CC', text: '#ffffff' }, // Dimmed dark primary
        { bg: `${colors?.secondary?.[8]}CC` || '#005675CC', text: '#ffffff' }, // Dimmed dark secondary
      ],
      sidebar: [
        { bg: colors?.dark?.[8] || '#141517', text: '#ffffff' }, // Darker background
        { bg: colors?.dark?.[9] || '#101113', text: '#ffffff' }, // Darkest background
        { bg: `${colors?.primary?.[9]}CC` || '#002347CC', text: '#ffffff' }, // Very dimmed primary
        { bg: `${colors?.secondary?.[9]}CC` || '#001F47CC', text: '#ffffff' }, // Very dimmed secondary
      ],
    };
  }
}

function ThemeControls() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const [currentTheme, setCurrentTheme] = useState(themes[0].label);
  const [currentStyle, setCurrentStyle] = useState<'default' | 'compact'>('default');
  
  const theme = useMemo(() => themes.find(t => t.label === currentTheme) || themes[0], [currentTheme]);
  const backgroundColors = useMemo(
    () => generateBackgroundColors(theme, colorScheme),
    [theme, colorScheme]
  );

  const [mainBg, setMainBg] = useState(backgroundColors.main[0].bg);
  const [sidebarBg, setSidebarBg] = useState(backgroundColors.sidebar[0].bg);

  // Update backgrounds when theme or color scheme changes
  useMemo(() => {
    setMainBg(backgroundColors.main[0].bg);
    setSidebarBg(backgroundColors.sidebar[0].bg);
    document.body.style.backgroundColor = backgroundColors.main[0].bg;
    const navbar = document.querySelector('.mantine-AppShell-navbar');
    if (navbar) {
      (navbar as HTMLElement).style.backgroundColor = backgroundColors.sidebar[0].bg;
    }
  }, [backgroundColors]);

  return (
    <div style={styles.themeControls}>
      <Stack gap="sm">
        <Text size="sm" fw={500}>Theme Settings</Text>
        
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
          onChange={(value: 'light' | 'dark') => {
            setColorScheme(value);
            // Apply default backgrounds for new color scheme
            const newBackgroundColors = generateBackgroundColors(theme, value);
            setMainBg(newBackgroundColors.main[0].bg);
            setSidebarBg(newBackgroundColors.sidebar[0].bg);
            document.body.style.backgroundColor = newBackgroundColors.main[0].bg;
            document.body.style.color = newBackgroundColors.main[0].text;
            const navbar = document.querySelector('.mantine-AppShell-navbar');
            if (navbar) {
              (navbar as HTMLElement).style.backgroundColor = newBackgroundColors.sidebar[0].bg;
              (navbar as HTMLElement).style.color = newBackgroundColors.sidebar[0].text;
            }
          }}
        />

        <ThemeSelect 
          value={currentTheme}
          onChange={(value) => {
            setCurrentTheme(value);
            const theme = themes.find(t => t.label === value);
            if (theme) {
              const event = new CustomEvent('theme-change', { detail: theme });
              window.dispatchEvent(event);
              
              // Automatically apply first background colors from new theme
              const newBackgroundColors = generateBackgroundColors(theme, colorScheme === 'auto' ? 'light' : colorScheme);
              setMainBg(newBackgroundColors.main[0].bg);
              setSidebarBg(newBackgroundColors.sidebar[0].bg);
              document.body.style.backgroundColor = newBackgroundColors.main[0].bg;
              document.body.style.color = newBackgroundColors.main[0].text;
              const navbar = document.querySelector('.mantine-AppShell-navbar');
              if (navbar) {
                (navbar as HTMLElement).style.backgroundColor = newBackgroundColors.sidebar[0].bg;
                (navbar as HTMLElement).style.color = newBackgroundColors.sidebar[0].text;
              }
            }
          }}
        />

        <StyleSelect
          value={currentStyle}
          onChange={(value) => {
            setCurrentStyle(value);
            const event = new CustomEvent('style-change', { detail: value });
            window.dispatchEvent(event);
          }}
        />

        <Divider />

        <Text size="sm" fw={500}>Main Background</Text>
        <div style={styles.colorSwatches}>
          {backgroundColors.main.map((color) => (
            <ColorSwatch
              key={color.bg}
              color={color.bg}
              size={24}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setMainBg(color.bg);
                document.body.style.backgroundColor = color.bg;
                document.body.style.color = color.text;
              }}
            />
          ))}
        </div>

        <Text size="sm" fw={500}>Sidebar Background</Text>
        <div style={styles.colorSwatches}>
          {backgroundColors.sidebar.map((color) => (
            <ColorSwatch
              key={color.bg}
              color={color.bg}
              size={24}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setSidebarBg(color.bg);
                const navbar = document.querySelector('.mantine-AppShell-navbar');
                if (navbar) {
                  (navbar as HTMLElement).style.backgroundColor = color.bg;
                  (navbar as HTMLElement).style.color = color.text;
                }
              }}
            />
          ))}
        </div>
      </Stack>
    </div>
  );
}

interface MenuItemProps {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
}

interface MenuGroupProps {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function MenuItem({ label, icon, onClick }: MenuItemProps) {
  return (
    <UnstyledButton onClick={onClick} style={styles.menuItem}>
      <Group>
        {icon}
        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  );
}

export function MenuGroup({ label, icon, children }: MenuGroupProps) {
  return (
    <div style={styles.menuGroup}>
      <Group mb="xs" style={{ opacity: 0.65 }}>
        {icon}
        <Text size="sm" fw={500}>{label}</Text>
      </Group>
      <Stack gap="xs">
        {children}
      </Stack>
    </div>
  );
}

interface SideBarProps {
  children: ReactNode;
  onLogout?: () => void;
}

export function SideBar({ children, onLogout }: SideBarProps) {
  return (
    <AppShell.Navbar>
      <div style={styles.sidebarContainer}>
        <div style={styles.mainContent}>
          {children}
        </div>
        <ThemeControls />
        {onLogout && (
          <div style={styles.logoutButton}>
            <UnstyledButton style={styles.menuItem} onClick={onLogout}>
              <Group>
                <IconLogout size={16} />
                <Text size="sm">Logout</Text>
              </Group>
            </UnstyledButton>
          </div>
        )}
      </div>
    </AppShell.Navbar>
  );
} 