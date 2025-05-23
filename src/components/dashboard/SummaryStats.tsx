import * as React from 'react';
import {
  Box, Card, CardContent, CardHeader, Grid, Typography,
  Divider, Skeleton, useTheme, SvgIconProps, useMediaQuery
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

export interface SummaryStatItem {
  title: string;
  value: string | number;
  previousValue?: number;
  percentChange?: number;
  icon?: React.ReactElement<SvgIconProps>;
  color?: string;
  status?: 'positive' | 'negative' | 'neutral' | 'warning';
  footer?: string;
  tooltip?: string;
  formatter?: (value: number) => string;
}

interface SummaryStatsProps {
  stats: SummaryStatItem[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
  columns?: 1 | 2 | 3 | 4 | 6;
  variant?: 'outlined' | 'elevation';
  spacing?: number;
  showHeader?: boolean;
  elevation?: number;
  cardRadius?: number;
  height?: string | number;
}

export default function SummaryStats({
  stats,
  loading = false,
  title,
  subtitle,
  columns = 4,
  variant = 'outlined',
  spacing = 3,
  showHeader = false,
  elevation = 0,
  cardRadius = 1,
  height = 'auto'
}: SummaryStatsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Adjust columns for different screen sizes
  const getColumnCount = () => {
    if (isMobile) return 12;
    if (isTablet) return columns <= 3 ? 12 / columns : 6;
    return 12 / columns;
  };

  const columnSize = getColumnCount();

  // Format values as needed
  const formatValue = (stat: SummaryStatItem) => {
    const { value, formatter } = stat;

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

  // Get status color
  const getStatusColor = (stat: SummaryStatItem) => {
    // If status is explicitly provided
    if (stat.status) {
      switch (stat.status) {
        case 'positive':
          return theme.palette.success.main;
        case 'negative':
          return theme.palette.error.main;
        case 'warning':
          return theme.palette.warning.main;
        case 'neutral':
        default:
          return theme.palette.text.secondary;
      }
    }

    // Default using percentChange
    if (stat.percentChange === undefined) return theme.palette.text.secondary;
    return stat.percentChange > 0
      ? theme.palette.success.main
      : stat.percentChange < 0
        ? theme.palette.error.main
        : theme.palette.text.secondary;
  };

  // Get trend icon
  const getTrendIcon = (stat: SummaryStatItem) => {
    if (stat.percentChange === undefined) return null;

    if (stat.percentChange > 0) {
      return <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />;
    } else if (stat.percentChange < 0) {
      return <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />;
    } else {
      return <TrendingFlatIcon fontSize="small" sx={{ mr: 0.5 }} />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card elevation={variant === 'elevation' ? elevation : 0} variant={variant === 'outlined' ? 'outlined' : undefined} sx={{ height }}>
        {showHeader && (
          <>
            <CardHeader
              title={<Skeleton width={150} height={28} />}
              subheader={subtitle && <Skeleton width={250} height={20} />}
            />
            <Divider />
          </>
        )}
        <CardContent>
          <Grid container spacing={spacing}>
            {Array.from(new Array(stats.length || 4)).map((_, index) => (
              <Grid item xs={12} sm={6} md={columnSize} key={index}>
                <Box sx={{ height: '100%' }}>
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={variant === 'elevation' ? elevation : 0}
      variant={variant === 'outlined' ? 'outlined' : undefined}
      sx={{ height }}
    >
      {showHeader && title && (
        <>
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
        </>
      )}
      <CardContent>
        <Grid container spacing={spacing}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={columnSize} key={index}>
              <Box
                sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: cardRadius,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: variant === 'elevation' ? 1 : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  '&:hover': {
                    boxShadow: variant === 'elevation' ? 2 : 1,
                  },
                  transition: 'box-shadow 0.3s ease-in-out',
                }}
              >
                {/* Icon (displayed in the top-right corner) */}
                {stat.icon && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: stat.color
                        ? `${stat.color}15`
                        : `${theme.palette.primary.main}15`,
                    }}
                  >
                    {React.cloneElement(stat.icon, {
                      sx: {
                        color: stat.color || theme.palette.primary.main,
                        fontSize: '1.5rem',
                      },
                    })}
                  </Box>
                )}

                {/* Stat Title */}
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                  sx={{
                    display: 'block',
                    pr: stat.icon ? 5 : 0,
                  }}
                >
                  {stat.title}
                </Typography>

                {/* Stat Value */}
                <Typography
                  variant="h4"
                  component="div"
                  sx={{
                    fontWeight: 'bold',
                    color: stat.color || 'text.primary',
                    mb: 1,
                  }}
                >
                  {formatValue(stat)}
                </Typography>

                {/* Percent Change (if provided) */}
                {stat.percentChange !== undefined && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: getStatusColor(stat),
                      mb: 1,
                    }}
                  >
                    {getTrendIcon(stat)}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'medium',
                      }}
                    >
                      {stat.percentChange > 0 ? '+' : ''}
                      {stat.percentChange}%
                    </Typography>
                    {stat.previousValue !== undefined && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        vs. previous
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Footer (if provided) */}
                {stat.footer && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 'auto', display: 'block' }}
                  >
                    {stat.footer}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
