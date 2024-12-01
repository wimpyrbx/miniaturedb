import {
  Title,
  Text,
  Button,
  Card,
  Badge,
  Group,
  Switch,
  TextInput,
  Textarea,
  Select,
  Slider,
  Checkbox,
  Radio,
  Stack,
  Paper,
  Alert,
  Accordion,
  Tabs,
  Progress,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export function UIShowcase() {
  return (
    <Stack gap="xl" p="md">
      <Title order={1}>UI Components Showcase</Title>

      <Paper shadow="sm" p="md">
        <Title order={2} mb="md">Buttons & Badges</Title>
        <Group>
          <Button variant="filled">Filled</Button>
          <Button variant="light">Light</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="subtle">Subtle</Button>
          <Badge>Default Badge</Badge>
          <Badge color="red">Red Badge</Badge>
          <Badge variant="dot">Dot Badge</Badge>
        </Group>
      </Paper>

      <Paper shadow="sm" p="md">
        <Title order={2} mb="md">Form Elements</Title>
        <Stack>
          <TextInput label="Text Input" placeholder="Type something..." />
          <Textarea label="Textarea" placeholder="Multiple lines..." />
          <Select
            label="Select"
            placeholder="Pick one"
            data={['React', 'Vue', 'Angular', 'Svelte']}
          />
          <Slider
            marks={[
              { value: 20, label: '20%' },
              { value: 50, label: '50%' },
              { value: 80, label: '80%' },
            ]}
          />
          <Switch label="Switch" />
          <Checkbox label="Checkbox" />
          <Radio.Group name="favoriteFramework" label="Select your favorite">
            <Group mt="xs">
              <Radio value="react" label="React" />
              <Radio value="vue" label="Vue" />
              <Radio value="angular" label="Angular" />
            </Group>
          </Radio.Group>
        </Stack>
      </Paper>

      <Paper shadow="sm" p="md">
        <Title order={2} mb="md">Cards & Alerts</Title>
        <Stack>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text fw={500}>Card Title</Text>
            <Text size="sm" c="dimmed">
              This is a sample card component with some content.
            </Text>
            <Button variant="light" color="blue" fullWidth mt="md" radius="md">
              Card Action
            </Button>
          </Card>

          <Alert icon={<IconAlertCircle size={16} />} title="Alert!" color="red">
            This is an important alert message.
          </Alert>
        </Stack>
      </Paper>

      <Paper shadow="sm" p="md">
        <Title order={2} mb="md">Accordion & Tabs</Title>
        <Stack>
          <Accordion>
            <Accordion.Item value="item1">
              <Accordion.Control>First Item</Accordion.Control>
              <Accordion.Panel>First item content</Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="item2">
              <Accordion.Control>Second Item</Accordion.Control>
              <Accordion.Panel>Second item content</Accordion.Panel>
            </Accordion.Item>
          </Accordion>

          <Tabs defaultValue="first">
            <Tabs.List>
              <Tabs.Tab value="first">First Tab</Tabs.Tab>
              <Tabs.Tab value="second">Second Tab</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="first" pt="xs">
              First tab content
            </Tabs.Panel>
            <Tabs.Panel value="second" pt="xs">
              Second tab content
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Paper>

      <Paper shadow="sm" p="md">
        <Title order={2} mb="md">Progress</Title>
        <Stack>
          <Progress value={60} />
          <Progress.Root size="xl">
            <Progress.Section value={35} color="cyan">
              In Progress
            </Progress.Section>
            <Progress.Section value={25} color="pink">
              Pending
            </Progress.Section>
          </Progress.Root>
        </Stack>
      </Paper>
    </Stack>
  );
} 