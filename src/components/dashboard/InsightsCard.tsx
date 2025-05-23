import * as React from 'react';
import {
  Box, Card, CardContent, CardHeader,
  Typography, Divider, Chip, Avatar,
  List, ListItem, ListItemText, ListItemIcon,
  Button, IconButton, Tooltip, Skeleton, useTheme
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import InfoIcon from '@mui/icons-material/Info';
import BarChartIcon from '@mui/icons-material/BarChart';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import Link from 'next/link';

export interface Insight {
  id: string;
  title: string;
  description?: string;
  type: 'observation' | 'trend' | 'warning' | 'opportunity' | 'achievement';
  icon?: React.ReactNode;
  metric?: {
    name: string;
    value: string | number;
    change?: number;
  };
  recommendation?: string;
  severity?: 'low' | 'medium' | 'high';
  timestamp?: string;
  category?: string;
  saved?: boolean;
  link?: {
    text: string;
    url: string;
  };
}

interface InsightsCardProps {
  title?: string;
  insights: Insight[];
  loading?: boolean;
  onSaveInsight?: (insightId: string, saved: boolean) => void;
  maxItems?: number;
  showControls?: boolean;
  height?: string | number;
}

export default function InsightsCard({
  title = "Business Insights",
  insights,
  loading = false,
  onSaveInsight,
  maxItems = 5,
  showControls = true,
  height = 'auto'
}: InsightsCardProps) {
  const theme = useTheme();
  const [displayedInsights, setDisplayedInsights] = React.useState<Insight[]>([]);

  React.useEffect(() => {
    setDisplayedInsights(insights.slice(0, maxItems));
  }, [insights, maxItems]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'observation':
        return <AnalyticsIcon />;
      case 'trend':
        return <TrendingUpIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'opportunity':
        return <LightbulbIcon />;
      case 'achievement':
        return <CheckCircleIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'observation':
        return theme.palette.info.main;
      case 'trend':
        return theme.palette.primary.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'opportunity':
        return theme.palette.success.main;
      case 'achievement':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const getInsightSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      default:
        return undefined;
    }
  };

  const handleSaveInsight = (insightId: string, saved: boolean) => {
    if (onSaveInsight) {
      onSaveInsight(insightId, saved);

      // Update local state for immediate UI feedback
      setDisplayedInsights(prevInsights =>
        prevInsights.map(insight =>
          insight.id === insightId ? { ...insight, saved } : insight
        )
      );
    }
  };

  if (loading) {
    return (
      <Card sx={{ height }}>
        <CardHeader
          title={<Skeleton width="60%" height={28} />}
          action={showControls && <Skeleton width={80} height={36} />}
        />
        <CardContent>
          <List sx={{ p: 0 }}>
            {Array.from(new Array(maxItems)).map((_, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 42 }}>
                    <Skeleton variant="circular" width={32} height={32} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Skeleton width="80%" height={24} />}
                    secondary={
                      <>
                        <Skeleton width="100%" height={16} />
                        <Skeleton width="60%" height={16} />
                      </>
                    }
                  />
                </ListItem>
                {index < maxItems - 1 && <Divider component="li" />}
              </React.Fragment>
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LightbulbIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
          </Box>
        }
        action={
          showControls && (
            <Link href="/dashboard/insights" passHref>
              <Button component="a" size="small">
                View All
              </Button>
            </Link>
          )
        }
      />
      <CardContent sx={{ flex: 1, pt: 0 }}>
        {displayedInsights.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <BarChartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              No insights available at the moment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back later for new analytics insights
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {displayedInsights.map((insight, index) => (
              <React.Fragment key={insight.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    px: 0,
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                  secondaryAction={
                    onSaveInsight && (
                      <Tooltip title={insight.saved ? "Remove bookmark" : "Bookmark this insight"}>
                        <IconButton
                          edge="end"
                          aria-label="bookmark"
                          onClick={() => handleSaveInsight(insight.id, !insight.saved)}
                          size="small"
                        >
                          {insight.saved ? (
                            <BookmarkIcon fontSize="small" color="primary" />
                          ) : (
                            <BookmarkBorderIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    )
                  }
                >
                  <ListItemIcon sx={{ minWidth: 42 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: `${getInsightColor(insight.type)}15`,
                        color: getInsightColor(insight.type),
                      }}
                    >
                      {insight.icon || getInsightIcon(insight.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', pr: onSaveInsight ? 4 : 0 }}>
                        <Typography variant="subtitle1" component="span">
                          {insight.title}
                        </Typography>
                        {insight.severity && (
                          <Chip
                            label={insight.severity}
                            size="small"
                            sx={{
                              ml: 1,
                              height: 20,
                              fontSize: '0.7rem',
                              color: getInsightSeverityColor(insight.severity),
                              borderColor: getInsightSeverityColor(insight.severity),
                              backgroundColor: `${getInsightSeverityColor(insight.severity)}10`,
                            }}
                            variant="outlined"
                          />
                        )}
                        {insight.category && (
                          <Chip
                            label={insight.category}
                            size="small"
                            sx={{
                              ml: 1,
                              height: 20,
                              fontSize: '0.7rem',
                            }}
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          component="span"
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          {insight.description}
                        </Typography>

                        {insight.metric && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                              {insight.metric.name}:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {insight.metric.value}
                            </Typography>
                            {insight.metric.change !== undefined && (
                              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                                {insight.metric.change >= 0 ? (
                                  <TrendingUpIcon
                                    fontSize="small"
                                    sx={{ color: theme.palette.success.main, fontSize: '1rem' }}
                                  />
                                ) : (
                                  <TrendingDownIcon
                                    fontSize="small"
                                    sx={{ color: theme.palette.error.main, fontSize: '1rem' }}
                                  />
                                )}
                                <Typography
                                  variant="body2"
                                  sx={{
                                    ml: 0.5,
                                    color: insight.metric.change >= 0
                                      ? theme.palette.success.main
                                      : theme.palette.error.main,
                                  }}
                                >
                                  {insight.metric.change >= 0 ? '+' : ''}{insight.metric.change}%
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}

                        {insight.recommendation && (
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.5,
                              fontStyle: 'italic',
                              color: theme.palette.text.secondary,
                            }}
                          >
                            Recommendation: {insight.recommendation}
                          </Typography>
                        )}

                        {insight.link && (
                          <Link href={insight.link.url} passHref>
                            <Button
                              component="a"
                              size="small"
                              sx={{ mt: 1, px: 0 }}
                              variant="text"
                            >
                              {insight.link.text}
                            </Button>
                          </Link>
                        )}

                        {insight.timestamp && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {insight.timestamp}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < displayedInsights.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
