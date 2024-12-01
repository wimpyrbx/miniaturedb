import { useState } from 'react';
import {
  Title,
  Text,
  Card,
  Button,
  Group,
  Stack,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  Checkbox,
  Radio,
  Switch,
  ColorSwatch,
  Modal,
  NumberInput,
  Slider,
  Tabs,
  rem,
  Box,
  Paper,
  Divider,
  List,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconX, IconSettings, IconAdjustments } from '@tabler/icons-react';

interface ModalSettings {
  title: string;
  size: string;
  centered: boolean;
  withCloseButton: boolean;
  overlayBlur: number;
}

interface ColorBoxSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  color: string;
  size?: number;
}

function ColorBoxSwitch({ checked, onChange, color, size = 20 }: ColorBoxSwitchProps) {
  return (
    <Box
      style={{
        width: rem(size),
        height: rem(size),
        backgroundColor: checked ? color : 'transparent',
        border: `2px solid ${color}`,
        borderRadius: 4,
        cursor: 'pointer',
        transition: 'background-color 200ms ease',
      }}
      onClick={() => onChange(!checked)}
    />
  );
}

export function UIShowcase() {
  const [opened, { open, close }] = useDisclosure(false);
  const [modalSettings, setModalSettings] = useState<ModalSettings>({
    title: 'Modal Title',
    size: 'md',
    centered: true,
    withCloseButton: true,
    overlayBlur: 3,
  });

  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    description: '',
    category: '',
    tags: [] as string[],
    notifications: {
      email: false,
      push: false,
      sms: false,
    },
    theme: 'light',
    features: {
      feature1: false,
      feature2: false,
      feature3: false,
    }
  });

  return (
    <Stack gap="xl">
      <Title order={2}>UI Components Showcase</Title>

      <Tabs defaultValue="forms">
        <Tabs.List>
          <Tabs.Tab value="forms">Forms & Inputs</Tabs.Tab>
          <Tabs.Tab value="modals">Modals & Dialogs</Tabs.Tab>
          <Tabs.Tab value="switches">Switches & Controls</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="forms" pt="md">
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>Advanced Form Example</Title>
              
              <Group grow>
                <TextInput
                  label="Name"
                  placeholder="Enter your name"
                  value={formValues.name}
                  onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                />
                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  value={formValues.email}
                  onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                />
              </Group>

              <Textarea
                label="Description"
                placeholder="Enter description"
                value={formValues.description}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                minRows={3}
              />

              <Group grow>
                <Select
                  label="Category"
                  placeholder="Select category"
                  data={['Work', 'Personal', 'Shopping', 'Travel']}
                  value={formValues.category}
                  onChange={(value) => setFormValues({ ...formValues, category: value || '' })}
                />
                <MultiSelect
                  label="Tags"
                  placeholder="Select tags"
                  data={['Important', 'Urgent', 'Later', 'Ideas']}
                  value={formValues.tags}
                  onChange={(value) => setFormValues({ ...formValues, tags: value })}
                />
              </Group>

              <Divider label="Notification Preferences" labelPosition="center" />

              <Group>
                <ColorBoxSwitch
                  checked={formValues.notifications.email}
                  onChange={(checked) => setFormValues({
                    ...formValues,
                    notifications: { ...formValues.notifications, email: checked }
                  })}
                  color="var(--mantine-color-blue-6)"
                />
                <Text size="sm">Email Notifications</Text>
              </Group>

              <Group>
                <ColorBoxSwitch
                  checked={formValues.notifications.push}
                  onChange={(checked) => setFormValues({
                    ...formValues,
                    notifications: { ...formValues.notifications, push: checked }
                  })}
                  color="var(--mantine-color-green-6)"
                />
                <Text size="sm">Push Notifications</Text>
              </Group>

              <Group>
                <ColorBoxSwitch
                  checked={formValues.notifications.sms}
                  onChange={(checked) => setFormValues({
                    ...formValues,
                    notifications: { ...formValues.notifications, sms: checked }
                  })}
                  color="var(--mantine-color-violet-6)"
                />
                <Text size="sm">SMS Notifications</Text>
              </Group>

              <Radio.Group
                label="Theme Preference"
                value={formValues.theme}
                onChange={(value) => setFormValues({ ...formValues, theme: value })}
              >
                <Group mt="xs">
                  <Radio value="light" label="Light" />
                  <Radio value="dark" label="Dark" />
                  <Radio value="system" label="System" />
                </Group>
              </Radio.Group>

              <Button>Save Changes</Button>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="modals" pt="md">
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>Modal Configuration</Title>

              <TextInput
                label="Modal Title"
                value={modalSettings.title}
                onChange={(e) => setModalSettings({ ...modalSettings, title: e.target.value })}
              />

              <Select
                label="Modal Size"
                data={['xs', 'sm', 'md', 'lg', 'xl']}
                value={modalSettings.size}
                onChange={(value) => setModalSettings({ ...modalSettings, size: value || 'md' })}
              />

              <Group>
                <Checkbox
                  label="Centered"
                  checked={modalSettings.centered}
                  onChange={(e) => setModalSettings({ ...modalSettings, centered: e.currentTarget.checked })}
                />
                <Checkbox
                  label="Close Button"
                  checked={modalSettings.withCloseButton}
                  onChange={(e) => setModalSettings({ ...modalSettings, withCloseButton: e.currentTarget.checked })}
                />
              </Group>

              <Slider
                label="Overlay Blur"
                min={0}
                max={10}
                step={1}
                value={modalSettings.overlayBlur}
                onChange={(value) => setModalSettings({ ...modalSettings, overlayBlur: value })}
                marks={[
                  { value: 0, label: '0' },
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                ]}
              />

              <Button onClick={open} leftSection={<IconSettings size={16} />}>
                Open Configured Modal
              </Button>

              <Modal
                opened={opened}
                onClose={close}
                title={modalSettings.title}
                size={modalSettings.size}
                centered={modalSettings.centered}
                withCloseButton={modalSettings.withCloseButton}
                overlayProps={{ blur: modalSettings.overlayBlur }}
              >
                <Stack gap="md">
                  <Text>This is a configurable modal dialog.</Text>
                  <Text>Size: {modalSettings.size}</Text>
                  <Text>Centered: {modalSettings.centered ? 'Yes' : 'No'}</Text>
                  <Text>Close Button: {modalSettings.withCloseButton ? 'Yes' : 'No'}</Text>
                  <Text>Overlay Blur: {modalSettings.overlayBlur}</Text>
                </Stack>
              </Modal>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="switches" pt="md">
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>Advanced Controls</Title>

              <Paper withBorder p="md">
                <Stack gap="md">
                  <Text fw={500}>Feature Toggles</Text>
                  <List spacing="xs">
                    {Object.entries(formValues.features).map(([key, value]) => (
                      <List.Item
                        key={key}
                        icon={
                          <ThemeIcon color={value ? 'teal' : 'gray'} size={24} radius="xl">
                            {value ? <IconCheck size={16} /> : <IconX size={16} />}
                          </ThemeIcon>
                        }
                      >
                        <Group justify="space-between">
                          <Text size="sm">{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                          <ColorBoxSwitch
                            checked={value}
                            onChange={(checked) => setFormValues({
                              ...formValues,
                              features: { ...formValues.features, [key]: checked }
                            })}
                            color={value ? 'var(--mantine-color-teal-6)' : 'var(--mantine-color-gray-6)'}
                          />
                        </Group>
                      </List.Item>
                    ))}
                  </List>
                </Stack>
              </Paper>

              <Paper withBorder p="md">
                <Stack gap="md">
                  <Text fw={500}>Standard Controls</Text>
                  <Group>
                    <Switch label="Regular Switch" />
                    <Checkbox label="Regular Checkbox" />
                  </Group>
                </Stack>
              </Paper>

              <Paper withBorder p="md">
                <Stack gap="md">
                  <Text fw={500}>Color Box Switches</Text>
                  <Group>
                    <ColorBoxSwitch checked color="var(--mantine-color-blue-6)" onChange={() => {}} />
                    <ColorBoxSwitch checked color="var(--mantine-color-green-6)" onChange={() => {}} />
                    <ColorBoxSwitch checked color="var(--mantine-color-orange-6)" onChange={() => {}} />
                    <ColorBoxSwitch checked={false} color="var(--mantine-color-red-6)" onChange={() => {}} />
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
} 