import { useState, useEffect } from 'react';
import { Card, Grid, Stack, Title, Center, Loader, useMantineTheme, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { 
  getTypeDistribution, 
  getLocationDistribution, 
  getCollectionGrowth,
  getPaintedByDistribution,
  getBaseSizeDistribution,
  getProductLineDistribution,
  getTopCompanyDistribution,
  getTopSetDistribution,
  getTagDistribution 
} from '../api/dashboard';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';
import { TagCloud } from 'react-tagcloud';
import type { 
  TypeDistribution, 
  LocationDistribution, 
  CollectionGrowth,
  PaintedByDistribution,
  ProductLineDistribution,
  CompanyDistribution,
  SetDistribution,
  TagDistribution 
} from '../types/dashboard';

const COLORS = ['#339af0', '#51cf66', '#fcc419', '#ff6b6b', '#cc5de8', '#845ef7'];

// Custom tooltip styles for dark theme
const CustomTooltip = ({ active, payload, label }: any) => {
  const theme = useMantineTheme();
  
  if (active && payload && payload.length) {
    // Check if we have company/productLine info
    const hasCompanyInfo = payload[0]?.payload?.company;
    const hasProductLineInfo = payload[0]?.payload?.productLine;

    return (
      <div style={{ 
        backgroundColor: theme.colors.dark[7],
        padding: theme.spacing.xs,
        border: `1px solid ${theme.colors.dark[4]}`,
        borderRadius: theme.radius.sm
      }}>
        {hasCompanyInfo && hasProductLineInfo ? (
          <>
            <p style={{ color: theme.colors.gray[0], margin: '0 0 4px 0', fontWeight: 'bold' }}>{label}</p>
            <p style={{ color: theme.colors.gray[2], margin: '2px 0', fontSize: '0.9em' }}>
              {payload[0].payload.company} / {payload[0].payload.productLine}
            </p>
            <p style={{ color: payload[0].color || theme.colors.blue[4], margin: '4px 0 0 0' }}>
              {`${payload[0].name}: ${payload[0].value}`}
            </p>
          </>
        ) : hasCompanyInfo ? (
          <>
            <p style={{ color: theme.colors.gray[0], margin: '0 0 4px 0', fontWeight: 'bold' }}>{label}</p>
            <p style={{ color: theme.colors.gray[2], margin: '2px 0', fontSize: '0.9em' }}>
              {payload[0].payload.company}
            </p>
            <p style={{ color: payload[0].color || theme.colors.blue[4], margin: '4px 0 0 0' }}>
              {`${payload[0].name}: ${payload[0].value}`}
            </p>
          </>
        ) : (
          <>
            <p style={{ color: theme.colors.gray[0], margin: '0 0 4px 0' }}>{label}</p>
            {payload.map((pld: any, index: number) => (
              <p key={index} style={{ color: pld.color || theme.colors.blue[4], margin: '2px 0' }}>
                {`${pld.name}: ${pld.value}`}
              </p>
            ))}
          </>
        )}
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const theme = useMantineTheme();
  const chartConfig = {
    style: {
      background: 'transparent'
    },
    label: {
      fill: theme.colors.gray[4],
      fontSize: 12
    },
    axis: {
      stroke: theme.colors.gray[4],
      strokeWidth: 1,
      fontSize: 12,
      fontWeight: 400,
      tickLine: false,
      fill: theme.colors.gray[4]
    },
    grid: {
      stroke: theme.colors.dark[4],
      strokeDasharray: '3 3'
    },
    tooltip: {
      contentStyle: {
        background: theme.colors.dark[7],
        border: 'none',
        borderRadius: theme.radius.sm,
        color: theme.colors.gray[4]
      }
    },
    bar: {
      fill: theme.colors.blue[6],
      radius: [4, 4, 0, 0] as [number, number, number, number]
    }
  };

  const [typeDistribution, setTypeDistribution] = useState<TypeDistribution[]>([]);
  const [locationDistribution, setLocationDistribution] = useState<LocationDistribution[]>([]);
  const [collectionGrowth, setCollectionGrowth] = useState<CollectionGrowth[]>([]);
  const [paintedByDistribution, setPaintedByDistribution] = useState<PaintedByDistribution[]>([]);
  const [baseSizeDistribution, setBaseSizeDistribution] = useState<PaintedByDistribution[]>([]);
  const [productLineDistribution, setProductLineDistribution] = useState<ProductLineDistribution[]>([]);
  const [topCompanyDistribution, setTopCompanyDistribution] = useState<CompanyDistribution[]>([]);
  const [topSetDistribution, setTopSetDistribution] = useState<SetDistribution[]>([]);
  const [tagDistribution, setTagDistribution] = useState<TagDistribution[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  const { data: typeDistributionData, isLoading: isLoadingTypes } = useQuery<TypeDistribution[]>({
    queryKey: ['dashboard', 'typeDistribution'],
    queryFn: getTypeDistribution
  });

  const { data: locationDistributionData, isLoading: isLoadingLocations } = useQuery<LocationDistribution[]>({
    queryKey: ['dashboard', 'locationDistribution'],
    queryFn: getLocationDistribution
  });

  const { data: collectionGrowthData, isLoading: isLoadingGrowth } = useQuery<CollectionGrowth[]>({
    queryKey: ['dashboard', 'collectionGrowth'],
    queryFn: getCollectionGrowth
  });

  const { data: paintedByDistributionData, isLoading: isLoadingPaintedBy } = useQuery<PaintedByDistribution[]>({
    queryKey: ['dashboard', 'paintedByDistribution'],
    queryFn: getPaintedByDistribution
  });

  const { data: baseSizeDistributionData, isLoading: isLoadingBaseSize } = useQuery<PaintedByDistribution[]>({
    queryKey: ['dashboard', 'baseSizeDistribution'],
    queryFn: getBaseSizeDistribution
  });

  const { data: productLineDistributionData, isLoading: isLoadingProductLine } = useQuery<ProductLineDistribution[]>({
    queryKey: ['dashboard', 'productLineDistribution'],
    queryFn: getProductLineDistribution
  });

  const { data: topCompanyDistributionData, isLoading: isLoadingTopCompany } = useQuery<CompanyDistribution[]>({
    queryKey: ['dashboard', 'topCompanyDistribution'],
    queryFn: getTopCompanyDistribution
  });

  const { data: topSetDistributionData, isLoading: isLoadingTopSet } = useQuery<SetDistribution[]>({
    queryKey: ['dashboard', 'topSetDistribution'],
    queryFn: getTopSetDistribution
  });

  const { data: tagDistributionData, isLoading: isLoadingTags } = useQuery<TagDistribution[]>({
    queryKey: ['dashboard', 'tagDistribution'],
    queryFn: getTagDistribution
  });

  // Function to format product line labels
  const formatProductLineLabel = (label: string, entry: ProductLineDistribution) => {
    return `${entry?.company || ''} / ${label}`;
  };

  // Function to format set labels
  const formatSetLabel = (label: string) => {
    return label;
  };

  // Add gradient definition for bars
  const renderGradient = () => (
    <defs>
      <linearGradient id={theme.colors.blue[6]} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={theme.colors.blue[6]} stopOpacity={1} />
        <stop offset="100%" stopColor={theme.colors.blue[8]} stopOpacity={1} />
      </linearGradient>
    </defs>
  );

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
            ) : typeDistributionData && typeDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeDistributionData} style={chartConfig.style}>
                  <XAxis 
                    dataKey="type" 
                    {...chartConfig.axis}
                  />
                  <YAxis 
                    {...chartConfig.axis}
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
            ) : locationDistributionData && locationDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart style={chartConfig.style}>
                  <Pie
                    data={locationDistributionData}
                    dataKey="count"
                    nameKey="location"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={chartConfig.label}
                  >
                    {locationDistributionData.map((entry, index) => (
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
            ) : collectionGrowthData && collectionGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={collectionGrowthData} style={chartConfig.style}>
                  <XAxis 
                    dataKey="month" 
                    {...chartConfig.axis}
                  />
                  <YAxis 
                    {...chartConfig.axis}
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

        {/* Painted By Distribution Card */}
        <Grid.Col span={6}>
          <Card shadow="sm" p="md">
            <Title order={2} size="h3" mb="md">Paintedz... By Distribution</Title>
            {isLoadingPaintedBy ? (
              <Center h={300}>
                <Loader />
              </Center>
            ) : paintedByDistributionData && paintedByDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart style={chartConfig.style}>
                  <Pie
                    data={paintedByDistributionData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={chartConfig.label}
                  >
                    {paintedByDistributionData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
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
                <Title order={3} c="dimmed">No painted by data available</Title>
              </Center>
            )}
          </Card>
        </Grid.Col>

        {/* Base Size Distribution Card */}
        <Grid.Col span={6}>
          <Card shadow="sm" p="md">
            <Title order={2} size="h3" mb="md">Base Size Distribution</Title>
            {isLoadingBaseSize ? (
              <Center h={300}>
                <Loader />
              </Center>
            ) : baseSizeDistributionData && baseSizeDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={baseSizeDistributionData}
                  layout="vertical"
                  style={chartConfig.style}
                >
                  <XAxis 
                    type="number"
                    {...chartConfig.axis}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    {...chartConfig.axis}
                    width={100}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: theme.colors.dark[6] }}
                  />
                  <Legend 
                    formatter={(value) => <span style={{ color: theme.colors.gray[0] }}>{value}</span>}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Total Minis" 
                    fill="url(#barGradient)"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Center h={300}>
                <Title order={3} c="dimmed">No base size data available</Title>
              </Center>
            )}
          </Card>
        </Grid.Col>

        {/* Product Line Analysis Section */}
        <Grid.Col span={12}>
          <Title order={2} mb="md">Product Line Analysis</Title>
          <Text size="sm" c="dimmed" mb="lg">All counts represent unique miniatures, regardless of quantity owned</Text>
          <Grid>
            {/* Product Line Distribution Card */}
            <Grid.Col span={4}>
              <Card shadow="sm" p="md">
                <Title order={3} size="h3" mb="md">Product Line Distribution</Title>
                {isLoadingProductLine ? (
                  <Center h={300}>
                    <Loader />
                  </Center>
                ) : productLineDistributionData && productLineDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={productLineDistributionData}
                      layout="vertical"
                      style={chartConfig.style}
                    >
                      <XAxis type="number" {...chartConfig.axis} />
                      <YAxis type="category" dataKey="productLine" {...chartConfig.axis} />
                      <Tooltip {...chartConfig.tooltip} />
                      <Bar dataKey="count" {...chartConfig.bar} />
                      <CartesianGrid {...chartConfig.grid} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Center h={300}>
                    <Title order={3} c="dimmed">No product line data available</Title>
                  </Center>
                )}
              </Card>
            </Grid.Col>

            {/* Top Companies Card */}
            <Grid.Col span={4}>
              <Card shadow="sm" p="md">
                <Title order={3} size="h3" mb="md">Top 5 Companies</Title>
                {isLoadingTopCompany ? (
                  <Center h={300}>
                    <Loader />
                  </Center>
                ) : topCompanyDistributionData && topCompanyDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topCompanyDistributionData} layout="vertical" style={chartConfig.style}>
                      <XAxis type="number" {...chartConfig.axis} />
                      <YAxis type="category" dataKey="name" {...chartConfig.axis} />
                      <Tooltip {...chartConfig.tooltip} />
                      <Bar dataKey="count" {...chartConfig.bar} />
                      <CartesianGrid {...chartConfig.grid} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Center h={300}>
                    <Title order={3} c="dimmed">No company data available</Title>
                  </Center>
                )}
              </Card>
            </Grid.Col>

            {/* Top Sets Card */}
            <Grid.Col span={4}>
              <Card shadow="sm" p="md">
                <Title order={3} size="h3" mb="md">Top 5 Sets</Title>
                {isLoadingTopSet ? (
                  <Center h={300}>
                    <Loader />
                  </Center>
                ) : topSetDistributionData && topSetDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topSetDistributionData} layout="vertical" style={chartConfig.style}>
                      <XAxis type="number" {...chartConfig.axis} />
                      <YAxis type="category" dataKey="name" {...chartConfig.axis} />
                      <Tooltip {...chartConfig.tooltip} />
                      <Bar dataKey="count" {...chartConfig.bar} />
                      <CartesianGrid {...chartConfig.grid} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Center h={300}>
                    <Title order={3} c="dimmed">No set data available</Title>
                  </Center>
                )}
              </Card>
            </Grid.Col>
          </Grid>
        </Grid.Col>

        {/* Tag Distribution */}
        <Grid.Col span={24}>
          <Card>
            <Title order={2} size="h3" mb="md">Tag Distribution</Title>
            <Text size="sm" c="dimmed" mb="lg">Size represents the number of unique miniatures with each tag</Text>
            <div style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem' }}>
              {isLoadingTags ? (
                <Center style={{ flexDirection: 'column', gap: '0.5rem' }}>
                  <Loader />
                  <Text size="sm" c="dimmed">Loading tag data... Please wait</Text>
                </Center>
              ) : tagDistributionData && tagDistributionData.length > 0 ? (
                <>
                  <Text size="sm" c="dimmed" mb="sm">
                    Showing {tagDistributionData.length} unique tags
                  </Text>
                  <TagCloud
                    minSize={20}
                    maxSize={60}
                    tags={tagDistributionData}
                    className="tag-cloud"
                    colorOptions={{
                      luminosity: 'light',
                      hue: 'blue'
                    }}
                    onClick={(tag: TagDistribution) => {
                      console.log(`'${tag.text}' was selected! (${tag.value} miniatures)`);
                    }}
                  />
                </>
              ) : (
                <Center>
                  <Title order={3} c="dimmed">No tag data available</Title>
                </Center>
              )}
            </div>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
} 