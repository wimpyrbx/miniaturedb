import { useState } from 'react';
import {
  Button, Modal, Group, Text, Stack, Title, Paper,
  TextInput, Checkbox, Select, ColorInput, NumberInput,
  ThemeIcon, ActionIcon, Tooltip, SimpleGrid, Tabs,
  Divider, Box, Progress, Badge, Drawer, LoadingOverlay
} from '@mantine/core';
import {
  IconSettings, IconAlertCircle, IconInfoCircle,
  IconCheck, IconX, IconPhoto, IconUpload, IconTrash,
  IconEdit, IconDots
} from '@tabler/icons-react';

function BasicModals() {
  const [confirmOpened, setConfirmOpened] = useState(false);
  const [alertOpened, setAlertOpened] = useState(false);
  const [successOpened, setSuccessOpened] = useState(false);
  const [customOpened, setCustomOpened] = useState(false);

  return (
    <Stack>
      <Group>
        <Button color="red" onClick={() => setConfirmOpened(true)}>
          Delete Item
        </Button>
        <Button color="yellow" onClick={() => setAlertOpened(true)}>
          Show Warning
        </Button>
        <Button color="teal" onClick={() => setSuccessOpened(true)}>
          Show Success
        </Button>
        <Button onClick={() => setCustomOpened(true)}>
          Custom Modal
        </Button>
      </Group>

      {/* Confirmation Modal */}
      <Modal
        opened={confirmOpened}
        onClose={() => setConfirmOpened(false)}
        title={
          <Group gap="xs">
            <ThemeIcon color="red" variant="light">
              <IconTrash size={16} />
            </ThemeIcon>
            <Text>Confirm Deletion</Text>
          </Group>
        }
        centered
      >
        <Text size="sm" mb="lg">
          Are you sure you want to delete this item? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setConfirmOpened(false)}>Cancel</Button>
          <Button color="red" onClick={() => setConfirmOpened(false)}>Delete</Button>
        </Group>
      </Modal>

      {/* Alert Modal */}
      <Modal
        opened={alertOpened}
        onClose={() => setAlertOpened(false)}
        title={
          <Group gap="xs">
            <ThemeIcon color="yellow" variant="light">
              <IconAlertCircle size={16} />
            </ThemeIcon>
            <Text>Warning</Text>
          </Group>
        }
        centered
      >
        <Text size="sm" mb="lg">
          This action might have unexpected consequences. Please review the following:
        </Text>
        <Stack gap="xs" mb="lg">
          <Group gap="xs">
            <IconAlertCircle size={16} color="var(--mantine-color-yellow-6)" />
            <Text size="sm">Some features might become temporarily unavailable</Text>
          </Group>
          <Group gap="xs">
            <IconAlertCircle size={16} color="var(--mantine-color-yellow-6)" />
            <Text size="sm">You might need to refresh your browser</Text>
          </Group>
        </Stack>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setAlertOpened(false)}>Cancel</Button>
          <Button color="yellow" onClick={() => setAlertOpened(false)}>Proceed</Button>
        </Group>
      </Modal>

      {/* Success Modal */}
      <Modal
        opened={successOpened}
        onClose={() => setSuccessOpened(false)}
        title={
          <Group gap="xs">
            <ThemeIcon color="teal" variant="light">
              <IconCheck size={16} />
            </ThemeIcon>
            <Text>Success</Text>
          </Group>
        }
        centered
      >
        <Stack align="center" py="xl">
          <ThemeIcon size={60} radius="xl" color="teal">
            <IconCheck size={30} />
          </ThemeIcon>
          <Text size="lg" fw={500} ta="center">Operation Completed Successfully</Text>
          <Text size="sm" c="dimmed" ta="center">
            All changes have been saved. You can safely continue working.
          </Text>
        </Stack>
        <Group justify="center">
          <Button color="teal" onClick={() => setSuccessOpened(false)}>Continue</Button>
        </Group>
      </Modal>

      {/* Custom Modal */}
      <Modal
        opened={customOpened}
        onClose={() => setCustomOpened(false)}
        title={
          <Group gap="xs">
            <ThemeIcon color="blue" variant="light">
              <IconSettings size={16} />
            </ThemeIcon>
            <Text>Custom Settings</Text>
          </Group>
        }
        size="lg"
        centered
      >
        <Stack>
          <SimpleGrid cols={2}>
            <TextInput label="Name" placeholder="Enter name" />
            <Select
              label="Category"
              placeholder="Select category"
              data={['Option 1', 'Option 2', 'Option 3']}
            />
            <ColorInput label="Primary Color" />
            <NumberInput label="Maximum Items" min={0} max={100} />
          </SimpleGrid>
          
          <Divider label="Advanced Settings" labelPosition="center" />
          
          <SimpleGrid cols={2}>
            <Checkbox label="Enable notifications" defaultChecked />
            <Checkbox label="Auto-save changes" />
            <Checkbox label="Show tooltips" defaultChecked />
            <Checkbox label="Compact mode" />
          </SimpleGrid>

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCustomOpened(false)}>Cancel</Button>
            <Button onClick={() => setCustomOpened(false)}>Save Changes</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

function AdvancedModals() {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [loadingOpened, setLoadingOpened] = useState(false);
  const [multistepOpened, setMultistepOpened] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const simulateLoading = () => {
    setLoadingOpened(true);
    setTimeout(() => setLoadingOpened(false), 2000);
  };

  return (
    <Stack>
      <Group>
        <Button variant="default" onClick={() => setDrawerOpened(true)}>
          Open Drawer
        </Button>
        <Button variant="default" onClick={simulateLoading}>
          Loading Modal
        </Button>
        <Button variant="default" onClick={() => {
          setCurrentStep(1);
          setMultistepOpened(true);
        }}>
          Multi-step Modal
        </Button>
      </Group>

      {/* Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        title="Drawer Example"
        position="right"
        size="md"
      >
        <Stack>
          <Text size="sm">This is a drawer that slides in from the side.</Text>
          <Paper withBorder p="md">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">Document 1</Text>
                <Group gap="xs">
                  <ActionIcon variant="subtle" color="blue">
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red">
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
              <Progress value={75} size="sm" />
            </Stack>
          </Paper>
          <Paper withBorder p="md">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">Document 2</Text>
                <Group gap="xs">
                  <ActionIcon variant="subtle" color="blue">
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red">
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
              <Progress value={45} size="sm" />
            </Stack>
          </Paper>
        </Stack>
      </Drawer>

      {/* Loading Modal */}
      <Modal
        opened={loadingOpened}
        onClose={() => setLoadingOpened(false)}
        centered
        withCloseButton={false}
      >
        <Stack align="center" py="xl">
          <LoadingOverlay visible={true} />
          <Text size="sm">Processing your request...</Text>
        </Stack>
      </Modal>

      {/* Multi-step Modal */}
      <Modal
        opened={multistepOpened}
        onClose={() => setMultistepOpened(false)}
        title={
          <Group position="apart">
            <Text>Setup Wizard</Text>
            <Badge>{currentStep} of 3</Badge>
          </Group>
        }
        size="lg"
        centered
      >
        <Stack>
          <Progress value={(currentStep / 3) * 100} size="sm" mb="md" />
          
          {currentStep === 1 && (
            <Stack>
              <Title order={4}>Basic Information</Title>
              <SimpleGrid cols={2}>
                <TextInput label="First Name" required />
                <TextInput label="Last Name" required />
                <TextInput label="Email" required type="email" />
                <TextInput label="Phone" />
              </SimpleGrid>
            </Stack>
          )}

          {currentStep === 2 && (
            <Stack>
              <Title order={4}>Preferences</Title>
              <Select
                label="Theme"
                data={['Light', 'Dark', 'System']}
                required
              />
              <Select
                label="Language"
                data={['English', 'Spanish', 'French']}
                required
              />
              <Checkbox label="Enable notifications" defaultChecked />
              <Checkbox label="Subscribe to newsletter" />
            </Stack>
          )}

          {currentStep === 3 && (
            <Stack>
              <Title order={4}>Confirmation</Title>
              <Text size="sm">Please review your information and confirm:</Text>
              <Paper withBorder p="md">
                <Stack gap="xs">
                  <Group position="apart">
                    <Text size="sm" c="dimmed">Profile</Text>
                    <Badge color="green">Complete</Badge>
                  </Group>
                  <Group position="apart">
                    <Text size="sm" c="dimmed">Preferences</Text>
                    <Badge color="green">Complete</Badge>
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          )}

          <Group justify="flex-end" mt="xl">
            {currentStep > 1 && (
              <Button variant="default" onClick={() => setCurrentStep(s => s - 1)}>
                Back
              </Button>
            )}
            {currentStep < 3 ? (
              <Button onClick={() => setCurrentStep(s => s + 1)}>
                Next
              </Button>
            ) : (
              <Button color="green" onClick={() => setMultistepOpened(false)}>
                Complete
              </Button>
            )}
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

export function ModalShowcase() {
  return (
    <Stack gap="xl">
      <Title order={2}>Modal Patterns</Title>

      <Tabs defaultValue="basic">
        <Tabs.List>
          <Tabs.Tab value="basic">Basic Modals</Tabs.Tab>
          <Tabs.Tab value="advanced">Advanced Patterns</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="basic" pt="md">
          <BasicModals />
        </Tabs.Panel>

        <Tabs.Panel value="advanced" pt="md">
          <AdvancedModals />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
} 