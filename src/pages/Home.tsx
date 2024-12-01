import { Title, Text, Stack, Card, SimpleGrid, ThemeIcon, rem } from '@mantine/core';
import { IconDatabase, IconPalette, IconLock, IconServer } from '@tabler/icons-react';

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
  return (
    <Stack spacing="xl" p="md">
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
              size={rem(40)}
              radius="md"
              variant="light"
              mb="md"
            >
              <feature.icon size={rem(20)} />
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