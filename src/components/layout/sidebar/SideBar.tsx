import { Box, UnstyledButton, Group, Text, AppShell, SegmentedControl, useMantineColorScheme, Stack, Divider, Button, Slider } from '@mantine/core';
import { IconChevronRight, IconSun, IconMoon, IconLogout, IconPalette, IconHome, IconForms, IconChartBar, IconPhoto } from '@tabler/icons-react';
import { ReactNode, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeSelect } from '../../themes/themeselect/ThemeSelect';
import { StyleSelect } from '../../themes/styleselect/StyleSelect';
import { themes } from '../../themes/themeselect';
import { Theme } from '../../../lib/theme';
import { getTextColor } from '../../../lib/color';

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
    padding: 'var(--mantine-spacing-xs)',
  },
  themeControls: {
    padding: 'var(--mantine-spacing-xs)',
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
    padding: 'var(--mantine-spacing-xs)',
  },
  logoutButton: {
    padding: 'var(--mantine-spacing-xs)',
  }
};

function generateBackgroundColors(theme: Theme, colorScheme: 'light' | 'dark') {
  const { colors } = theme.mantineTheme;
  
  if (colorScheme === 'light') {
    return {
      main: [
        // Grayscale options
        { bg: '#ffffff', text: getTextColor('#ffffff') },
        { bg: '#f8f9fa', text: getTextColor('#f8f9fa') },
        { bg: '#f1f3f5', text: getTextColor('#f1f3f5') },
        { bg: '#e9ecef', text: getTextColor('#e9ecef') },
        // Theme-based options
        { bg: colors?.primary?.[0] || '#e7f5ff', text: getTextColor(colors?.primary?.[0] || '#e7f5ff') },
        { bg: colors?.secondary?.[0] || '#e3fafc', text: getTextColor(colors?.secondary?.[0] || '#e3fafc') },
        { bg: `${colors?.primary?.[1]}E6` || '#d0ebff', text: getTextColor(colors?.primary?.[1] || '#d0ebff') },
        { bg: `${colors?.secondary?.[1]}E6` || '#c5f6fa', text: getTextColor(colors?.secondary?.[1] || '#c5f6fa') }
      ],
      mainGradients: [
        { bg: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', text: '#000000' },
        { bg: 'linear-gradient(135deg, #e7f5ff 0%, #e3fafc 100%)', text: '#000000' },
        { bg: `linear-gradient(135deg, ${colors?.primary?.[0] || '#e7f5ff'} 0%, ${colors?.secondary?.[0] || '#e3fafc'} 100%)`, text: '#000000' }
      ],
      sidebar: [
        // Grayscale options
        { bg: '#343a40', text: getTextColor('#343a40') },
        { bg: '#495057', text: getTextColor('#495057') },
        { bg: '#212529', text: getTextColor('#212529') },
        { bg: '#1a1b1e', text: getTextColor('#1a1b1e') },
        // Theme-based options
        { bg: colors?.primary?.[8] || '#1864ab', text: getTextColor(colors?.primary?.[8] || '#1864ab') },
        { bg: colors?.secondary?.[8] || '#0c8599', text: getTextColor(colors?.secondary?.[8] || '#0c8599') },
        { bg: `${colors?.primary?.[7]}E6` || '#1971c2', text: getTextColor(colors?.primary?.[7] || '#1971c2') },
        { bg: `${colors?.secondary?.[7]}E6` || '#0b7285', text: getTextColor(colors?.secondary?.[7] || '#0b7285') }
      ]
    };
  } else {
    return {
      main: [
        // Grayscale options
        { bg: '#212529', text: getTextColor('#212529') },          // Dark background
        { bg: '#2a2b2e', text: getTextColor('#2a2b2e') },          // Slightly lighter
        { bg: '#343a40', text: getTextColor('#343a40') },          // Medium dark
        { bg: '#495057', text: getTextColor('#495057') },          // Light dark
        // Theme-based options
        { bg: colors?.primary?.[9] || '#0b4884', text: getTextColor(colors?.primary?.[9] || '#0b4884') },  // Deepest primary
        { bg: colors?.secondary?.[9] || '#0b6b7a', text: getTextColor(colors?.secondary?.[9] || '#0b6b7a') },  // Deepest secondary
        { bg: `${colors?.primary?.[8]}E6` || '#1864ab', text: getTextColor(colors?.primary?.[8] || '#1864ab') },  // Deep primary with transparency
        { bg: `${colors?.secondary?.[8]}E6` || '#0c8599', text: getTextColor(colors?.secondary?.[8] || '#0c8599') }  // Deep secondary with transparency
      ],
      sidebar: [
        // Grayscale options
        { bg: '#141517', text: getTextColor('#141517') },          // Almost black
        { bg: '#18191c', text: getTextColor('#18191c') },          // Very dark
        { bg: '#1a1b1e', text: getTextColor('#1a1b1e') },          // Dark
        { bg: '#212529', text: getTextColor('#212529') },          // Less dark
        // Theme-based options
        { bg: colors?.primary?.[9] || '#0b4884', text: getTextColor(colors?.primary?.[9] || '#0b4884') },  // Darkest primary
        { bg: colors?.secondary?.[9] || '#0b6b7a', text: getTextColor(colors?.secondary?.[9] || '#0b6b7a') },  // Darkest secondary
        { bg: `${colors?.primary?.[8]}E6` || '#1864ab', text: getTextColor(colors?.primary?.[8] || '#1864ab') },  // Deep primary with transparency
        { bg: `${colors?.secondary?.[8]}E6` || '#0c8599', text: getTextColor(colors?.secondary?.[8] || '#0c8599') }  // Deep secondary with transparency
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
    () => generateBackgroundColors(theme, colorScheme === 'auto' ? 'light' : colorScheme),
    [theme, colorScheme]
  );

  const [mainColorIndex, setMainColorIndex] = useState(0);
  const [mainGradientIndex, setMainGradientIndex] = useState(0);
  const [sidebarColorIndex, setSidebarColorIndex] = useState(0);
  const [useGradient, setUseGradient] = useState(false);

  // Update backgrounds when colors change
  useMemo(() => {
    const mainColor = useGradient 
      ? backgroundColors.mainGradients?.[mainGradientIndex]
      : backgroundColors.main[mainColorIndex];
    const sidebarColor = backgroundColors.sidebar[sidebarColorIndex];

    document.body.style.background = mainColor?.bg || backgroundColors.main[0].bg;
    document.body.style.color = mainColor?.text || backgroundColors.main[0].text;
    
    const navbar = document.querySelector('.mantine-AppShell-navbar');
    if (navbar) {
      (navbar as HTMLElement).style.background = sidebarColor.bg;
      (navbar as HTMLElement).style.color = sidebarColor.text;
    }
  }, [mainColorIndex, sidebarColorIndex, mainGradientIndex, useGradient, backgroundColors]);

  return (
    <Stack gap="sm">
      <Text size="sm" fw={500} c="dimmed">Theme Settings</Text>
      
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
        value={colorScheme === 'auto' ? 'light' : colorScheme}
        onChange={(value: 'light' | 'dark') => {
          setColorScheme(value);
          const newBackgroundColors = generateBackgroundColors(theme, value);
          setMainColorIndex(0);
          setSidebarColorIndex(0);
          setMainGradientIndex(0);
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
            setMainColorIndex(0);
            setSidebarColorIndex(0);
            setMainGradientIndex(0);
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

      <Stack gap="xs">
        <Text size="sm" c="dimmed">Main Background</Text>
        
        <SegmentedControl
          fullWidth
          size="xs"
          data={[
            { label: 'Solid', value: 'solid' },
            { label: 'Gradient', value: 'gradient' }
          ]}
          value={useGradient ? 'gradient' : 'solid'}
          onChange={(value) => setUseGradient(value === 'gradient')}
        />

        {useGradient ? (
          <Slider
            value={mainGradientIndex}
            onChange={setMainGradientIndex}
            min={0}
            max={(backgroundColors.mainGradients?.length || 1) - 1}
            step={1}
            label={(value) => `Gradient ${value + 1}`}
            marks={backgroundColors.mainGradients?.map((_, i) => ({
              value: i,
              label: `${i + 1}`
            }))}
          />
        ) : (
          <Slider
            value={mainColorIndex}
            onChange={setMainColorIndex}
            min={0}
            max={backgroundColors.main.length - 1}
            step={1}
            label={(value) => `Color ${value + 1}`}
            marks={backgroundColors.main.map((_, i) => ({
              value: i,
              label: `${i + 1}`
            }))}
          />
        )}
      </Stack>

      <Stack gap="xs">
        <Text size="sm" c="dimmed">Sidebar Background</Text>
        <Slider
          value={sidebarColorIndex}
          onChange={setSidebarColorIndex}
          min={0}
          max={backgroundColors.sidebar.length - 1}
          step={1}
          label={(value) => `Color ${value + 1}`}
          marks={backgroundColors.sidebar.map((_, i) => ({
            value: i,
            label: `${i + 1}`
          }))}
        />
      </Stack>
    </Stack>
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
        <Text size="sm" inherit>{label}</Text>
      </Group>
    </UnstyledButton>
  );
}

export function MenuGroup({ label, icon, children }: MenuGroupProps) {
  return (
    <div style={styles.menuGroup}>
      <Group mb="xs" style={{ opacity: 0.65 }}>
        {icon}
        <Text size="sm" fw={500} inherit>{label}</Text>
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
  const navigate = useNavigate();

  return (
    <AppShell.Navbar 
      style={{ 
        borderRight: '1px solid var(--mantine-color-dark-4)',
        background: 'var(--mantine-color-body)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={styles.sidebarContainer}>
        <div style={styles.mainContent}>
          <MenuGroup label="Navigation" icon={<IconHome size={16} />}>
            <MenuItem 
              label="Home" 
              onClick={() => navigate('/')} 
            />
          </MenuGroup>

          <MenuGroup label="UI Showcases" icon={<IconPalette size={16} />}>
            <MenuItem 
              label="Forms & Inputs" 
              onClick={() => navigate('/showcases/forms')} 
            />
            <MenuItem 
              label="Data Visualization" 
              onClick={() => navigate('/showcases/data')} 
            />
            <MenuItem 
              label="Modals & Dialogs" 
              onClick={() => navigate('/showcases/modals')} 
            />
            <MenuItem 
              label="Media & Files" 
              onClick={() => navigate('/showcases/media')} 
            />
          </MenuGroup>
        </div>

        <div style={styles.themeControls}>
          <ThemeControls />
        </div>

        <div style={styles.logoutButton}>
          <Button 
            fullWidth 
            variant="subtle" 
            color="red" 
            onClick={onLogout}
            leftSection={<IconLogout size={16} />}
          >
            Logout
          </Button>
        </div>
      </div>
    </AppShell.Navbar>
  );
} 