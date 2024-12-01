import { useState } from 'react';
import {
  Title, Text, Card, Button, Group, Stack,
  TextInput, Textarea, NumberInput, Select,
  MultiSelect, Checkbox, Radio, Switch,
  Paper, Divider, Box, rem, ThemeIcon,
  Slider, RangeSlider, ColorInput, ActionIcon,
  Tooltip, Progress, Tabs,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconMail, IconPhone, IconBrandTwitter, 
  IconBrandLinkedin, IconBrandGithub, IconCheck,
  IconX, IconAlertCircle, IconInfoCircle,
  IconArrowRight, IconArrowLeft, IconDeviceMobile,
  IconBrandWhatsapp
} from '@tabler/icons-react';

interface ContactMethod {
  type: string;
  value: string;
  priority: number;
  verified: boolean;
}

function AnimatedValidationInput({ 
  value, 
  onChange, 
  validate, 
  label 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  validate: (value: string) => boolean | string;
  label: string;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleValidation = (value: string) => {
    const validationResult = validate(value);
    if (typeof validationResult === 'string') {
      setIsValid(false);
      setErrorMessage(validationResult);
    } else {
      setIsValid(validationResult);
      setErrorMessage('');
    }
  };

  return (
    <Box
      style={{
        position: 'relative',
        padding: '8px',
        border: `2px solid ${
          isValid === null ? 'var(--mantine-color-gray-4)' :
          isValid ? 'var(--mantine-color-green-6)' :
          'var(--mantine-color-red-6)'
        }`,
        borderRadius: 'var(--mantine-radius-md)',
        transition: 'all 0.2s ease',
        transform: isFocused ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <TextInput
        label={label}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          handleValidation(e.target.value);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        rightSection={
          isValid === null ? null :
          isValid ? (
            <ThemeIcon color="green" variant="light" size={24}>
              <IconCheck size={16} />
            </ThemeIcon>
          ) : (
            <Tooltip label={errorMessage} position="top-end">
              <ThemeIcon color="red" variant="light" size={24}>
                <IconX size={16} />
              </ThemeIcon>
            </Tooltip>
          )
        }
      />
      <Progress
        value={value.length ? 100 : 0}
        color={isValid ? 'green' : 'red'}
        size="xs"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          transition: 'all 0.3s ease',
          opacity: isFocused ? 1 : 0,
        }}
      />
    </Box>
  );
}

function ContactMethodInput({ method, onUpdate, onRemove }: { 
  method: ContactMethod; 
  onUpdate: (updated: ContactMethod) => void;
  onRemove: () => void;
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'email': return <IconMail size={16} />;
      case 'phone': return <IconPhone size={16} />;
      case 'twitter': return <IconBrandTwitter size={16} />;
      case 'linkedin': return <IconBrandLinkedin size={16} />;
      case 'github': return <IconBrandGithub size={16} />;
      case 'whatsapp': return <IconBrandWhatsapp size={16} />;
      default: return <IconDeviceMobile size={16} />;
    }
  };

  return (
    <Paper 
      withBorder 
      p="md" 
      style={{ 
        position: 'relative',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateX(5px)',
        }
      }}
    >
      <Group align="flex-start">
        <Box style={{ flex: 1 }}>
          <Group mb="xs">
            {getIcon(method.type)}
            <Text size="sm" fw={500} style={{ textTransform: 'capitalize' }}>
              {method.type}
            </Text>
            {method.verified && (
              <Tooltip label="Verified">
                <ThemeIcon color="green" variant="light" size={18}>
                  <IconCheck size={12} />
                </ThemeIcon>
              </Tooltip>
            )}
          </Group>
          <TextInput
            value={method.value}
            onChange={(e) => onUpdate({ ...method, value: e.target.value })}
            placeholder={`Enter ${method.type}`}
            size="sm"
          />
        </Box>
        
        <Stack gap="xs">
          <Tooltip label="Priority">
            <NumberInput
              value={method.priority}
              onChange={(value) => onUpdate({ ...method, priority: value as number })}
              min={1}
              max={5}
              size="xs"
              w={60}
            />
          </Tooltip>
          <Tooltip label="Remove">
            <ActionIcon color="red" variant="light" onClick={onRemove}>
              <IconX size={16} />
            </ActionIcon>
          </Tooltip>
        </Stack>
      </Group>

      <Progress 
        value={method.priority * 20} 
        color={method.verified ? 'green' : 'blue'}
        size="xs"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}
      />
    </Paper>
  );
}

function DynamicRangeInput({ 
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  description
}: {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  description?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const percentage = ((value[1] - value[0]) / (max - min)) * 100;

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Group position="apart" mb="xs">
        <Text size="sm" fw={500}>{label}</Text>
        <Group spacing={4}>
          <Text size="xs" c="dimmed">{value[0]}</Text>
          <IconArrowRight size={12} style={{ opacity: 0.5 }} />
          <Text size="xs" c="dimmed">{value[1]}</Text>
        </Group>
      </Group>

      <Paper 
        withBorder 
        p="md"
        style={{
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.01)' : 'scale(1)',
        }}
      >
        <RangeSlider
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          label={null}
          styles={{
            thumb: {
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.2)',
              },
            },
          }}
        />

        <Progress
          value={percentage}
          color={percentage > 75 ? 'red' : percentage > 50 ? 'yellow' : 'green'}
          size="xs"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            transition: 'all 0.3s ease',
          }}
        />

        {description && (
          <Text 
            size="xs" 
            c="dimmed" 
            mt="sm"
            style={{
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          >
            {description}
          </Text>
        )}
      </Paper>
    </Box>
  );
}

export function FormShowcase() {
  const [contactMethods, setContactMethods] = useState<ContactMethod[]>([
    { type: 'email', value: '', priority: 1, verified: false },
  ]);

  const [budgetRange, setBudgetRange] = useState<[number, number]>([1000, 5000]);

  const form = useForm({
    initialValues: {
      projectName: '',
      description: '',
      timeline: [1, 6], // months
      teamSize: [2, 5], // people
    },
    validate: {
      projectName: (value) => 
        value.length < 3 ? 'Project name must be at least 3 characters' :
        value.length > 50 ? 'Project name must be less than 50 characters' :
        null,
    },
  });

  return (
    <Stack gap="xl">
      <Title order={2}>Advanced Form Patterns</Title>

      <Tabs defaultValue="animated">
        <Tabs.List>
          <Tabs.Tab value="animated">Animated Validation</Tabs.Tab>
          <Tabs.Tab value="dynamic">Dynamic Inputs</Tabs.Tab>
          <Tabs.Tab value="range">Range Controls</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="animated" pt="md">
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>Animated Form Validation</Title>
              <Text c="dimmed" size="sm">
                Experience smooth, interactive form validation with visual feedback
              </Text>

              <AnimatedValidationInput
                label="Project Name"
                value={form.values.projectName}
                onChange={(value) => form.setFieldValue('projectName', value)}
                validate={(value) => {
                  if (value.length < 3) return 'Too short';
                  if (value.length > 50) return 'Too long';
                  return true;
                }}
              />

              <Textarea
                label="Project Description"
                placeholder="Describe your project"
                minRows={3}
                {...form.getInputProps('description')}
              />
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="dynamic" pt="md">
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>Dynamic Contact Methods</Title>
              <Text c="dimmed" size="sm">
                Add and manage multiple contact methods with priority levels
              </Text>

              {contactMethods.map((method, index) => (
                <ContactMethodInput
                  key={index}
                  method={method}
                  onUpdate={(updated) => {
                    const newMethods = [...contactMethods];
                    newMethods[index] = updated;
                    setContactMethods(newMethods);
                  }}
                  onRemove={() => {
                    setContactMethods(methods => 
                      methods.filter((_, i) => i !== index)
                    );
                  }}
                />
              ))}

              <Group>
                <Select
                  placeholder="Add contact method"
                  data={[
                    { value: 'email', label: 'Email' },
                    { value: 'phone', label: 'Phone' },
                    { value: 'twitter', label: 'Twitter' },
                    { value: 'linkedin', label: 'LinkedIn' },
                    { value: 'github', label: 'GitHub' },
                    { value: 'whatsapp', label: 'WhatsApp' },
                  ]}
                  onChange={(value) => {
                    if (value) {
                      setContactMethods([
                        ...contactMethods,
                        { type: value, value: '', priority: 1, verified: false }
                      ]);
                    }
                  }}
                />
              </Group>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="range" pt="md">
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>Interactive Range Controls</Title>
              <Text c="dimmed" size="sm">
                Set ranges with visual feedback and dynamic validation
              </Text>

              <DynamicRangeInput
                label="Project Timeline"
                value={form.values.timeline}
                onChange={(value) => form.setFieldValue('timeline', value)}
                min={1}
                max={24}
                step={1}
                description="Estimated project duration in months"
              />

              <DynamicRangeInput
                label="Team Size"
                value={form.values.teamSize}
                onChange={(value) => form.setFieldValue('teamSize', value)}
                min={1}
                max={20}
                step={1}
                description="Number of team members needed"
              />

              <DynamicRangeInput
                label="Budget Range"
                value={budgetRange}
                onChange={setBudgetRange}
                min={1000}
                max={50000}
                step={1000}
                description="Estimated budget in dollars"
              />
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
} 