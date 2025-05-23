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
  ListItemAvatar,
  ListItemSecondaryAction,
  Tab,
  Tabs,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Link as MuiLink,
  Breadcrumbs,
  Stack,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  Autocomplete
} from '@mui/material';
import {
  Business as BusinessIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Public as WebsiteIcon,
  Work as WorkIcon,
  WorkOutline as CaseStudyIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  Lightbulb as IndustryIcon,
  CalendarToday as FoundedIcon,
  Timeline as ActivityIcon,
  CreditCard as BillingIcon,
  Key as AdminIcon,
  Person as OwnerIcon,
  AccountCircle as MemberIcon,
  SupervisorAccount as GuestIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Assignment as ProjectIcon
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/Layout';
import { organizationAPI, projectAPI, caseStudyAPI, userAPI } from '@/lib/api';
import Link from 'next/link';

// Type definitions
interface Organization {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: string;
  founded?: number;
  headquarters?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  contacts?: Array<{
    name: string;
    email: string;
    phone?: string;
    role?: string;
  }>;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  };
  members: Array<{
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      profileImage?: string;
    };
    role: string;
    addedAt: string;
  }>;
  active: boolean;
  subscription: {
    plan: string;
    startDate?: string;
    endDate?: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: string;
  team: Array<{
    user: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    role: string;
  }>;
}

interface CaseStudy {
  _id: string;
  title: string;
  challenge: string;
  solution: string;
  results: string;
  publishDate: string;
  status: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  role: string;
}

// Mock data for activities - in a real app this would come from the API
const mockActivityData = [
  {
    id: 1,
    action: 'Organization Updated',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    user: 'John Doe',
    details: 'Updated organization profile information'
  },
  {
    id: 2,
    action: 'Member Added',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    user: 'Jane Smith',
    details: 'Added Emma Watson as a member'
  },
  {
    id: 3,
    action: 'Project Created',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    user: 'John Doe',
    details: 'Created new project "Website Redesign"'
  },
  {
    id: 4,
    action: 'Subscription Changed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    user: 'System',
    details: 'Subscription plan changed from Basic to Professional'
  }
];

// TabPanel component for tab content
function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`organization-tabpanel-${index}`}
      aria-labelledby={`organization-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function OrganizationDetail() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as string;

  // State
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    size: '',
    website: '',
    founded: '',
    headquarters: {
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    socialMedia: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: ''
    }
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activityData, setActivityData] = useState(mockActivityData);
  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState('member');
  const [openEditMemberDialog, setOpenEditMemberDialog] = useState(false);
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [openRemoveMemberDialog, setOpenRemoveMemberDialog] = useState(false);
  const [openSubscriptionDialog, setOpenSubscriptionDialog] = useState(false);
  const [subscriptionFormData, setSubscriptionFormData] = useState({
    plan: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  // Fetch organization data
  useEffect(() => {
    const fetchOrganizationData = async () => {
      setLoading(true);
      try {
        const response = await organizationAPI.getOrganizationById(organizationId);
        setOrganization(response.data.data);

        // Set form data for editing
        const org = response.data.data;
        setFormData({
          name: org.name,
          description: org.description || '',
          industry: org.industry || '',
          size: org.size || '',
          website: org.website || '',
          founded: org.founded ? org.founded.toString() : '',
          headquarters: {
            address: org.headquarters?.address || '',
            city: org.headquarters?.city || '',
            state: org.headquarters?.state || '',
            country: org.headquarters?.country || '',
            postalCode: org.headquarters?.postalCode || ''
          },
          socialMedia: {
            linkedin: org.socialMedia?.linkedin || '',
            twitter: org.socialMedia?.twitter || '',
            facebook: org.socialMedia?.facebook || '',
            instagram: org.socialMedia?.instagram || ''
          }
        });

        setSubscriptionFormData({
          plan: org.subscription?.plan || 'free',
          status: org.subscription?.status || 'active',
          startDate: org.subscription?.startDate || '',
          endDate: org.subscription?.endDate || ''
        });

        // Fetch projects for this organization
        try {
          const projectsResponse = await projectAPI.getAllProjects({ organization: organizationId });
          setProjects(projectsResponse.data.data);
        } catch (projectError) {
          console.error('Error fetching organization projects:', projectError);
        }

        // Fetch case studies for this organization
        try {
          const caseStudiesResponse = await caseStudyAPI.getAllCaseStudies({ organization: organizationId });
          setCaseStudies(caseStudiesResponse.data.data);
        } catch (caseStudyError) {
          console.error('Error fetching organization case studies:', caseStudyError);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching organization:', err);
        setError('Failed to load organization data. Please try again.');
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchOrganizationData();
    }
  }, [organizationId]);

  // Fetch available users for adding members
  const fetchAvailableUsers = async () => {
    try {
      const response = await userAPI.getAllUsers({ limit: 100 });

      // Filter out users who are already members
      const existingMemberIds = organization?.members.map(member => member.user._id) || [];

      const availableUsersList = response.data.data.filter(
        (user: User) => !existingMemberIds.includes(user._id)
      );

      setAvailableUsers(availableUsersList);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Toggle edit mode
  const handleToggleEditMode = () => {
    setEditMode(!editMode);
    setSaveSuccess(false);
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Save organization profile
  const handleSaveProfile = async () => {
    setSaveLoading(true);
    try {
      const updateData = {
        ...formData,
        founded: formData.founded ? parseInt(formData.founded) : undefined
      };

      await organizationAPI.updateOrganization(organizationId, updateData);

      // Refresh organization data
      const response = await organizationAPI.getOrganizationById(organizationId);
      setOrganization(response.data.data);

      setSaveSuccess(true);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating organization:', err);
      setError('Failed to update organization profile. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle opening add member dialog
  const handleOpenAddMemberDialog = () => {
    fetchAvailableUsers();
    setSelectedUser(null);
    setSelectedRole('member');
    setOpenAddMemberDialog(true);
  };

  // Handle adding a member
  const handleAddMember = async () => {
    if (!selectedUser) return;

    try {
      await organizationAPI.addOrganizationMember(
        organizationId,
        { userId: selectedUser._id, role: selectedRole }
      );

      // Refresh organization data
      const response = await organizationAPI.getOrganizationById(organizationId);
      setOrganization(response.data.data);

      setOpenAddMemberDialog(false);
    } catch (error) {
      console.error('Error adding member:', error);
      setError('Failed to add member. Please try again.');
    }
  };

  // Handle opening edit member dialog
  const handleOpenEditMemberDialog = (member: any) => {
    setCurrentMember(member);
    setSelectedRole(member.role);
    setOpenEditMemberDialog(true);
  };

  // Handle updating a member's role
  const handleUpdateMember = async () => {
    if (!currentMember) return;

    try {
      await organizationAPI.updateOrganizationMember(
        organizationId,
        currentMember.user._id,
        { role: selectedRole }
      );

      // Refresh organization data
      const response = await organizationAPI.getOrganizationById(organizationId);
      setOrganization(response.data.data);

      setOpenEditMemberDialog(false);
    } catch (error) {
      console.error('Error updating member:', error);
      setError('Failed to update member. Please try again.');
    }
  };

  // Handle opening remove member dialog
  const handleOpenRemoveMemberDialog = (member: any) => {
    setCurrentMember(member);
    setOpenRemoveMemberDialog(true);
  };

  // Handle removing a member
  const handleRemoveMember = async () => {
    if (!currentMember) return;

    try {
      await organizationAPI.removeOrganizationMember(
        organizationId,
        currentMember.user._id
      );

      // Refresh organization data
      const response = await organizationAPI.getOrganizationById(organizationId);
      setOrganization(response.data.data);

      setOpenRemoveMemberDialog(false);
    } catch (error) {
      console.error('Error removing member:', error);
      setError('Failed to remove member. Please try again.');
    }
  };

  // Handle opening subscription dialog
  const handleOpenSubscriptionDialog = () => {
    setOpenSubscriptionDialog(true);
  };

  // Handle updating subscription
  const handleUpdateSubscription = async () => {
    try {
      await organizationAPI.updateOrganization(
        organizationId,
        { subscription: subscriptionFormData }
      );

      // Refresh organization data
      const response = await organizationAPI.getOrganizationById(organizationId);
      setOrganization(response.data.data);

      setOpenSubscriptionDialog(false);
    } catch (error) {
      console.error('Error updating subscription:', error);
      setError('Failed to update subscription. Please try again.');
    }
  };

  // Handle subscription form change
  const handleSubscriptionFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setSubscriptionFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Get the role icon based on member role
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <OwnerIcon color="primary" />;
      case 'admin':
        return <AdminIcon color="secondary" />;
      case 'guest':
        return <GuestIcon />;
      default:
        return <MemberIcon />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Organization Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !organization) {
    return (
      <DashboardLayout title="Organization Details">
        <Box sx={{ mt: 2 }}>
          <Alert severity="error">{error || 'Organization not found'}</Alert>
          <Button
            startIcon={<BackIcon />}
            onClick={() => router.push('/dashboard/organizations')}
            sx={{ mt: 2 }}
          >
            Back to Organizations
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Organization Details">
      <Box sx={{ mt: 2, mb: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/dashboard" passHref>
            <MuiLink underline="hover" color="inherit">
              Dashboard
            </MuiLink>
          </Link>
          <Link href="/dashboard/organizations" passHref>
            <MuiLink underline="hover" color="inherit">
              Organizations
            </MuiLink>
          </Link>
          <Typography color="text.primary">{organization.name}</Typography>
        </Breadcrumbs>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Organization profile updated successfully
          </Alert>
        )}

        <Paper sx={{ p: 0, overflow: 'hidden' }}>
          {/* Organization Header */}
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
                  src={organization.logo}
                  alt={organization.name}
                  variant="rounded"
                  sx={{ width: 80, height: 80, bgcolor: 'white', color: 'primary.main' }}
                >
                  {organization.name.charAt(0)}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h5" component="h1">
                  {organization.name}
                </Typography>
                <Typography variant="subtitle1">
                  {organization.industry || 'No industry specified'} • {organization.size || 'Size not specified'}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={organization.subscription?.plan || 'Free'}
                    color={
                      organization.subscription?.plan === 'enterprise' ? 'secondary' :
                      organization.subscription?.plan === 'professional' ? 'primary' :
                      organization.subscription?.plan === 'basic' ? 'info' :
                      'default'
                    }
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={organization.active ? 'Active' : 'Inactive'}
                    color={organization.active ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={editMode ? "outlined" : "contained"}
                    color="secondary"
                    startIcon={<EditIcon />}
                    onClick={handleToggleEditMode}
                    sx={{ color: 'white', borderColor: 'white' }}
                  >
                    {editMode ? 'Cancel' : 'Edit Profile'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<BillingIcon />}
                    onClick={handleOpenSubscriptionDialog}
                    sx={{ color: 'white', borderColor: 'white' }}
                  >
                    Manage Subscription
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="organization tabs">
              <Tab label="Details" />
              <Tab label="Members" />
              <Tab label="Projects" />
              <Tab label="Case Studies" />
              <Tab label="Activity" />
            </Tabs>
          </Box>

          {/* Details Tab */}
          <TabPanel value={tabValue} index={0}>
            {editMode ? (
              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="name"
                      label="Organization Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="description"
                      label="Description"
                      value={formData.description}
                      onChange={handleInputChange}
                      fullWidth
                      multiline
                      rows={3}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="industry"
                      label="Industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      select
                      fullWidth
                    >
                      <MenuItem value="">Select Industry</MenuItem>
                      <MenuItem value="Technology">Technology</MenuItem>
                      <MenuItem value="Finance">Finance</MenuItem>
                      <MenuItem value="Healthcare">Healthcare</MenuItem>
                      <MenuItem value="Education">Education</MenuItem>
                      <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                      <MenuItem value="Retail">Retail</MenuItem>
                      <MenuItem value="Services">Services</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="size"
                      label="Size"
                      value={formData.size}
                      onChange={handleInputChange}
                      select
                      fullWidth
                    >
                      <MenuItem value="">Select Size</MenuItem>
                      <MenuItem value="1-10">1-10</MenuItem>
                      <MenuItem value="11-50">11-50</MenuItem>
                      <MenuItem value="51-200">51-200</MenuItem>
                      <MenuItem value="201-500">201-500</MenuItem>
                      <MenuItem value="501-1000">501-1000</MenuItem>
                      <MenuItem value="1000+">1000+</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="website"
                      label="Website"
                      value={formData.website}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="founded"
                      label="Founded Year"
                      value={formData.founded}
                      onChange={handleInputChange}
                      fullWidth
                      type="number"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Headquarters
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="headquarters.address"
                      label="Address"
                      value={formData.headquarters.address}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      name="headquarters.city"
                      label="City"
                      value={formData.headquarters.city}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      name="headquarters.state"
                      label="State/Province"
                      value={formData.headquarters.state}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      name="headquarters.country"
                      label="Country"
                      value={formData.headquarters.country}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Social Media
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="socialMedia.linkedin"
                      label="LinkedIn"
                      value={formData.socialMedia.linkedin}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="socialMedia.twitter"
                      label="Twitter"
                      value={formData.socialMedia.twitter}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="socialMedia.facebook"
                      label="Facebook"
                      value={formData.socialMedia.facebook}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="socialMedia.instagram"
                      label="Instagram"
                      value={formData.socialMedia.instagram}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleToggleEditMode}
                    startIcon={<CancelIcon />}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveProfile}
                    disabled={saveLoading}
                    startIcon={<SaveIcon />}
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
                      Basic Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                      {organization.description && (
                        <ListItem sx={{ px: 0 }}>
                          <Typography variant="body1" paragraph>
                            {organization.description}
                          </Typography>
                        </ListItem>
                      )}
                      {organization.website && (
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.light' }}>
                              <WebsiteIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Website"
                            secondary={
                              <MuiLink href={organization.website} target="_blank" rel="noopener">
                                {organization.website}
                              </MuiLink>
                            }
                          />
                        </ListItem>
                      )}
                      {organization.industry && (
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.light' }}>
                              <IndustryIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary="Industry" secondary={organization.industry} />
                        </ListItem>
                      )}
                      {organization.size && (
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.light' }}>
                              <GroupIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary="Company Size" secondary={organization.size} />
                        </ListItem>
                      )}
                      {organization.founded && (
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.light' }}>
                              <FoundedIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary="Founded" secondary={organization.founded} />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      Contact Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                      {organization.headquarters && (
                        Object.values(organization.headquarters).some(val => val) && (
                          <ListItem sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.light' }}>
                                <LocationIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary="Headquarters"
                              secondary={
                                <Box component="span">
                                  {organization.headquarters.address && (
                                    <Typography variant="body2">{organization.headquarters.address}</Typography>
                                  )}
                                  {(organization.headquarters.city || organization.headquarters.state) && (
                                    <Typography variant="body2">
                                      {organization.headquarters.city}{organization.headquarters.city && organization.headquarters.state && ', '}
                                      {organization.headquarters.state}
                                    </Typography>
                                  )}
                                  {organization.headquarters.country && (
                                    <Typography variant="body2">{organization.headquarters.country}</Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        )
                      )}

                      {organization.socialMedia && (
                        Object.values(organization.socialMedia).some(val => val) && (
                          <ListItem sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.light' }}>
                                <LinkIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary="Social Media"
                              secondary={
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                  {organization.socialMedia.linkedin && (
                                    <MuiLink href={organization.socialMedia.linkedin} target="_blank" rel="noopener">
                                      LinkedIn
                                    </MuiLink>
                                  )}
                                  {organization.socialMedia.twitter && (
                                    <MuiLink href={organization.socialMedia.twitter} target="_blank" rel="noopener">
                                      Twitter
                                    </MuiLink>
                                  )}
                                  {organization.socialMedia.facebook && (
                                    <MuiLink href={organization.socialMedia.facebook} target="_blank" rel="noopener">
                                      Facebook
                                    </MuiLink>
                                  )}
                                  {organization.socialMedia.instagram && (
                                    <MuiLink href={organization.socialMedia.instagram} target="_blank" rel="noopener">
                                      Instagram
                                    </MuiLink>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        )
                      )}
                    </List>
                  </Paper>

                  <Paper sx={{ p: 2, mt: 3 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      Subscription Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <BillingIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Subscription Plan"
                          secondary={organization.subscription?.plan.charAt(0).toUpperCase() + organization.subscription?.plan.slice(1) || 'Free'}
                        />
                      </ListItem>

                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <SecurityIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Status"
                          secondary={
                            <Chip
                              label={organization.subscription?.status || 'active'}
                              color={
                                organization.subscription?.status === 'active' ? 'success' :
                                organization.subscription?.status === 'pending' ? 'warning' :
                                organization.subscription?.status === 'expired' ? 'error' :
                                'default'
                              }
                              size="small"
                            />
                          }
                        />
                      </ListItem>

                      {organization.subscription?.startDate && (
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText
                            primary="Start Date"
                            secondary={new Date(organization.subscription.startDate).toLocaleDateString()}
                          />
                        </ListItem>
                      )}

                      {organization.subscription?.endDate && (
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText
                            primary="Renewal Date"
                            secondary={new Date(organization.subscription.endDate).toLocaleDateString()}
                          />
                        </ListItem>
                      )}
                    </List>

                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<BillingIcon />}
                        onClick={handleOpenSubscriptionDialog}
                      >
                        Manage Subscription
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </TabPanel>

          {/* Members Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                Organization Members ({organization.members.length})
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PersonAddIcon />}
                onClick={handleOpenAddMemberDialog}
              >
                Add Member
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {organization.members.map((member, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            src={member.user.profileImage}
                            alt={`${member.user.firstName} ${member.user.lastName}`}
                            sx={{ mr: 2 }}
                          >
                            {member.user.firstName[0]}{member.user.lastName[0]}
                          </Avatar>
                          <Typography>
                            {member.user.firstName} {member.user.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{member.user.email}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 1 }}>
                            {getRoleIcon(member.role)}
                          </Box>
                          <Chip
                            label={member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            color={
                              member.role === 'owner' ? 'primary' :
                              member.role === 'admin' ? 'secondary' :
                              'default'
                            }
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(member.addedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        {member.role !== 'owner' && (
                          <>
                            <Tooltip title="Edit Role">
                              <IconButton
                                onClick={() => handleOpenEditMemberDialog(member)}
                                size="small"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove Member">
                              <IconButton
                                onClick={() => handleOpenRemoveMemberDialog(member)}
                                size="small"
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {organization.members.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No members found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Projects Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                Organization Projects ({projects.length})
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => router.push('/dashboard/projects/new?organization=' + organizationId)}
              >
                Create Project
              </Button>
            </Box>

            <Grid container spacing={2}>
              {projects.length > 0 ? (
                projects.map(project => (
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
                            Team
                          </Typography>
                          <Typography variant="body2">
                            {project.team.length} member{project.team.length !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <ProjectIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No Projects Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      This organization doesn't have any projects yet.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => router.push('/dashboard/projects/new?organization=' + organizationId)}
                    >
                      Create First Project
                    </Button>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          {/* Case Studies Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                Case Studies ({caseStudies.length})
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => router.push('/dashboard/case-studies/new?organization=' + organizationId)}
              >
                Create Case Study
              </Button>
            </Box>

            <Grid container spacing={2}>
              {caseStudies.length > 0 ? (
                caseStudies.map(caseStudy => (
                  <Grid item xs={12} md={6} key={caseStudy._id}>
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
                      onClick={() => router.push(`/dashboard/case-studies/${caseStudy._id}`)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="h3">
                          {caseStudy.title}
                        </Typography>
                        <Chip
                          label={caseStudy.status}
                          color={
                            caseStudy.status === 'published' ? 'success' :
                            caseStudy.status === 'draft' ? 'default' :
                            'primary'
                          }
                          size="small"
                        />
                      </Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                        Challenge
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {caseStudy.challenge.length > 100
                          ? `${caseStudy.challenge.substring(0, 100)}...`
                          : caseStudy.challenge}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Published: {new Date(caseStudy.publishDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <CaseStudyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No Case Studies Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      This organization doesn't have any case studies yet.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => router.push('/dashboard/case-studies/new?organization=' + organizationId)}
                    >
                      Create First Case Study
                    </Button>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          {/* Activity Tab */}
          <TabPanel value={tabValue} index={4}>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Action</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activityData.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>{activity.user}</TableCell>
                      <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{activity.details}</TableCell>
                    </TableRow>
                  ))}
                  {activityData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No activity recorded</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Paper>
      </Box>

      {/* Add Member Dialog */}
      <Dialog
        open={openAddMemberDialog}
        onClose={() => setOpenAddMemberDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Member to Organization</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              options={availableUsers}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email})`}
              value={selectedUser}
              onChange={(event, newValue) => {
                setSelectedUser(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select User"
                  variant="outlined"
                  fullWidth
                  required
                />
              )}
            />
            <FormControl fullWidth>
              <InputLabel id="member-role-label">Role</InputLabel>
              <Select
                labelId="member-role-label"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                label="Role"
              >
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="guest">Guest</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddMemberDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddMember}
            variant="contained"
            color="primary"
            disabled={!selectedUser}
          >
            Add Member
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog
        open={openEditMemberDialog}
        onClose={() => setOpenEditMemberDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Member Role</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography gutterBottom>
              Change role for {currentMember?.user.firstName} {currentMember?.user.lastName}
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="edit-member-role-label">Role</InputLabel>
              <Select
                labelId="edit-member-role-label"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                label="Role"
              >
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="guest">Guest</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditMemberDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateMember}
            variant="contained"
            color="primary"
          >
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog
        open={openRemoveMemberDialog}
        onClose={() => setOpenRemoveMemberDialog(false)}
      >
        <DialogTitle>Remove Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove {currentMember?.user.firstName} {currentMember?.user.lastName} from this organization?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRemoveMemberDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRemoveMember}
            color="error"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subscription Dialog */}
      <Dialog
        open={openSubscriptionDialog}
        onClose={() => setOpenSubscriptionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manage Subscription</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="subscription-plan-label">Subscription Plan</InputLabel>
              <Select
                labelId="subscription-plan-label"
                name="plan"
                value={subscriptionFormData.plan}
                onChange={handleSubscriptionFormChange}
                label="Subscription Plan"
              >
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="subscription-status-label">Status</InputLabel>
              <Select
                labelId="subscription-status-label"
                name="status"
                value={subscriptionFormData.status}
                onChange={handleSubscriptionFormChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              value={subscriptionFormData.startDate ? new Date(subscriptionFormData.startDate).toISOString().split('T')[0] : ''}
              onChange={handleSubscriptionFormChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="End Date"
              name="endDate"
              type="date"
              value={subscriptionFormData.endDate ? new Date(subscriptionFormData.endDate).toISOString().split('T')[0] : ''}
              onChange={handleSubscriptionFormChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubscriptionDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateSubscription}
            variant="contained"
            color="primary"
          >
            Update Subscription
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
