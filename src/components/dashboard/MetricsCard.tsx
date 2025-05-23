import * as React from 'react';
import {
  Box, Card, CardContent, CardHeader, Grid,
  Typography, Divider, Skeleton, useTheme,
  LinearProgress, SvgIconProps, Tooltip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export interface MetricItem {
  title: string;
  value: number | string;
  previousValue?: number;
  percentChange?: number;
  icon?: React.ReactElement<SvgIconProps>;
  color?: string;
  formatter?: (value: number) => string;
  info?: string;
  status?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  target?: number;
  progress?: number;
  showTrend?: boolean;
}

interface MetricsCardProps {
  title: string;
  subtitle?: string;
  metrics: MetricItem[];
  loading?: boolean;
  columns?: 1 | 2 | 3 | 4;
  height?: string | number;
  variant?: 'standard' | 'compact' | 'detailed';
  elevation?: number;
}

export default function MetricsCard({
  title,
  subtitle,
  metrics,
  loading = false,
  columns = 2,
  height = 'auto',
  variant = 'standard',
  elevation = 0
}: MetricsCardProps) {
  const theme = useTheme();

  // Determine the grid size based on the number of columns
  const getGridSize = () => {
    switch (columns) {
      case 1: return 12;
      case 2: return 6;
      case 3: return 4;
      case 4: return 3;
      default: return 6;
    }
  };

  // Format metrics based on formatter or default
  const formatValue = (metric: MetricItem) => {
    const { value, formatter } = metric;

    if (typeof value === 'string') {
      return value;
    }

    if (formatter) {
      return formatter(value);
    }

    // Default formatters based on value magnitude
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }

    return value.toString();
  };

  // Render loading skeleton
  if (loading) {
    return (
      <Card elevation={elevation} sx={{ height }}>
        <CardHeader
          title={<Skeleton width="60%" height={28} />}
          subheader={subtitle && <Skeleton width="40%" height={20} />}
        />
        <CardContent>
          <Grid container spacing={3}>
            {Array.from(new Array(metrics.length || 4)).map((_, index) => (
              <Grid item xs={12} sm={getGridSize()} key={index}>
                <Skeleton variant="rectangular" height={variant === 'compact' ? 60 : 80} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  // Get appropriate color for trend indicator
  const getTrendColor = (percentChange?: number, status?: string) => {
    if (status) {
      switch (status) {
        case 'success': return theme.palette.success.main;
        case 'warning': return theme.palette.warning.main;
        case 'error': return theme.palette.error.main;
        case 'info': return theme.palette.info.main;
        default: return theme.palette.text.secondary;
      }
    }

    if (percentChange === undefined) return theme.palette.text.secondary;
    return percentChange >= 0 ? theme.palette.success.main : theme.palette.error.main;
  };

  // Progress bar component for metrics with targets
  const ProgressIndicator = ({ metric }: { metric: MetricItem }) => {
    if (!metric.progress && metric.progress !== 0) return null;

    const progress = Math.min(Math.max(metric.progress, 0), 100);

    let color = 'primary';
    if (metric.status === 'success') color = 'success';
    if (metric.status === 'warning') color = 'warning';
    if (metric.status === 'error') color = 'error';

    return (
      <Box sx={{ mt: 1, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Progress
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {progress}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={color as any}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>
    );
  };

  // Render the card with metrics
  return (
    <Card elevation={elevation} sx={{ height, display: 'flex', flexDirection: 'column' }}>
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
        sx={{ pb: variant === 'compact' ? 1 : 2 }}
      />
      <CardContent sx={{ flex: 1, pt: 0 }}>
        <Grid container spacing={variant === 'compact' ? 2 : 3}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={getGridSize()} key={index}>
              <Box
                sx={{
                  p: variant === 'compact' ? 1 : 2,
                  borderRadius: 1,
                  height: '100%',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: variant === 'standard' ? 1 : 0,
                  '&:hover': {
                    boxShadow: variant !== 'compact' ? 2 : 0,
                  },
                  transition: 'box-shadow 0.3s ease-in-out',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{
                          mb: variant === 'compact' ? 0.5 : 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {metric.title}
                        {metric.info && (
                          <Tooltip title={metric.info} arrow>
                            <InfoOutlinedIcon
                              fontSize="small"
                              sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.9rem' }}
                            />
                          </Tooltip>
                        )}
                      </Typography>
                    </Box>
                    <Typography
                      variant={variant === 'compact' ? 'h6' : 'h5'}
                      component="div"
                      sx={{
                        fontWeight: 'medium',
                        color: metric.color || 'text.primary',
                        mb: metric.percentChange !== undefined ? 0.5 : 0
                      }}
                    >
                      {formatValue(metric)}
                    </Typography>

                    {metric.percentChange !== undefined && metric.showTrend !== false && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        {metric.percentChange >= 0 ? (
                          <TrendingUpIcon
                            fontSize="small"
                            sx={{ color: getTrendColor(metric.percentChange, metric.status), mr: 0.5 }}
                          />
                        ) : (
                          <TrendingDownIcon
                            fontSize="small"
                            sx={{ color: getTrendColor(metric.percentChange, metric.status), mr: 0.5 }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          sx={{ color: getTrendColor(metric.percentChange, metric.status) }}
                        >
                          {metric.percentChange >= 0 ? '+' : ''}{metric.percentChange}%
                        </Typography>
                        {metric.previousValue !== undefined && variant === 'detailed' && (
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            vs {typeof metric.previousValue === 'number' && metric.formatter
                              ? metric.formatter(metric.previousValue)
                              : metric.previousValue}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                  {metric.icon && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: `${metric.color || theme.palette.primary.main}15`,
                        borderRadius: '50%',
                        p: 1.2,
                        ml: 1
                      }}
                    >
                      {React.cloneElement(metric.icon, {
                        sx: {
                          fontSize: variant === 'compact' ? 20 : 24,
                          color: metric.color || theme.palette.primary.main
                        }
                      })}
                    </Box>
                  )}
                </Box>

                {variant === 'detailed' && metric.progress !== undefined && (
                  <ProgressIndicator metric={metric} />
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
