/**
 * @file UIExamples.tsx
 * @description A showcase of UI elements with different color variants
 */

import { 
  Stack, Title, Grid, Button, Badge, Card, 
  Text, Pill, ActionIcon, Group, Divider 
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

const colors = [
  'dark',
  'gray',
  'red',
  'pink',
  'grape',
  'violet',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'green',
  'lime',
  'yellow',
  'orange'
];

const variants = ['filled', 'light', 'outline', 'subtle', 'transparent', 'white', 'default'];

export function UIExamples() {
  return (
    <Stack p="md" gap="xl">
      <Title order={1}>UI Examples</Title>

      {/* Buttons */}
      <Card withBorder>
        <Title order={2} mb="md">Buttons</Title>
        <Stack gap="xl">
          {variants.map(variant => (
            <div key={variant}>
              <Text size="sm" mb="xs" tt="capitalize" fw={500}>{variant}</Text>
              <Group gap="xs" wrap="wrap">
                {colors.map(color => (
                  <Button
                    key={color}
                    variant={variant as any}
                    color={color}
                    size="sm"
                  >
                    {color}
                  </Button>
                ))}
              </Group>
            </div>
          ))}

          <Divider />
          
          <div>
            <Text size="sm" mb="xs" fw={500}>Sizes</Text>
            <Group gap="xs">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </Group>
          </div>

          <div>
            <Text size="sm" mb="xs" fw={500}>With Icon</Text>
            <Group gap="xs">
              <Button leftSection={<IconPlus size={16} />}>With Icon</Button>
              <Button rightSection={<IconPlus size={16} />}>With Icon</Button>
              <Button leftSection={<IconPlus size={16} />} rightSection={<IconPlus size={16} />}>
                Both Sides
              </Button>
            </Group>
          </div>
        </Stack>
      </Card>

      {/* Badges */}
      <Card withBorder>
        <Title order={2} mb="md">Badges</Title>
        <Stack gap="xl">
          {variants.map(variant => (
            <div key={variant}>
              <Text size="sm" mb="xs" tt="capitalize" fw={500}>{variant}</Text>
              <Group gap="xs" wrap="wrap">
                {colors.map(color => (
                  <Badge
                    key={color}
                    variant={variant as any}
                    color={color}
                    size="lg"
                  >
                    {color}
                  </Badge>
                ))}
              </Group>
            </div>
          ))}
        </Stack>
      </Card>

      {/* Pills */}
      <Card withBorder>
        <Title order={2} mb="md">Pills</Title>
        <Stack gap="xl">
          {variants.map(variant => (
            <div key={variant}>
              <Text size="sm" mb="xs" tt="capitalize" fw={500}>{variant}</Text>
              <Group gap="xs" wrap="wrap">
                {colors.map(color => (
                  <Pill
                    key={color}
                    variant={variant as any}
                    color={color}
                    size="lg"
                  >
                    {color}
                  </Pill>
                ))}
              </Group>
            </div>
          ))}
        </Stack>
      </Card>

      {/* Action Icons */}
      <Card withBorder>
        <Title order={2} mb="md">Action Icons</Title>
        <Stack gap="xl">
          {variants.map(variant => (
            <div key={variant}>
              <Text size="sm" mb="xs" tt="capitalize" fw={500}>{variant}</Text>
              <Group gap="xs" wrap="wrap">
                {colors.map(color => (
                  <ActionIcon
                    key={color}
                    variant={variant as any}
                    color={color}
                    size="lg"
                  >
                    <IconPlus size={16} />
                  </ActionIcon>
                ))}
              </Group>
            </div>
          ))}

          <Divider />

          <div>
            <Text size="sm" mb="xs" fw={500}>Sizes</Text>
            <Group gap="xs">
              <ActionIcon size="xs"><IconPlus size={12} /></ActionIcon>
              <ActionIcon size="sm"><IconPlus size={14} /></ActionIcon>
              <ActionIcon size="md"><IconPlus size={16} /></ActionIcon>
              <ActionIcon size="lg"><IconPlus size={18} /></ActionIcon>
              <ActionIcon size="xl"><IconPlus size={20} /></ActionIcon>
            </Group>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
} 