import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  LineChart, Line,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  Label
} from 'recharts';
import {
  Paper, Typography, Box,
  Card, CardContent, CardHeader,
  Skeleton, useMediaQuery
} from '@mui/material';

// Chart type definitions
export type ChartType = 'line' | 'area' | 'bar' | 'pie' | 'donut';

interface PerformanceChartProps {
  title: string;
  subtitle?: string;
  data: any[];
  type: ChartType;
  height?: number;
  xAxisKey?: string;
  yAxisLabel?: string;
  series: {
    name: string;
    dataKey: string;
    color?: string;
    stackId?: string;
    fill?: string;
    stroke?: string;
  }[];
  loading?: boolean;
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  roundedCorners?: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
}

// Color palette
const defaultColors = [
  '#3f51b5', '#f50057', '#00bcd4', '#4caf50', '#ff9800',
  '#9c27b0', '#e91e63', '#2196f3', '#8bc34a', '#ff5722'
];

// Default chart settings
const defaultMargin = { top: 20, right: 20, bottom: 30, left: 20 };

export default function PerformanceChart({
  title,
  subtitle,
  data,
  type = 'line',
  height = 350,
  xAxisKey = 'name',
  yAxisLabel,
  series,
  loading = false,
  valueFormatter = (value) => `${value}`,
  showLegend = true,
  roundedCorners = false,
  margin = defaultMargin
}: PerformanceChartProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Calculate chart dimensions
  const adjustedMargin = {
    ...defaultMargin,
    ...margin,
    ...(isMobile ? {
      left: Math.max(margin.left - 10, 5),
      right: Math.max(margin.right - 10, 5)
    } : {})
  };

  // Assign colors to series if not provided
  const seriesWithColors = series.map((item, index) => ({
    ...item,
    color: item.color || defaultColors[index % defaultColors.length],
    fill: item.fill || item.color || defaultColors[index % defaultColors.length],
    stroke: item.stroke || item.color || defaultColors[index % defaultColors.length]
  }));

  // Render appropriate chart based on type
  const renderChart = () => {
    if (loading) {
      return (
        <Box sx={{ pt: 0, height }}>
          <Skeleton variant="rectangular" height={height} />
        </Box>
      );
    }

    if (!data || data.length === 0) {
      return (
        <Box
          sx={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            flexDirection: 'column',
            p: 2
          }}
        >
          <Typography variant="body1" align="center">
            No data available
          </Typography>
        </Box>
      );
    }

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={data}
              margin={adjustedMargin}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey={xAxisKey}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                tickLine={{ stroke: theme.palette.divider }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <YAxis
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                tickLine={{ stroke: theme.palette.divider }}
                axisLine={{ stroke: theme.palette.divider }}
                tickFormatter={valueFormatter}
              >
                {yAxisLabel && (
                  <Label
                    value={yAxisLabel}
                    angle={-90}
                    position="insideLeft"
                    style={{
                      textAnchor: 'middle',
                      fill: theme.palette.text.primary,
                      fontSize: 12
                    }}
                  />
                )}
              </YAxis>
              <Tooltip
                formatter={valueFormatter}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 4,
                  boxShadow: theme.shadows[3]
                }}
              />
              {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}

              {seriesWithColors.map((s, index) => (
                <Line
                  key={`line-${index}`}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name}
                  stroke={s.stroke}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                  dot={{ stroke: s.stroke, strokeWidth: 2, r: 4, fill: theme.palette.background.paper }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart
              data={data}
              margin={adjustedMargin}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey={xAxisKey}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                tickLine={{ stroke: theme.palette.divider }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <YAxis
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                tickLine={{ stroke: theme.palette.divider }}
                axisLine={{ stroke: theme.palette.divider }}
                tickFormatter={valueFormatter}
              >
                {yAxisLabel && (
                  <Label
                    value={yAxisLabel}
                    angle={-90}
                    position="insideLeft"
                    style={{
                      textAnchor: 'middle',
                      fill: theme.palette.text.primary,
                      fontSize: 12
                    }}
                  />
                )}
              </YAxis>
              <Tooltip
                formatter={valueFormatter}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 4,
                  boxShadow: theme.shadows[3]
                }}
              />
              {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}

              {seriesWithColors.map((s, index) => (
                <Area
                  key={`area-${index}`}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name}
                  stroke={s.stroke}
                  fill={s.fill}
                  fillOpacity={0.3}
                  stackId={s.stackId}
                  activeDot={{ r: 6 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              margin={adjustedMargin}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey={xAxisKey}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                tickLine={{ stroke: theme.palette.divider }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <YAxis
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                tickLine={{ stroke: theme.palette.divider }}
                axisLine={{ stroke: theme.palette.divider }}
                tickFormatter={valueFormatter}
              >
                {yAxisLabel && (
                  <Label
                    value={yAxisLabel}
                    angle={-90}
                    position="insideLeft"
                    style={{
                      textAnchor: 'middle',
                      fill: theme.palette.text.primary,
                      fontSize: 12
                    }}
                  />
                )}
              </YAxis>
              <Tooltip
                formatter={valueFormatter}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 4,
                  boxShadow: theme.shadows[3]
                }}
              />
              {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}

              {seriesWithColors.map((s, index) => (
                <Bar
                  key={`bar-${index}`}
                  dataKey={s.dataKey}
                  name={s.name}
                  fill={s.fill}
                  stackId={s.stackId}
                  radius={roundedCorners ? [4, 4, 0, 0] : undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
        const innerRadius = type === 'donut' ? '60%' : 0;
        // For pie charts, we need to format the data differently
        // We'll use the first series to determine the data
        const pieDataKey = series[0]?.dataKey || 'value';
        const nameKey = xAxisKey || 'name';

        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart margin={adjustedMargin}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius="80%"
                dataKey={pieDataKey}
                nameKey={nameKey}
                label={!isMobile}
                labelLine={!isMobile}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={seriesWithColors[index % seriesWithColors.length].fill}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={valueFormatter}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 4,
                  boxShadow: theme.shadows[3]
                }}
              />
              {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      elevation={0}
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
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
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ flex: 1, pt: 1 }}>
        {renderChart()}
      </CardContent>
    </Card>
  );
}
