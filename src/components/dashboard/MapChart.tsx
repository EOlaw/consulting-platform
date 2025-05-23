import * as React from 'react';
import {
  Box, Card, CardContent, CardHeader, Typography,
  useTheme, Skeleton, Tooltip, Divider
} from '@mui/material';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Bar, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

// Note: We're using a simplified map approach with a chart due to the complexity
// of integrating a full interactive map. For a production app, you might want to use
// a dedicated mapping library like react-simple-maps or @nivo/geo.

export interface RegionData {
  id: string;
  name: string;
  value: number;
  secondaryValue?: number;
  color?: string;
  label?: string;
}

interface RegionGroupData {
  region: string;
  countries?: RegionData[];
  value: number;
  secondaryValue?: number;
  color?: string;
}

interface MapChartProps {
  title?: string;
  subtitle?: string;
  data: RegionGroupData[];
  loading?: boolean;
  height?: number | string;
  valueLabel?: string;
  secondaryValueLabel?: string;
  valueSuffix?: string;
  secondaryValueSuffix?: string;
}

// Default colors for regions
const defaultRegionColors = {
  'North America': '#3f51b5',
  'Europe': '#f50057',
  'Asia Pacific': '#00bcd4',
  'Latin America': '#4caf50',
  'Middle East': '#ff9800',
  'Africa': '#9c27b0'
};

export default function MapChart({
  title = 'Regional Performance',
  subtitle,
  data = [],
  loading = false,
  height = 350,
  valueLabel = 'Revenue',
  secondaryValueLabel = 'Clients',
  valueSuffix = '$',
  secondaryValueSuffix = ''
}: MapChartProps) {
  const theme = useTheme();

  // Format values for display
  const formatValue = (value: number, isSecondary: boolean = false) => {
    const suffix = isSecondary ? secondaryValueSuffix : valueSuffix;

    if (value >= 1000000) {
      return `${suffix}${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${suffix}${(value / 1000).toFixed(1)}K`;
    }

    return `${suffix}${value}`;
  };

  // Sort data for better visualization
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => b.value - a.value);
  }, [data]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            p: 1.5,
            borderRadius: 1,
            boxShadow: theme.shadows[2],
            minWidth: 180
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            {payload[0].payload.region}
          </Typography>
          <Typography variant="body2" sx={{ color: payload[0].color || theme.palette.primary.main }}>
            {`${valueLabel}: ${formatValue(payload[0].value)}`}
          </Typography>
          {payload[1] && (
            <Typography variant="body2" sx={{ color: payload[1].color || theme.palette.secondary.main }}>
              {`${secondaryValueLabel}: ${formatValue(payload[1].value, true)}`}
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader
          title={<Skeleton width="60%" height={28} />}
          subheader={subtitle && <Skeleton width="40%" height={20} />}
        />
        <CardContent>
          <Skeleton variant="rectangular" height={height} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
        }
        subheader={subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      />
      <Divider />
      <CardContent sx={{ flex: 1, p: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Map visualization - Simplified as a horizontal bar chart */}
        <Box sx={{ flex: 2, pt: 2 }}>
          <ResponsiveContainer width="100%" height={Number(height) * 0.6}>
            <ComposedChart
              layout="vertical"
              data={sortedData}
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                tickLine={{ stroke: theme.palette.divider }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <YAxis
                dataKey="region"
                type="category"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                tickLine={{ stroke: theme.palette.divider }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                fill={theme.palette.primary.main}
                name={valueLabel}
                barSize={20}
                radius={[0, 4, 4, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>

        {/* Legend and detailed breakdown */}
        <Box sx={{ flex: 1, p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" gutterBottom>
            Regional Breakdown
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
              gap: 2,
              mt: 1
            }}
          >
            {sortedData.map((region) => (
              <Box key={region.region} sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: region.color || defaultRegionColors[region.region as keyof typeof defaultRegionColors] || theme.palette.primary.main,
                    borderRadius: '50%',
                    mr: 1,
                  }}
                />
                <Box>
                  <Typography variant="body2" component="div" noWrap>
                    {region.region}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatValue(region.value)}
                    {region.secondaryValue !== undefined && ` • ${formatValue(region.secondaryValue, true)}`}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
