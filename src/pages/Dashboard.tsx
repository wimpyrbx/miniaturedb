import { Card, Grid, Stack, Title, Center, Loader, useMantineTheme } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { getTypeDistribution, getLocationDistribution, getCollectionGrowth } from '../api/dashboard';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import type { TypeDistribution, LocationDistribution, CollectionGrowth } from '../types/dashboard';

const COLORS = ['#339af0', '#51cf66', '#fcc419', '#ff6b6b', '#cc5de8', '#845ef7'];

// Custom tooltip styles for dark theme
const CustomTooltip = ({ active, payload, label }: any) => {
  const theme = useMantineTheme();
  
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: theme.colors.dark[7],
        padding: theme.spacing.xs,
        border: `1px solid ${theme.colors.dark[4]}`,
        borderRadius: theme.radius.sm
      }}>
        <p style={{ color: theme.colors.gray[0], margin: '0 0 4px 0' }}>{label}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.color || theme.colors.blue[4], margin: '2px 0' }}>
            {`${pld.name}: ${pld.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const theme = useMantineTheme();
  const chartConfig = {
    style: {
      backgroundColor: 'transparent'
    },
    label: {
      fill: theme.colors.gray[0]
    },
    tick: {
      fill: theme.colors.gray[0]
    }
  };

  const { data: typeDistribution, isLoading: isLoadingTypes } = useQuery<TypeDistribution[]>({
    queryKey: ['dashboard', 'typeDistribution'],
    queryFn: getTypeDistribution
  });

  const { data: locationDistribution, isLoading: isLoadingLocations } = useQuery<LocationDistribution[]>({
    queryKey: ['dashboard', 'locationDistribution'],
    queryFn: getLocationDistribution
  });

  const { data: collectionGrowth, isLoading: isLoadingGrowth } = useQuery<CollectionGrowth[]>({
    queryKey: ['dashboard', 'collectionGrowth'],
    queryFn: getCollectionGrowth
  });

  return (
    <Stack>
      <Title order={1}>Dashboard</Title>
      
      <Grid>
        {/* Type Distribution Card */}
        <Grid.Col span={12}>
          <Card shadow="sm" p="md">
            <Title order={2} size="h3" mb="md">Type Distribution</Title>
            {isLoadingTypes ? (
              <Center h={300}>
                <Loader />
              </Center>
            ) : typeDistribution && typeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeDistribution} style={chartConfig.style}>
                  <XAxis 
                    dataKey="type" 
                    tick={chartConfig.tick}
                  />
                  <YAxis 
                    tick={chartConfig.tick}
                    tickCount={5}
                    allowDecimals={false}
                    domain={[0, 'dataMax']}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: theme.colors.dark[6] }}
                  />
                  <Legend 
                    formatter={(value) => <span style={{ color: theme.colors.gray[0] }}>{value}</span>}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={theme.colors.blue[7]} />
                      <stop offset="100%" stopColor={theme.colors.blue[5]} />
                    </linearGradient>
                  </defs>
                  <Bar 
                    dataKey="count" 
                    name="Total Minis" 
                    fill="url(#barGradient)"
                    activeBar={{ fill: theme.colors.blue[4] }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Center h={300}>
                <Title order={3} c="dimmed">No type data available</Title>
              </Center>
            )}
          </Card>
        </Grid.Col>

        {/* Location Distribution Card */}
        <Grid.Col span={6}>
          <Card shadow="sm" p="md">
            <Title order={2} size="h3" mb="md">Location Distribution</Title>
            {isLoadingLocations ? (
              <Center h={300}>
                <Loader />
              </Center>
            ) : locationDistribution && locationDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart style={chartConfig.style}>
                  <Pie
                    data={locationDistribution}
                    dataKey="count"
                    nameKey="location"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={chartConfig.label}
                  >
                    {locationDistribution.map((entry, index) => (
                      <Cell key={entry.location} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    formatter={(value) => <span style={{ color: theme.colors.gray[0] }}>{value}</span>}
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Center h={300}>
                <Title order={3} c="dimmed">No location data available</Title>
              </Center>
            )}
          </Card>
        </Grid.Col>

        {/* Collection Growth Card */}
        <Grid.Col span={6}>
          <Card shadow="sm" p="md">
            <Title order={2} size="h3" mb="md">Collection Growth</Title>
            {isLoadingGrowth ? (
              <Center h={300}>
                <Loader />
              </Center>
            ) : collectionGrowth && collectionGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={collectionGrowth} style={chartConfig.style}>
                  <XAxis 
                    dataKey="month" 
                    tick={chartConfig.tick}
                  />
                  <YAxis 
                    tick={chartConfig.tick}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    formatter={(value) => <span style={{ color: theme.colors.gray[0] }}>{value}</span>}
                  />
                  <Line type="monotone" dataKey="count" name="Total Minis" stroke={theme.colors.blue[4]} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Center h={300}>
                <Title order={3} c="dimmed">No growth data available</Title>
              </Center>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
} 