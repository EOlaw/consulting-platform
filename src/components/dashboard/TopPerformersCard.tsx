import * as React from 'react';
import {
  Box, Card, CardContent, CardHeader, Typography,
  List, ListItem, ListItemText, ListItemAvatar,
  Avatar, Divider, LinearProgress, Skeleton,
  IconButton, Tooltip, Chip, Button, useTheme
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import Link from 'next/link';

export interface TopPerformerItem {
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  iconColor?: string;
  value: number;
  percentage?: number;
  change?: number;
  secondaryValue?: string | number;
  status?: 'positive' | 'negative' | 'neutral';
  trend?: 'up' | 'down' | 'stable';
  link?: string;
  verified?: boolean;
  rating?: number;
  badge?: string;
  chipColor?: string;
}

interface TopPerformersCardProps {
  title: string;
  subtitle?: string;
  items: TopPerformerItem[];
  loading?: boolean;
  valueLabel?: string;
  maxItems?: number;
  variant?: 'standard' | 'compact' | 'detailed';
  showAvatar?: boolean;
  orderByLabel?: string;
  orderBy?: 'asc' | 'desc';
  onOrderByChange?: (orderBy: 'asc' | 'desc') => void;
  onViewAll?: () => void;
  viewAllHref?: string;
  height?: number | string;
}

export default function TopPerformersCard({
  title,
  subtitle,
  items = [],
  loading = false,
  valueLabel = 'Value',
  maxItems = 5,
  variant = 'standard',
  showAvatar = true,
  orderByLabel = 'Sort by',
  orderBy = 'desc',
  onOrderByChange,
  onViewAll,
  viewAllHref,
  height = 'auto'
}: TopPerformersCardProps) {
  const theme = useTheme();
  const [displayedItems, setDisplayedItems] = React.useState<TopPerformerItem[]>([]);

  React.useEffect(() => {
    // Set initial items limited by maxItems
    setDisplayedItems(items.slice(0, maxItems));
  }, [items, maxItems]);

  const toggleSortOrder = () => {
    if (onOrderByChange) {
      onOrderByChange(orderBy === 'asc' ? 'desc' : 'asc');
    }
  };

  // Format value based on magnitude
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }

    return value.toString();
  };

  if (loading) {
    return (
      <Card sx={{ height }}>
        <CardHeader
          title={<Skeleton width="60%" height={28} />}
          subheader={subtitle && <Skeleton width="40%" height={20} />}
          action={
            <Skeleton variant="circular" width={32} height={32} />
          }
        />
        <Divider />
        <CardContent>
          <List disablePadding>
            {Array.from(new Array(maxItems)).map((_, index) => (
              <ListItem key={index} disablePadding sx={{ py: 1.5 }}>
                {showAvatar && (
                  <ListItemAvatar>
                    <Skeleton variant="circular" width={40} height={40} />
                  </ListItemAvatar>
                )}
                <ListItemText
                  primary={<Skeleton width="70%" height={24} />}
                  secondary={variant !== 'compact' && <Skeleton width="40%" height={20} />}
                />
                <Box sx={{ textAlign: 'right', minWidth: 80 }}>
                  <Skeleton width={60} height={24} />
                  {variant === 'detailed' && <Skeleton width={40} height={20} />}
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height, display: 'flex', flexDirection: 'column' }}>
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
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {onOrderByChange && (
              <Tooltip
                title={`${orderByLabel}: ${orderBy === 'desc' ? 'Highest to lowest' : 'Lowest to highest'}`}
              >
                <IconButton size="small" onClick={toggleSortOrder}>
                  {orderBy === 'desc' ? (
                    <ArrowDownwardIcon fontSize="small" />
                  ) : (
                    <ArrowUpwardIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
      />
      <Divider />
      <CardContent sx={{ flex: 1, p: 0, overflow: 'auto' }}>
        {displayedItems.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No data available</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {displayedItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem
                  component={item.link ? Link : 'li'}
                  href={item.link || ''}
                  sx={{
                    px: 2,
                    py: variant === 'compact' ? 1 : 1.5,
                    transition: 'background-color 0.2s',
                    cursor: item.link ? 'pointer' : 'default',
                    '&:hover': {
                      backgroundColor: item.link ? theme.palette.action.hover : undefined,
                    },
                  }}
                >
                  {showAvatar && (
                    <ListItemAvatar>
                      {item.avatar ? (
                        <Avatar
                          src={item.avatar}
                          alt={item.title}
                          variant="rounded"
                          sx={{
                            width: variant === 'compact' ? 32 : 40,
                            height: variant === 'compact' ? 32 : 40
                          }}
                        />
                      ) : (
                        <Avatar
                          variant="rounded"
                          sx={{
                            bgcolor: item.iconColor ? `${item.iconColor}20` : theme.palette.primary.main + '20',
                            color: item.iconColor || theme.palette.primary.main,
                            width: variant === 'compact' ? 32 : 40,
                            height: variant === 'compact' ? 32 : 40
                          }}
                        >
                          {item.title.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                    </ListItemAvatar>
                  )}
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                          variant={variant === 'compact' ? 'body2' : 'body1'}
                          component="span"
                          sx={{ fontWeight: 'medium' }}
                          noWrap
                        >
                          {item.title}
                        </Typography>
                        {item.verified && (
                          <VerifiedIcon
                            sx={{
                              ml: 0.5,
                              color: theme.palette.primary.main,
                              fontSize: variant === 'compact' ? '0.9rem' : '1rem'
                            }}
                          />
                        )}
                        {item.badge && (
                          <Chip
                            label={item.badge}
                            size="small"
                            sx={{
                              ml: 1,
                              height: 18,
                              fontSize: '0.6rem',
                              bgcolor: item.chipColor || theme.palette.primary.main,
                              color: '#fff'
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      variant !== 'compact' && item.subtitle && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {item.subtitle}
                        </Typography>
                      )
                    }
                    primaryTypographyProps={{
                      noWrap: true,
                      style: { maxWidth: 'calc(100% - 80px)' }
                    }}
                    secondaryTypographyProps={{
                      noWrap: true,
                      style: { maxWidth: 'calc(100% - 80px)' }
                    }}
                  />
                  <Box sx={{ textAlign: 'right', minWidth: 80 }}>
                    <Typography variant={variant === 'compact' ? 'body2' : 'body1'} fontWeight="medium">
                      {typeof item.value === 'number' ? formatValue(item.value) : item.value}
                    </Typography>

                    {item.change !== undefined && (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {item.trend === 'up' ? (
                          <ArrowUpwardIcon
                            sx={{ color: theme.palette.success.main, fontSize: '0.8rem' }}
                          />
                        ) : item.trend === 'down' ? (
                          <ArrowDownwardIcon
                            sx={{ color: theme.palette.error.main, fontSize: '0.8rem' }}
                          />
                        ) : null}
                        <Typography
                          variant="caption"
                          sx={{
                            color: item.trend === 'up'
                              ? theme.palette.success.main
                              : item.trend === 'down'
                                ? theme.palette.error.main
                                : theme.palette.text.secondary
                          }}
                        >
                          {item.change > 0 ? '+' : ''}{item.change}%
                        </Typography>
                      </Box>
                    )}

                    {item.secondaryValue !== undefined && !item.change && variant === 'detailed' && (
                      <Typography variant="caption" color="text.secondary">
                        {item.secondaryValue}
                      </Typography>
                    )}

                    {item.rating !== undefined && variant === 'detailed' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <StarIcon
                          sx={{ color: theme.palette.warning.main, fontSize: '0.8rem', mr: 0.5 }}
                        />
                        <Typography variant="caption">
                          {item.rating.toFixed(1)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </ListItem>

                {variant === 'detailed' && item.percentage !== undefined && (
                  <Box sx={{ px: 2, pb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(Math.max(item.percentage, 0), 100)}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: theme.palette.divider,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: item.iconColor || theme.palette.primary.main
                        }
                      }}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 0.5
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        0%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        100%
                      </Typography>
                    </Box>
                  </Box>
                )}

                {index < displayedItems.length - 1 && (
                  <Divider component="li" variant="inset" sx={{ ml: showAvatar ? undefined : 0 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>

      {(onViewAll || viewAllHref) && (
        <>
          <Divider />
          <Box sx={{ p: 1.5, textAlign: 'center' }}>
            {viewAllHref ? (
              <Link href={viewAllHref} passHref>
                <Button component="a" size="small">
                  View All
                </Button>
              </Link>
            ) : (
              <Button size="small" onClick={onViewAll}>
                View All
              </Button>
            )}
          </Box>
        </>
      )}
    </Card>
  );
}
