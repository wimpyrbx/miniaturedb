import { useState, useEffect, MouseEvent, useMemo } from 'react';
import { themes } from './themes/themeselect';
import { Box, ColorSwatch, Flex, SegmentedControl, Stack, Text, useMantineTheme, useMantineColorScheme, Group, Slider } from '@mantine/core';
import { Theme } from '../lib/theme';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { getTextColor } from '../lib/color';

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
      ]
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
      ]
    };
  }
};

const FloatingDiv = () => {
  const theme = useMantineTheme();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentStyle, setCurrentStyle] = useState<'default' | 'compact'>('default');
  const [mainColorIndex, setMainColorIndex] = useState(0);
  const [mainGradientIndex, setMainGradientIndex] = useState(0);
  const [sidebarColorIndex, setSidebarColorIndex] = useState(0);
  const [useGradient, setUseGradient] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(themes[0]);

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
    () => generateBackgroundColors(currentTheme, colorScheme),
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

  // Theme handling
  const handleThemeChange = (selectedTheme: Theme) => {
    setCurrentTheme(selectedTheme);
    setMainColorIndex(0);
    setSidebarColorIndex(0);
    setMainGradientIndex(0);
    window.dispatchEvent(new CustomEvent('theme-change', { detail: selectedTheme }));
  };

  const handleStyleChange = (value: 'default' | 'compact') => {
    setCurrentStyle(value);
    window.dispatchEvent(new CustomEvent('style-change', { detail: value }));
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
        padding: '20px',
        borderRadius: theme.radius.md,
        cursor: 'move',
        userSelect: 'none',
        boxShadow: theme.shadows.md,
        zIndex: 1000,
        width: '220px',
      }}
    >
      <Stack gap="md">
        <Text fw={500} size="sm">Theme Settings</Text>
        
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
          onChange={(value: 'light' | 'dark') => setColorScheme(value)}
        />

        <Box>
          <Text fw={500} size="sm" mb="xs">Theme</Text>
          <Flex gap="xs" wrap="wrap">
            {themes.map((t) => (
              <ColorSwatch
                key={t.label}
                component="button"
                color={t.mantineTheme.primaryColor || '#000'}
                onClick={() => handleThemeChange(t)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </Flex>
        </Box>

        <Box>
          <Text fw={500} size="sm" mb="xs">Style</Text>
          <SegmentedControl
            fullWidth
            data={[
              { label: 'Default', value: 'default' },
              { label: 'Compact', value: 'compact' },
            ]}
            value={currentStyle}
            onChange={handleStyleChange}
          />
        </Box>

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
    </div>
  );
};

export default FloatingDiv; 