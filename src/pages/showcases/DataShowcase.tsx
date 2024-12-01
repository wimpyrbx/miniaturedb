import { Title, Text, Card, Group, Stack, RingProgress, Paper, SimpleGrid, ThemeIcon, Progress, Tabs, Box } from '@mantine/core';
import { IconDatabase, IconServer, IconCpu, IconNetwork, IconAlertTriangle, IconCheck } from '@tabler/icons-react';

interface StatusCardProps {
  title: string;
  status: 'operational' | 'warning' | 'critical';
  metrics: {
    label: string;
    value: number;
    color: string;
  }[];
}

function StatusCard({ title, status, metrics }: StatusCardProps) {
  const statusColors = {
    operational: 'teal',
    warning: 'yellow',
    critical: 'red'
  };

  const statusIcons = {
    operational: <IconCheck size={16} />,
    warning: <IconAlertTriangle size={16} />,
    critical: <IconAlertTriangle size={16} />
  };

  return (
    <Card withBorder shadow="sm">
      <Stack>
        <Group justify="space-between">
          <Group>
            <ThemeIcon color={statusColors[status]} variant="light">
              {statusIcons[status]}
            </ThemeIcon>
            <Text fw={500}>{title}</Text>
          </Group>
          <Text size="sm" c={statusColors[status]} fw={500}>
            {status.toUpperCase()}
          </Text>
        </Group>

        <SimpleGrid cols={metrics.length}>
          {metrics.map((metric, index) => (
            <Box key={index}>
              <Text size="sm" c="dimmed" mb={5}>
                {metric.label}
              </Text>
              <RingProgress
                size={80}
                thickness={8}
                roundCaps
                sections={[{ value: metric.value, color: metric.color }]}
                label={
                  <Text fw={700} ta="center" size="sm">
                    {metric.value}%
                  </Text>
                }
              />
            </Box>
          ))}
        </SimpleGrid>
      </Stack>
    </Card>
  );
}

function ResourceMonitor() {
  return (
    <Paper withBorder p="md">
      <Stack>
        <Group justify="space-between">
          <Text fw={500}>Resource Usage</Text>
          <ThemeIcon color="blue" variant="light">
            <IconCpu size={16} />
          </ThemeIcon>
        </Group>

        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm">CPU Usage</Text>
            <Text size="sm" fw={500}>78%</Text>
          </Group>
          <Progress
            value={78}
            color="blue"
            size="lg"
            radius="xl"
            sections={[
              { value: 45, color: 'cyan' },
              { value: 33, color: 'blue' }
            ]}
          />

          <Group justify="space-between">
            <Text size="sm">Memory Usage</Text>
            <Text size="sm" fw={500}>64%</Text>
          </Group>
          <Progress
            value={64}
            color="violet"
            size="lg"
            radius="xl"
            sections={[
              { value: 40, color: 'grape' },
              { value: 24, color: 'violet' }
            ]}
          />

          <Group justify="space-between">
            <Text size="sm">Network I/O</Text>
            <Text size="sm" fw={500}>45%</Text>
          </Group>
          <Progress
            value={45}
            color="teal"
            size="lg"
            radius="xl"
            sections={[
              { value: 25, color: 'green' },
              { value: 20, color: 'teal' }
            ]}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}

function NetworkStatus() {
  const connections = [
    { name: 'Primary DB', latency: 12, status: 'operational' },
    { name: 'Cache Server', latency: 8, status: 'operational' },
    { name: 'API Gateway', latency: 24, status: 'warning' },
    { name: 'CDN Edge', latency: 45, status: 'critical' },
  ];

  return (
    <Paper withBorder p="md">
      <Stack>
        <Group justify="space-between">
          <Text fw={500}>Network Status</Text>
          <ThemeIcon color="grape" variant="light">
            <IconNetwork size={16} />
          </ThemeIcon>
        </Group>

        <Stack gap="xs">
          {connections.map((conn, index) => (
            <Group key={index} justify="space-between">
              <Group gap="xs">
                <ThemeIcon 
                  color={conn.status === 'operational' ? 'teal' : conn.status === 'warning' ? 'yellow' : 'red'} 
                  variant="light" 
                  size="sm"
                >
                  {conn.status === 'operational' ? <IconCheck size={12} /> : <IconAlertTriangle size={12} />}
                </ThemeIcon>
                <Text size="sm">{conn.name}</Text>
              </Group>
              <Group gap="xs">
                <Text size="sm" fw={500}>{conn.latency}ms</Text>
                <Progress
                  value={Math.min(100, conn.latency * 2)}
                  color={conn.status === 'operational' ? 'teal' : conn.status === 'warning' ? 'yellow' : 'red'}
                  size="sm"
                  w={60}
                />
              </Group>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}

export function DataShowcase() {
  return (
    <Stack gap="xl">
      <Title order={2}>System Status</Title>

      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="resources">Resources</Tabs.Tab>
          <Tabs.Tab value="network">Network</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <SimpleGrid cols={2}>
            <StatusCard
              title="Main Database"
              status="operational"
              metrics={[
                { label: "Uptime", value: 100, color: "teal" },
                { label: "Response", value: 95, color: "teal" },
                { label: "Load", value: 45, color: "blue" }
              ]}
            />
            <StatusCard
              title="API Gateway"
              status="warning"
              metrics={[
                { label: "Uptime", value: 98, color: "yellow" },
                { label: "Latency", value: 75, color: "orange" },
                { label: "Success", value: 85, color: "yellow" }
              ]}
            />
            <StatusCard
              title="Cache Layer"
              status="operational"
              metrics={[
                { label: "Hit Rate", value: 92, color: "teal" },
                { label: "Memory", value: 65, color: "blue" },
                { label: "Load", value: 30, color: "green" }
              ]}
            />
            <StatusCard
              title="Worker Nodes"
              status="critical"
              metrics={[
                { label: "Active", value: 45, color: "red" },
                { label: "Tasks", value: 20, color: "orange" },
                { label: "Errors", value: 80, color: "red" }
              ]}
            />
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="resources" pt="md">
          <SimpleGrid cols={2}>
            <ResourceMonitor />
            <Paper withBorder p="md">
              <Stack>
                <Text fw={500}>System Load</Text>
                <SimpleGrid cols={2}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <RingProgress
                      key={i}
                      size={120}
                      thickness={12}
                      roundCaps
                      sections={[
                        { value: Math.random() * 40 + 30, color: 'blue' },
                        { value: Math.random() * 20 + 10, color: 'cyan' }
                      ]}
                      label={
                        <Stack gap={0} align="center">
                          <Text fw={700} size="lg">Node {i + 1}</Text>
                          <Text size="xs" c="dimmed">Active</Text>
                        </Stack>
                      }
                    />
                  ))}
                </SimpleGrid>
              </Stack>
            </Paper>
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="network" pt="md">
          <SimpleGrid cols={2}>
            <NetworkStatus />
            <Paper withBorder p="md">
              <Stack>
                <Text fw={500}>Traffic Distribution</Text>
                <Group grow align="flex-start">
                  {['Americas', 'Europe', 'Asia', 'Others'].map((region, i) => (
                    <Stack key={i} gap={5} align="center">
                      <RingProgress
                        size={90}
                        thickness={8}
                        roundCaps
                        sections={[{ value: Math.random() * 50 + 25, color: ['blue', 'grape', 'violet', 'indigo'][i] }]}
                        label={
                          <Text fw={700} ta="center" size="lg">
                            {Math.round(Math.random() * 50 + 25)}%
                          </Text>
                        }
                      />
                      <Text size="sm">{region}</Text>
                    </Stack>
                  ))}
                </Group>
              </Stack>
            </Paper>
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
} 