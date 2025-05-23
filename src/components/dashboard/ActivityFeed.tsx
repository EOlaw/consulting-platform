import * as React from 'react';
import {
  Box, Card, CardContent, CardHeader, Typography,
  List, ListItem, ListItemAvatar, ListItemText,
  Avatar, Divider, Button, Chip, IconButton,
  Tooltip, Badge, Skeleton, useTheme
} from '@mui/material';
import {
  NotificationsOutlined as NotificationsIcon,
  Check as CheckIcon,
  ClearAll as ClearAllIcon,
  MoreHoriz as MoreHorizIcon,
  Person as PersonIcon,
  BusinessCenter as BusinessIcon,
  Assignment as AssignmentIcon,
  MailOutline as MailIcon,
  Comment as CommentIcon,
  StarOutline as StarIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Description as DocumentIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  AddCircleOutline as AddIcon,
  WarningAmber as WarningIcon,
  CalendarToday as CalendarIcon,
  NotificationsActive as AlertIcon
} from '@mui/icons-material';
import Link from 'next/link';

export type ActivityType =
  | 'message'
  | 'notification'
  | 'project'
  | 'client'
  | 'task'
  | 'document'
  | 'invoice'
  | 'system'
  | 'user'
  | 'comment'
  | 'meeting';

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  type: ActivityType;
  timestamp: string;
  read?: boolean;
  avatarUrl?: string;
  icon?: React.ReactNode;
  color?: string;
  link?: string;
  actions?: Array<{
    label: string;
    onClick?: () => void;
    href?: string;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    variant?: 'text' | 'outlined' | 'contained';
  }>;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
}

interface ActivityFeedProps {
  title?: string;
  activities: ActivityItem[];
  loading?: boolean;
  maxItems?: number;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
  onItemRead?: (id: string) => void;
  showAvatar?: boolean;
  showHeader?: boolean;
  variant?: 'standard' | 'compact';
  height?: number | string;
  emptyMessage?: string;
}

export default function ActivityFeed({
  title = "Recent Activity",
  activities = [],
  loading = false,
  maxItems = 5,
  onMarkAllAsRead,
  onClearAll,
  onItemRead,
  showAvatar = true,
  showHeader = true,
  variant = 'standard',
  height = 'auto',
  emptyMessage = "No recent activity"
}: ActivityFeedProps) {
  const theme = useTheme();
  const [displayedActivities, setDisplayedActivities] = React.useState<ActivityItem[]>([]);

  React.useEffect(() => {
    // Set initial activities limited by maxItems
    setDisplayedActivities(activities.slice(0, maxItems));
  }, [activities, maxItems]);

  // Get the appropriate icon for the activity type
  const getActivityIcon = (type: ActivityType, customIcon?: React.ReactNode) => {
    if (customIcon) return customIcon;

    switch (type) {
      case 'message':
        return <MailIcon />;
      case 'notification':
        return <NotificationsIcon />;
      case 'project':
        return <AssignmentIcon />;
      case 'client':
        return <BusinessIcon />;
      case 'task':
        return <CheckIcon />;
      case 'document':
        return <DocumentIcon />;
      case 'invoice':
        return <MoneyIcon />;
      case 'system':
        return <AlertIcon />;
      case 'user':
        return <PersonIcon />;
      case 'comment':
        return <CommentIcon />;
      case 'meeting':
        return <CalendarIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  // Get color for the activity based on type or custom color
  const getActivityColor = (type: ActivityType, customColor?: string) => {
    if (customColor) return customColor;

    switch (type) {
      case 'message':
        return theme.palette.info.main;
      case 'notification':
        return theme.palette.warning.main;
      case 'project':
        return theme.palette.primary.main;
      case 'client':
        return theme.palette.secondary.main;
      case 'task':
        return theme.palette.success.main;
      case 'document':
        return theme.palette.info.main;
      case 'invoice':
        return theme.palette.error.main;
      case 'system':
        return theme.palette.warning.main;
      case 'user':
        return theme.palette.primary.main;
      case 'comment':
        return theme.palette.info.main;
      case 'meeting':
        return theme.palette.secondary.main;
      default:
        return theme.palette.primary.main;
    }
  };

  // Handle marking an item as read
  const handleItemRead = (id: string) => {
    if (onItemRead) {
      onItemRead(id);

      // Update local state for immediate UI feedback
      setDisplayedActivities(prevActivities =>
        prevActivities.map(activity =>
          activity.id === id ? { ...activity, read: true } : activity
        )
      );
    }
  };

  // Get the priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
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

  // Render loading skeleton
  if (loading) {
    return (
      <Card sx={{ height }}>
        {showHeader && (
          <>
            <CardHeader
              title={<Skeleton width="60%" height={28} />}
              action={
                <Box sx={{ display: 'flex' }}>
                  <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1 }} />
                  <Skeleton variant="circular" width={32} height={32} />
                </Box>
              }
            />
            <Divider />
          </>
        )}
        <CardContent>
          <List disablePadding sx={{
            mt: showHeader ? 0 : -2,
            pt: showHeader ? 0 : 2
          }}>
            {Array.from(new Array(maxItems)).map((_, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
                  {showAvatar && (
                    <ListItemAvatar>
                      <Skeleton variant="circular" width={40} height={40} />
                    </ListItemAvatar>
                  )}
                  <ListItemText
                    primary={<Skeleton width="80%" height={24} />}
                    secondary={
                      <>
                        <Skeleton width="100%" height={16} />
                        <Skeleton width="40%" height={16} />
                      </>
                    }
                  />
                </ListItem>
                {index < maxItems - 1 && <Divider variant="inset" component="li" sx={{ ml: showAvatar ? undefined : 0 }} />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height, display: 'flex', flexDirection: 'column' }}>
      {showHeader && (
        <>
          <CardHeader
            title={
              <Typography variant="h6" component="h2">
                {title}
              </Typography>
            }
            action={
              <Box sx={{ display: 'flex' }}>
                {onMarkAllAsRead && (
                  <Tooltip title="Mark all as read">
                    <IconButton size="small" onClick={onMarkAllAsRead} sx={{ mr: 1 }}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {onClearAll && (
                  <Tooltip title="Clear all">
                    <IconButton size="small" onClick={onClearAll}>
                      <ClearAllIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            }
          />
          <Divider />
        </>
      )}

      <CardContent
        sx={{
          flex: 1,
          p: 0,
          overflow: 'auto',
        }}
      >
        {displayedActivities.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">{emptyMessage}</Typography>
          </Box>
        ) : (
          <List disablePadding sx={{
            mt: showHeader ? 0 : -2,
            pt: showHeader ? 0 : 2
          }}>
            {displayedActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    py: variant === 'compact' ? 1 : 1.5,
                    px: 2,
                    bgcolor: !activity.read ? `${theme.palette.primary.main}08` : 'transparent',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: !activity.read
                        ? `${theme.palette.primary.main}15`
                        : theme.palette.action.hover,
                    },
                  }}
                  onClick={() => {
                    if (!activity.read) {
                      handleItemRead(activity.id);
                    }
                  }}
                  component={activity.link ? Link : 'li'}
                  href={activity.link || ''}
                  button={!!activity.link}
                >
                  {showAvatar && (
                    <ListItemAvatar>
                      {activity.avatarUrl ? (
                        <Avatar alt={activity.title} src={activity.avatarUrl} />
                      ) : (
                        <Avatar
                          sx={{
                            bgcolor: `${getActivityColor(activity.type, activity.color)}15`,
                            color: getActivityColor(activity.type, activity.color),
                          }}
                        >
                          {getActivityIcon(activity.type, activity.icon)}
                        </Avatar>
                      )}
                    </ListItemAvatar>
                  )}

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography
                          variant="body1"
                          component="div"
                          sx={{
                            fontWeight: !activity.read ? 500 : 400,
                            mr: 1
                          }}
                        >
                          {activity.title}
                        </Typography>

                        {activity.priority && (
                          <Chip
                            label={activity.priority}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.6rem',
                              color: getPriorityColor(activity.priority),
                              borderColor: getPriorityColor(activity.priority),
                              bgcolor: `${getPriorityColor(activity.priority)}10`,
                              mr: 0.5
                            }}
                            variant="outlined"
                          />
                        )}

                        {activity.tags && activity.tags.length > 0 && variant !== 'compact' && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {activity.tags.map((tag, tagIndex) => (
                              <Chip
                                key={tagIndex}
                                label={tag}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.6rem'
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        {activity.description && (
                          <Typography
                            variant="body2"
                            color="text.primary"
                            component="div"
                            sx={{ mt: 0.5, display: 'block' }}
                          >
                            {activity.description}
                          </Typography>
                        )}

                        <Box sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 0.5,
                          flexWrap: 'wrap'
                        }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center' }}
                          >
                            <TimeIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                            {activity.timestamp}
                          </Typography>

                          {activity.actions && activity.actions.length > 0 && variant !== 'compact' && (
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              {activity.actions.map((action, actionIndex) => (
                                <React.Fragment key={actionIndex}>
                                  {action.href ? (
                                    <Link href={action.href} passHref>
                                      <Button
                                        component="a"
                                        size="small"
                                        variant={action.variant || 'text'}
                                        color={action.color || 'primary'}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (action.onClick) action.onClick();
                                        }}
                                      >
                                        {action.label}
                                      </Button>
                                    </Link>
                                  ) : (
                                    <Button
                                      size="small"
                                      variant={action.variant || 'text'}
                                      color={action.color || 'primary'}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (action.onClick) action.onClick();
                                      }}
                                    >
                                      {action.label}
                                    </Button>
                                  )}
                                </React.Fragment>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </>
                    }
                  />

                  {!activity.read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: theme.palette.primary.main,
                        alignSelf: 'center',
                        mr: 1
                      }}
                    />
                  )}
                </ListItem>
                {index < displayedActivities.length - 1 && (
                  <Divider
                    component="li"
                    variant="inset"
                    sx={{ ml: showAvatar ? undefined : 0 }}
                  />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
