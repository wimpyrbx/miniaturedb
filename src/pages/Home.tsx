import { Title, Text, Stack, Card, SimpleGrid, ThemeIcon } from '@mantine/core';
import { IconDatabase, IconPalette, IconLock, IconServer } from '@tabler/icons-react';
import { useEffect } from 'react';
import { getSettings } from '../api/settings/get';
import { themes } from '../components/themes/themeselect';

const features = [
  {
    icon: IconDatabase,
    title: 'Miniature Database',
    description: 'A lightweight yet powerful database management system built for modern applications.',
  },
  {
    icon: IconPalette,
    title: 'Modern UI Components',
    description: 'Explore our collection of beautiful and functional UI components in the showcase section.',
  },
  {
    icon: IconLock,
    title: 'Secure Authentication',
    description: 'Built-in authentication system with session management and security best practices.',
  },
  {
    icon: IconServer,
    title: 'API Integration',
    description: 'RESTful API endpoints for seamless integration with your applications.',
  },
];

export function Home() {
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const settings = await getSettings();
        
        // Apply color mode
        if (settings.colormode) {
          window.dispatchEvent(new CustomEvent('color-scheme-change', { 
            detail: settings.colormode 
          }));
        }

        // Apply theme
        if (settings.colortheme) {
          const selectedTheme = themes.find(t => 
            t.label.replace(/^[^\w\s]+ /, '').toLowerCase() === settings.colortheme
          );
          if (selectedTheme) {
            window.dispatchEvent(new CustomEvent('theme-change', { 
              detail: selectedTheme 
            }));
          }
        }

        // Apply style
        if (settings.styletheme) {
          window.dispatchEvent(new CustomEvent('style-change', { 
            detail: settings.styletheme as 'default' | 'compact'
          }));
        }
      } catch (error) {
        console.error('Failed to load user settings:', error);
      }
    };

    loadUserSettings();
  }, []);

  return (
    <Stack gap="xl" p="md">
      <div>
        <Title order={1} size="h1" mb="xs">Welcome to MiniatureDB</Title>
        <Text size="lg" c="dimmed">
          A modern database management system with a beautiful user interface
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        {features.map((feature) => (
          <Card key={feature.title} shadow="sm" padding="lg" radius="md" withBorder>
            <ThemeIcon
              size={40}
              radius="md"
              variant="light"
              mb="md"
            >
              <feature.icon size={20} />
            </ThemeIcon>

            <Text size="lg" fw={500} mb="xs">
              {feature.title}
            </Text>

            <Text size="sm" c="dimmed">
              {feature.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
} 