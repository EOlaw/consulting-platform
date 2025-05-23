'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Switch,
  FormControlLabel,
  Tooltip,
  Link
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
  BusinessCenter as RoleIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  DeviceHub as ApiIcon,
  Delete as DeleteIcon,
  LockReset as ResetPasswordIcon,
  CheckCircle as VerifyEmailIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/Layout';
import { userAPI, projectAPI } from '@/lib/api';

// Mock data for user activity - in a real app this would come from the API
const mockUserActivity = [
  {
    id: 1,
    action: 'Login',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    ip: '192.168.1.1',
    userAgent: 'Chrome/96.0.4664.110',
    details: 'Successful login'
  },
  {
    id: 2,
    action: 'Password Change',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    ip: '192.168.1.1',
    userAgent: 'Chrome/96.0.4664.110',
    details: 'User changed their password'
  },
  {
    id: 3,
    action: 'Profile Update',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    ip: '192.168.1.1',
    userAgent: 'Chrome/96.0.4664.110',
    details: 'Updated profile information (name, title)'
  },
  {
    id: 4,
    action: 'Login',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    ip: '192.168.1.1',
    userAgent: 'Chrome/96.0.4664.110',
    details: 'Successful login'
  },
  {
    id: 5,
    action: 'Failed Login',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 - 1000 * 60 * 5).toISOString(),
    ip: '192.168.1.1',
    userAgent: 'Chrome/96.0.4664.110',
    details: 'Invalid password attempt'
  }
];

// Mock data for login history
const mockLoginHistory = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    ip: '192.168.1.1',
    location: 'San Francisco, CA',
    device: 'Desktop',
    browser: 'Chrome',
    status: 'success'
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    ip: '192.168.1.1',
    location: 'San Francisco, CA',
    device: 'Desktop',
    browser: 'Chrome',
    status: 'success'
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 - 1000 * 60 * 5).toISOString(),
    ip: '192.168.1.1',
    location: 'San Francisco, CA',
    device: 'Desktop',
    browser: 'Chrome',
    status: 'failed'
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    ip: '192.168.1.2',
    location: 'San Francisco, CA',
    device: 'Mobile',
    browser: 'Safari',
    status: 'success'
  }
];

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UserDetail() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;

  // State
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    title: '',
    bio: '',
    skills: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userActivity, setUserActivity] = useState(mockUserActivity);
  const [loginHistory, setLoginHistory] = useState(mockLoginHistory);
  const [showAPITokens, setShowAPITokens] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showSendVerificationDialog, setShowSendVerificationDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    emailNotifications: true,
    twoFactorAuth: false,
    apiAccess: false
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await userAPI.getUserById(userId);
        setUser(response.data.data);
        setFormData({
          firstName: response.data.data.firstName,
          lastName: response.data.data.lastName,
          email: response.data.data.email,
          phoneNumber: response.data.data.phoneNumber || '',
          title: response.data.data.title || '',
          bio: response.data.data.bio || '',
          skills: response.data.data.skills ? response.data.data.skills.join(', ') : ''
        });

        // In a real app, we would fetch these from the API
        // setUserActivity(response.data.activity);
        // setLoginHistory(response.data.loginHistory);

        // Fetch user's projects
        try {
          const projectsResponse = await projectAPI.getAllProjects({ team: userId });
          setProjects(projectsResponse.data.data);
        } catch (projectError) {
          console.error('Error fetching user projects:', projectError);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user data. Please try again.');
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Toggle edit mode
  const handleToggleEditMode = () => {
    setEditMode(!editMode);
    setSaveSuccess(false);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Save user profile
  const handleSaveProfile = async () => {
    setSaveLoading(true);
    try {
      // Convert skills from comma-separated string to array
      const updateData = {
        ...formData,
        skills: formData.skills
          ? formData.skills.split(',').map(skill => skill.trim())
          : []
      };

      await userAPI.updateUser(userId, updateData);

      // Refresh user data
      const response = await userAPI.getUserById(userId);
      setUser(response.data.data);

      setSaveSuccess(true);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user profile. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    try {
      // In a real app, this would call userAPI.resetPassword(userId)
      alert('Password reset email sent to the user');
      setShowResetPasswordDialog(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Failed to reset password. Please try again.');
    }
  };

  // Send verification email
  const handleSendVerification = async () => {
    try {
      // In a real app, this would call userAPI.sendVerificationEmail(userId)
      alert('Verification email sent to the user');
      setShowSendVerificationDialog(false);
    } catch (error) {
      console.error('Error sending verification email:', error);
      setError('Failed to send verification email. Please try again.');
    }
  };

  // Deactivate/activate user
  const handleToggleUserStatus = async () => {
    try {
      // In a real app, this would call userAPI.updateUser(userId, { active: !user.active })
      const newStatus = !(user.active === false);
      alert(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);

      // Update local state
      setUser({
        ...user,
        active: newStatus
      });

      setShowDeactivateDialog(false);
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user status. Please try again.');
    }
  };

  // Handle preference change
  const handlePreferenceChange = (event) => {
    const { name, checked } = event.target;
    setUserPreferences({
      ...userPreferences,
      [name]: checked
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="User Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !user) {
    return (
      <DashboardLayout title="User Details">
        <Box sx={{ mt: 2 }}>
          <Alert severity="error">{error || 'User not found'}</Alert>
          <Button
            startIcon={<BackIcon />}
            onClick={() => router.push('/dashboard/users')}
            sx={{ mt: 2 }}
          >
            Back to Users
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="User Details">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => router.push('/dashboard/users')}
          sx={{ mb: 2 }}
        >
          Back to Users
        </Button>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            User profile updated successfully
          </Alert>
        )}

        <Paper sx={{ p: 0, overflow: 'hidden' }}>
          {/* User Header */}
          <Box
            sx={{
              p: 3,
              backgroundColor: 'primary.main',
              color: 'white',
              position: 'relative'
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar
                  src={user.profileImage}
                  alt={`${user.firstName} ${user.lastName}`}
                  sx={{ width: 80, height: 80, border: '3px solid white' }}
                >
                  {user.firstName[0]}{user.lastName[0]}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h5" component="h1">
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="subtitle1">
                  {user.title || 'No title specified'}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={user.role}
                    color="secondary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  {user.active === false ? (
                    <Chip label="Inactive" size="small" />
                  ) : !user.isEmailVerified ? (
                    <Chip label="Unverified" color="warning" size="small" />
                  ) : (
                    <Chip label="Active" color="success" size="small" />
                  )}
                </Box>
              </Grid>
              <Grid item>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={editMode ? "outlined" : "contained"}
                    color={editMode ? "secondary" : "secondary"}
                    startIcon={<EditIcon />}
                    onClick={handleToggleEditMode}
                    sx={{ color: 'white', borderColor: 'white' }}
                  >
                    {editMode ? 'Cancel' : 'Edit Profile'}
                  </Button>
                  <IconButton
                    sx={{ color: 'white' }}
                    onClick={() => setShowResetPasswordDialog(true)}
                    title="Reset Password"
                  >
                    <ResetPasswordIcon />
                  </IconButton>
                  {!user.isEmailVerified && (
                    <IconButton
                      sx={{ color: 'white' }}
                      onClick={() => setShowSendVerificationDialog(true)}
                      title="Send Verification Email"
                    >
                      <VerifyEmailIcon />
                    </IconButton>
                  )}
                  <IconButton
                    sx={{ color: 'white' }}
                    onClick={() => setShowDeactivateDialog(true)}
                    title={user.active === false ? "Activate User" : "Deactivate User"}
                  >
                    {user.active === false ? <RefreshIcon /> : <BlockIcon />}
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="user tabs">
              <Tab label="Profile" />
              <Tab label="Projects" />
              <Tab label="Activity" />
              <Tab label="Login History" />
              <Tab label="Security" />
            </Tabs>
          </Box>

          {/* Profile Tab */}
          <TabPanel value={tabValue} index={0}>
            {editMode ? (
              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="firstName"
                      label="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="lastName"
                      label="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="email"
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="phoneNumber"
                      label="Phone Number"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="title"
                      label="Title"
                      value={formData.title}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="bio"
                      label="Bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      fullWidth
                      multiline
                      rows={4}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="skills"
                      label="Skills (comma separated)"
                      value={formData.skills}
                      onChange={handleInputChange}
                      fullWidth
                      helperText="Enter skills separated by commas"
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveProfile}
                    disabled={saveLoading}
                  >
                    {saveLoading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      Contact Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                      <ListItem>
                        <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <ListItemText primary="Email" secondary={user.email} />
                      </ListItem>
                      <ListItem>
                        <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <ListItemText
                          primary="Phone"
                          secondary={user.phoneNumber || 'Not specified'}
                        />
                      </ListItem>
                      <ListItem>
                        <RoleIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <ListItemText primary="Role" secondary={user.role} />
                      </ListItem>
                      <ListItem>
                        <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <ListItemText
                          primary="Organization"
                          secondary={user.organization ? user.organization.name : 'Not assigned'}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      Professional Profile
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Bio
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {user.bio || 'No bio provided'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Skills
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {user.skills && user.skills.length > 0 ? (
                          user.skills.map((skill, index) => (
                            <Chip key={index} label={skill} size="small" />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No skills listed
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      Account Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary="Account Status"
                              secondary={
                                user.active === false ? "Inactive" :
                                !user.isEmailVerified ? "Email Not Verified" :
                                "Active"
                              }
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Member Since"
                              secondary={new Date(user.createdAt).toLocaleDateString()}
                            />
                          </ListItem>
                        </List>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary="Last Login"
                              secondary={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Last Updated"
                              secondary={new Date(user.updatedAt).toLocaleString()}
                            />
                          </ListItem>
                        </List>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </TabPanel>

          {/* Projects Tab */}
          <TabPanel value={tabValue} index={1}>
            {projects.length > 0 ? (
              <Grid container spacing={2}>
                {projects.map(project => (
                  <Grid item xs={12} md={6} key={project._id}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={() => router.push(`/dashboard/projects/${project._id}`)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="h3">
                          {project.name}
                        </Typography>
                        <Chip
                          label={project.status}
                          color={
                            project.status === 'completed' ? 'success' :
                            project.status === 'in-progress' ? 'primary' :
                            project.status === 'on-hold' ? 'warning' :
                            project.status === 'canceled' ? 'error' : 'default'
                          }
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {project.description.length > 100
                          ? `${project.description.substring(0, 100)}...`
                          : project.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Start Date
                          </Typography>
                          <Typography variant="body2">
                            {new Date(project.startDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        {project.endDate && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              End Date
                            </Typography>
                            <Typography variant="body2">
                              {new Date(project.endDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Role
                          </Typography>
                          <Typography variant="body2">
                            {project.team.find(member => member.user === userId)?.role || 'Team Member'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Projects Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This user is not assigned to any projects yet.
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* Activity Tab */}
          <TabPanel value={tabValue} index={2}>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Action</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>IP Address</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{activity.ip}</TableCell>
                      <TableCell>{activity.details}</TableCell>
                    </TableRow>
                  ))}
                  {userActivity.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No activity recorded</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Login History Tab */}
          <TabPanel value={tabValue} index={3}>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>IP Address</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Device / Browser</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loginHistory.map((login) => (
                    <TableRow key={login.id}>
                      <TableCell>{new Date(login.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{login.ip}</TableCell>
                      <TableCell>{login.location}</TableCell>
                      <TableCell>{`${login.device} / ${login.browser}`}</TableCell>
                      <TableCell>
                        <Chip
                          label={login.status === 'success' ? 'Successful' : 'Failed'}
                          color={login.status === 'success' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {loginHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No login history</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader
                    title="Security Settings"
                    avatar={<SecurityIcon color="primary" />}
                  />
                  <CardContent>
                    <List>
                      <ListItem>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={userPreferences.twoFactorAuth}
                              onChange={handlePreferenceChange}
                              name="twoFactorAuth"
                            />
                          }
                          label="Two-Factor Authentication"
                        />
                      </ListItem>
                      <ListItem>
                        <Box sx={{ width: '100%' }}>
                          <Button
                            variant="outlined"
                            onClick={() => setShowResetPasswordDialog(true)}
                            startIcon={<ResetPasswordIcon />}
                          >
                            Reset Password
                          </Button>
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Send a password reset email to the user
                          </Typography>
                        </Box>
                      </ListItem>
                      <ListItem>
                        <Box sx={{ width: '100%' }}>
                          <Button
                            variant="outlined"
                            color={user.active === false ? "success" : "error"}
                            onClick={() => setShowDeactivateDialog(true)}
                            startIcon={user.active === false ? <RefreshIcon /> : <BlockIcon />}
                          >
                            {user.active === false ? "Activate Account" : "Deactivate Account"}
                          </Button>
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            {user.active === false
                              ? "Reactivate this user account"
                              : "Temporarily disable user access"}
                          </Typography>
                        </Box>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader
                    title="Notification Preferences"
                    avatar={<NotificationsIcon color="primary" />}
                  />
                  <CardContent>
                    <List>
                      <ListItem>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={userPreferences.emailNotifications}
                              onChange={handlePreferenceChange}
                              name="emailNotifications"
                            />
                          }
                          label="Email Notifications"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>

                <Card sx={{ mt: 3 }}>
                  <CardHeader
                    title="API Access"
                    avatar={<ApiIcon color="primary" />}
                    action={
                      <Switch
                        checked={userPreferences.apiAccess}
                        onChange={handlePreferenceChange}
                        name="apiAccess"
                      />
                    }
                  />
                  <CardContent>
                    {userPreferences.apiAccess ? (
                      <>
                        <Typography variant="body2" paragraph>
                          API access is enabled for this user. They can generate API tokens to access the system programmatically.
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setShowAPITokens(!showAPITokens)}
                        >
                          {showAPITokens ? 'Hide Tokens' : 'Show Tokens'}
                        </Button>

                        {showAPITokens && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              No API tokens generated yet
                            </Typography>
                            <Button variant="contained" size="small" sx={{ mt: 1 }}>
                              Generate New Token
                            </Button>
                          </Box>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        API access is disabled for this user
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ bgcolor: '#fff8e1' }}>
                  <CardHeader
                    title="Danger Zone"
                    titleTypographyProps={{ color: 'error' }}
                    avatar={<DeleteIcon color="error" />}
                  />
                  <CardContent>
                    <Typography variant="body2" paragraph>
                      These actions are permanent and cannot be undone.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                          if (confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
                            // In a real app: userAPI.deleteUser(userId)
                            alert("In a real application, this would delete the user");
                            router.push('/dashboard/users');
                          }
                        }}
                      >
                        Delete User
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => {
                          if (confirm("This will clear all user data except basic account information. Continue?")) {
                            alert("In a real application, this would anonymize the user data");
                          }
                        }}
                      >
                        Anonymize Data
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>

        {/* Reset Password Dialog */}
        <Dialog
          open={showResetPasswordDialog}
          onClose={() => setShowResetPasswordDialog(false)}
        >
          <DialogTitle>Reset User Password</DialogTitle>
          <Box sx={{ px: 3, pb: 3 }}>
            <Typography>
              This will send a password reset email to {user.email}.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
              <Button onClick={() => setShowResetPasswordDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleResetPassword}
              >
                Send Reset Email
              </Button>
            </Box>
          </Box>
        </Dialog>

        {/* Send Verification Email Dialog */}
        <Dialog
          open={showSendVerificationDialog}
          onClose={() => setShowSendVerificationDialog(false)}
        >
          <DialogTitle>Send Verification Email</DialogTitle>
          <Box sx={{ px: 3, pb: 3 }}>
            <Typography>
              This will send a new verification email to {user.email}.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
              <Button onClick={() => setShowSendVerificationDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendVerification}
              >
                Send Verification
              </Button>
            </Box>
          </Box>
        </Dialog>

        {/* Deactivate/Activate User Dialog */}
        <Dialog
          open={showDeactivateDialog}
          onClose={() => setShowDeactivateDialog(false)}
        >
          <DialogTitle>
            {user.active === false ? "Activate User Account" : "Deactivate User Account"}
          </DialogTitle>
          <Box sx={{ px: 3, pb: 3 }}>
            <Typography>
              {user.active === false
                ? `This will reactivate ${user.firstName} ${user.lastName}'s account, allowing them to log in again.`
                : `This will temporarily deactivate ${user.firstName} ${user.lastName}'s account. They will not be able to log in until the account is reactivated.`
              }
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
              <Button onClick={() => setShowDeactivateDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color={user.active === false ? "success" : "error"}
                onClick={handleToggleUserStatus}
              >
                {user.active === false ? "Activate" : "Deactivate"}
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
