import { useState, useEffect, MouseEvent, useMemo } from 'react';
import { Box, SegmentedControl, Stack, Text, useMantineTheme, useMantineColorScheme, Group, ActionIcon } from '@mantine/core';
import { IconSun, IconMoon, IconX } from '@tabler/icons-react';
import { themes } from './themes/themeselect';
import { Theme } from '../lib/theme';
import { getTextColor } from '../lib/color';
import { ThemeSelect } from './themes/themeselect/ThemeSelect';
import api from '../api/client';
import { getSettings } from '../api/settings/get';

const generateBackgroundColors = (theme: Theme, colorScheme: 'light' | 'dark') => {
  const { colors } = theme.mantineTheme;
  
  if (colorScheme === 'light') {
    return {
      main: [
        { bg: '#ffffff', text: getTextColor('#ffffff') },
        { bg: '#f8f9fa', text: getTextColor('#f8f9fa') },
        { bg: '#f1f3f5', text: getTextColor('#f1f3f5') },
        { bg: '#e9ecef', text: getTextColor('#e9ecef') },
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
        { bg: '#343a40', text: getTextColor('#343a40') },
        { bg: '#495057', text: getTextColor('#495057') },
        { bg: '#212529', text: getTextColor('#212529') },
        { bg: '#1a1b1e', text: getTextColor('#1a1b1e') },
        { bg: colors?.primary?.[8] || '#1864ab', text: getTextColor(colors?.primary?.[8] || '#1864ab') },
        { bg: colors?.secondary?.[8] || '#0c8599', text: getTextColor(colors?.secondary?.[8] || '#0c8599') },
        { bg: `${colors?.primary?.[7]}E6` || '#1971c2', text: getTextColor(colors?.primary?.[7] || '#1971c2') },
        { bg: `${colors?.secondary?.[7]}E6` || '#0b7285', text: getTextColor(colors?.secondary?.[7] || '#0b7285') }
      ],
      formElements: [
        { bg: '#f8f9fa', text: getTextColor('#f8f9fa') },  // Slightly darker than white
        { bg: '#f1f3f5', text: getTextColor('#f1f3f5') },
        { bg: colors?.gray?.[0] || '#e9ecef', text: getTextColor(colors?.gray?.[0] || '#e9ecef') },
      ],
    };
  } else {
    return {
      main: [
        { bg: '#212529', text: getTextColor('#212529') },
        { bg: '#2a2b2e', text: getTextColor('#2a2b2e') },
        { bg: '#343a40', text: getTextColor('#343a40') },
        { bg: '#495057', text: getTextColor('#495057') },
        { bg: colors?.primary?.[9] || '#0b4884', text: getTextColor(colors?.primary?.[9] || '#0b4884') },
        { bg: colors?.secondary?.[9] || '#0b6b7a', text: getTextColor(colors?.secondary?.[9] || '#0b6b7a') },
        { bg: `${colors?.primary?.[8]}E6` || '#1864ab', text: getTextColor(colors?.primary?.[8] || '#1864ab') },
        { bg: `${colors?.secondary?.[8]}E6` || '#0c8599', text: getTextColor(colors?.secondary?.[8] || '#0c8599') }
      ],
      mainGradients: [
        { bg: 'linear-gradient(135deg, #212529 0%, #343a40 100%)', text: '#ffffff' },
        { bg: 'linear-gradient(135deg, #0b4884 0%, #0b6b7a 100%)', text: '#ffffff' },
        { bg: `linear-gradient(135deg, ${colors?.primary?.[9] || '#0b4884'} 0%, ${colors?.secondary?.[9] || '#0b6b7a'} 100%)`, text: '#ffffff' }
      ],
      sidebar: [
        { bg: '#141517', text: getTextColor('#141517') },
        { bg: '#18191c', text: getTextColor('#18191c') },
        { bg: '#1a1b1e', text: getTextColor('#1a1b1e') },
        { bg: '#212529', text: getTextColor('#212529') },
        { bg: colors?.primary?.[9] || '#0b4884', text: getTextColor(colors?.primary?.[9] || '#0b4884') },
        { bg: colors?.secondary?.[9] || '#0b6b7a', text: getTextColor(colors?.secondary?.[9] || '#0b6b7a') },
        { bg: `${colors?.primary?.[8]}E6` || '#1864ab', text: getTextColor(colors?.primary?.[8] || '#1864ab') },
        { bg: `${colors?.secondary?.[8]}E6` || '#0c8599', text: getTextColor(colors?.secondary?.[8] || '#0c8599') }
      ],
      formElements: [
        { bg: '#1A1B1F', text: getTextColor('#1A1B1F') },  // Slightly darker than main background
        { bg: '#25262B', text: getTextColor('#25262B') },
        { bg: colors?.dark?.[7] || '#1A1B1F', text: getTextColor(colors?.dark?.[7] || '#1A1B1F') },
      ],
    };
  }
};

interface FloatingDivProps {
  onClose: () => void;
}

const FloatingDiv = ({ onClose }: FloatingDivProps) => {
  const theme = useMantineTheme();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 100 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentStyle, setCurrentStyle] = useState<'default' | 'compact'>('default');
  const [mainColorIndex, setMainColorIndex] = useState(0);
  const [mainGradientIndex, setMainGradientIndex] = useState(0);
  const [sidebarColorIndex, setSidebarColorIndex] = useState(0);
  const [useGradient] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(themes[0]);

  // Load initial settings only once
  useEffect(() => {
    const loadInitialSettings = async () => {
      try {
        const settings = await getSettings();
        if (settings.colormode) {
          setColorScheme(settings.colormode as 'light' | 'dark');
        }
        if (settings.colortheme) {
          const savedTheme = themes.find(t => 
            t.label.replace(/^[^\w\s]+ /, '').toLowerCase() === settings.colortheme
          );
          if (savedTheme) {
            setCurrentTheme(savedTheme);
          }
        }
        if (settings.styletheme) {
          setCurrentStyle(settings.styletheme as 'default' | 'compact');
        }
      } catch (error) {
        console.error('Failed to load initial settings:', error);
      }
    };

    loadInitialSettings();
  }, [setColorScheme]);  // Add setColorScheme to dependency array since we're using it

  // Dragging logic
  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove as any);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const backgroundColors = useMemo(
    () => generateBackgroundColors(currentTheme, colorScheme === 'auto' ? 'light' : colorScheme),
    [currentTheme, colorScheme]
  );

  // Update backgrounds when colors change
  useEffect(() => {
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

  // Update theme handling
  const handleThemeChange = async (selectedTheme: Theme) => {
    setCurrentTheme(selectedTheme);
    setMainColorIndex(0);
    setSidebarColorIndex(0);
    setMainGradientIndex(0);
    window.dispatchEvent(new CustomEvent('theme-change', { detail: selectedTheme }));

    try {
      // Extract theme name by removing emoji and converting to lowercase
      const themeName = selectedTheme.label.replace(/^[^\w\s]+ /, '').toLowerCase();
      await api.put('/api/settings', {
        setting_key: 'colortheme',
        setting_value: themeName
      });
    } catch (error) {
      console.error('Failed to save theme setting:', error);
    }
  };

  const handleStyleChange = async (value: 'default' | 'compact') => {
    setCurrentStyle(value);
    window.dispatchEvent(new CustomEvent('style-change', { detail: value }));

    try {
      await api.put('/api/settings', {
        setting_key: 'styletheme',
        setting_value: value
      });
    } catch (error) {
      console.error('Failed to save style setting:', error);
    }
  };

  const handleColorSchemeChange = async (value: 'light' | 'dark') => {
    setColorScheme(value);
    try {
      await api.put('/api/settings', {
        setting_key: 'colormode',
        setting_value: value
      });
    } catch (error) {
      console.error('Failed to save color mode setting:', error);
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        backgroundColor: theme.colors.dark[6],
        color: theme.colors.gray[0],
        borderRadius: theme.radius.md,
        cursor: isDragging ? 'move' : 'default',
        userSelect: 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.4)',
        zIndex: 1000,
        width: '220px',
        overflow: 'hidden',
      }}
    >
      <div style={{
        backgroundColor: theme.colors.dark[8],
        padding: '12px 20px',
        borderBottom: `1px solid ${theme.colors.dark[4]}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text fw={700} size="md">Theme Settings</Text>
        <ActionIcon 
          variant="subtle" 
          color="gray" 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <IconX size={16} />
        </ActionIcon>
      </div>
      <div style={{ padding: '20px' }}>
        <Stack gap="md">
          <SegmentedControl
            fullWidth
            size="xs"
            data={[
              {
                value: 'light' as const,
                label: (
                  <Group gap={2}>
                    <IconSun size={16} />
                    <Box>Light</Box>
                  </Group>
                ),
              },
              {
                value: 'dark' as const,
                label: (
                  <Group gap={2}>
                    <IconMoon size={16} />
                    <Box>Dark</Box>
                  </Group>
                ),
              },
            ]}
            value={colorScheme}
            onChange={(value) => handleColorSchemeChange(value as 'light' | 'dark')}
          />

          <Box style={{ position: 'relative', zIndex: 1001 }}>
            <ThemeSelect 
              value={currentTheme.label}
              onChange={(themeLabel) => {
                const selectedTheme = themes.find(t => t.label === themeLabel);
                if (selectedTheme) {
                  handleThemeChange(selectedTheme);
                }
              }}
         />
          </Box>

          <Box>
            <SegmentedControl
              fullWidth
              data={[
                { label: 'Default', value: 'default' },
                { label: 'Compact', value: 'compact' },
              ]}
           value={currentStyle}
           onChange={(value) => handleStyleChange(value as 'default' | 'compact')}
         />
          </Box>
       </Stack>
      </div>
    </div>
  );
};

export default FloatingDiv; 