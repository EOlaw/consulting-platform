import * as React from 'react';
import {
  Box, Card, CardContent, CardHeader, Typography,
  useTheme, Skeleton, CircularProgress, Tooltip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface GaugeChartProps {
  title: string;
  subtitle?: string;
  value: number;
  maxValue?: number;
  minValue?: number;
  target?: number;
  previousValue?: number;
  suffix?: string;
  prefix?: string;
  description?: string;
  thresholds?: {
    warning: number;
    success: number;
  };
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  tooltipText?: string;
  height?: number | string;
}

export default function GaugeChart({
  title,
  subtitle,
  value,
  maxValue = 100,
  minValue = 0,
  target,
  previousValue,
  suffix = '%',
  prefix = '',
  description,
  thresholds = { warning: 60, success: 80 },
  loading = false,
  size = 'medium',
  showValue = true,
  valueFormatter,
  tooltipText,
  height = 'auto'
}: GaugeChartProps) {
  const theme = useTheme();

  // Calculate percentage for gauge
  const normalizedValue = Math.min(Math.max((value - minValue) / (maxValue - minValue) * 100, 0), 100);

  // Calculate size based on prop
  const getSize = () => {
    switch (size) {
      case 'small': return { width: 140, height: 140, thickness: 8, fontSize: '1.5rem' };
      case 'large': return { width: 220, height: 220, thickness: 12, fontSize: '2.5rem' };
      default: return { width: 180, height: 180, thickness: 10, fontSize: '2rem' };
    }
  };

  const { width, height: gaugeHeight, thickness, fontSize } = getSize();

  // Format display value
  const formatValue = (val: number) => {
    if (valueFormatter) {
      return valueFormatter(val);
    }

    return `${prefix}${val}${suffix}`;
  };

  // Get color based on thresholds
  const getColor = () => {
    if (normalizedValue >= thresholds.success) {
      return theme.palette.success.main;
    } else if (normalizedValue >= thresholds.warning) {
      return theme.palette.warning.main;
    }
    return theme.palette.error.main;
  };

  // Calculate percent change
  const percentChange = previousValue !== undefined
    ? ((value - previousValue) / previousValue * 100).toFixed(1)
    : undefined;

  // Loading state
  if (loading) {
    return (
      <Card sx={{ height }}>
        <CardHeader
          title={<Skeleton width="60%" height={28} />}
          subheader={subtitle && <Skeleton width="40%" height={20} />}
        />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Skeleton
            variant="circular"
            width={width}
            height={gaugeHeight}
            sx={{ my: 2 }}
          />
          <Skeleton width="50%" height={28} />
          <Skeleton width="70%" height={20} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height, display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
            {tooltipText && (
              <Tooltip title={tooltipText}>
                <HelpOutlineIcon
                  fontSize="small"
                  sx={{ ml: 1, color: 'text.secondary' }}
                />
              </Tooltip>
            )}
          </Box>
        }
        subheader={subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        sx={{ pb: 0 }}
      />
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Background circle */}
          <CircularProgress
            variant="determinate"
            value={100}
            size={width}
            thickness={thickness}
            sx={{
              color: theme.palette.mode === 'light'
                ? theme.palette.grey[200]
                : theme.palette.grey[800],
              position: 'absolute'
            }}
          />

          {/* Value circle */}
          <CircularProgress
            variant="determinate"
            value={normalizedValue}
            size={width}
            thickness={thickness}
            sx={{
              color: getColor(),
              position: 'absolute',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />

          {/* Target indicator if provided */}
          {target !== undefined && (
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  width: 2,
                  height: thickness * 1.5,
                  backgroundColor: theme.palette.info.main,
                  transform: `rotate(${((target - minValue) / (maxValue - minValue) * 100) * 3.6 - 90}deg)`,
                  transformOrigin: 'center calc(50% + ${width / 2 - thickness}px)', // position at edge of circle
                  borderRadius: 2,
                }}
              />
            </Box>
          )}

          {/* Value display in center */}
          {showValue && (
            <Box
              sx={{
                textAlign: 'center',
                zIndex: 1,
              }}
            >
              <Typography
                variant="h4"
                component="div"
                sx={{
                  fontWeight: 'bold',
                  fontSize: fontSize,
                  color: getColor()
                }}
              >
                {formatValue(value)}
              </Typography>

              {percentChange && (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 0.5,
                  color: parseFloat(percentChange) >= 0
                    ? theme.palette.success.main
                    : theme.palette.error.main
                }}>
                  {parseFloat(percentChange) >= 0 ? (
                    <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                  ) : (
                    <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                  )}
                  <Typography variant="body2">
                    {parseFloat(percentChange) >= 0 ? '+' : ''}{percentChange}%
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 2 }}
          >
            {description}
          </Typography>
        )}

        {/* Labels for min, target and max values */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: width,
          mt: 2
        }}>
          <Typography variant="caption" color="text.secondary">
            {formatValue(minValue)}
          </Typography>

          {target !== undefined && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.info.main,
                fontWeight: 'medium'
              }}
            >
              Target: {formatValue(target)}
            </Typography>
          )}

          <Typography variant="caption" color="text.secondary">
            {formatValue(maxValue)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
