'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Link from 'next/link';
import { caseStudyAPI, organizationAPI, userAPI } from '@/lib/api';

// Dynamic import for the rich text editor
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

// Import icons
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadIcon from '@mui/icons-material/Upload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ImageIcon from '@mui/icons-material/Image';
import TagIcon from '@mui/icons-material/Tag';
import CategoryIcon from '@mui/icons-material/Category';
import DevicesIcon from '@mui/icons-material/Devices';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import GroupIcon from '@mui/icons-material/Group';
import BuildIcon from '@mui/icons-material/Build';
import LinkIcon from '@mui/icons-material/Link';
import SeoIcon from '@mui/icons-material/SettingsApplications';
import HelpIcon from '@mui/icons-material/Help';

// Industry options
const INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'education', label: 'Education' },
  { value: 'professional-services', label: 'Professional Services' },
  { value: 'manufacturing', label: 'Manufacturing' },
];

// Status options
const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

// Service area options
const SERVICE_AREA_OPTIONS = [
  { value: 'strategy', label: 'Business Strategy' },
  { value: 'digital-transformation', label: 'Digital Transformation' },
  { value: 'operations', label: 'Operations Excellence' },
  { value: 'technology', label: 'Technology Implementation' },
  { value: 'market-analysis', label: 'Market Analysis' },
];

// Category options
const CATEGORY_OPTIONS = [
  { value: 'success-story', label: 'Success Story' },
  { value: 'implementation', label: 'Implementation' },
  { value: 'innovation', label: 'Innovation' },
  { value: 'transformation', label: 'Transformation' },
  { value: 'optimization', label: 'Optimization' },
];

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`case-study-tabpanel-${index}`}
      aria-labelledby={`case-study-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function CaseStudyEditPage() {
  const router = useRouter();
  const { id } = useParams();
  const isNewCaseStudy = id === 'new';

  // State for page
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // State for notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // State for confirmation dialogs
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  // State for form data
  const [caseStudy, setCaseStudy] = useState({
    title: '',
    summary: '',
    challenge: '',
    solution: '',
    results: '',
    client: {
      name: '',
      logo: '',
      industry: '',
      isAnonymous: false,
      organization: ''
    },
    metrics: [{ name: '', value: '', icon: '' }],
    testimonial: {
      quote: '',
      author: '',
      position: '',
      company: '',
      image: ''
    },
    images: [{ url: '', caption: '', order: 0 }],
    featuredImage: '',
    categories: [] as string[],
    tags: [] as string[],
    project: '',
    publishStatus: 'draft',
    publishedAt: null as string | null,
    technologies: [] as string[],
    serviceAreas: [] as string[],
    team: [{ user: '', role: '' }],
    relatedCaseStudies: [] as string[],
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [] as string[],
      ogImage: ''
    },
    organization: '',
  });

  // State for related data
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [relatedCaseStudies, setRelatedCaseStudies] = useState<any[]>([]);

  // Fetch case study data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch organizations
        const orgResponse = await organizationAPI.getAllOrganizations();
        if (orgResponse.data?.data?.organizations) {
          setOrganizations(orgResponse.data.data.organizations);
        }

        // Fetch users
        const usersResponse = await userAPI.getAllUsers();
        if (usersResponse.data?.data?.users) {
          setUsers(usersResponse.data.data.users);
        }

        // Fetch related case studies for selection
        const caseStudiesResponse = await caseStudyAPI.getAllCaseStudies({
          limit: 100,
          fields: 'title,slug'
        });
        if (caseStudiesResponse.data?.data?.caseStudies) {
          setRelatedCaseStudies(caseStudiesResponse.data.data.caseStudies);
        }

        // If editing, fetch case study
        if (!isNewCaseStudy) {
          const response = await caseStudyAPI.getCaseStudyById(id as string);
          if (response.data?.data?.caseStudy) {
            const data = response.data.data.caseStudy;
            setCaseStudy({
              ...caseStudy,
              ...data,
              seo: data.seo || {
                metaTitle: '',
                metaDescription: '',
                keywords: [],
                ogImage: ''
              }
            });
          } else {
            setError('Case study not found');
          }
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, isNewCaseStudy]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle field changes
  const handleChange = (field: string, value: any) => {
    setCaseStudy({
      ...caseStudy,
      [field]: value
    });
  };

  // Handle nested field changes
  const handleNestedChange = (parent: string, field: string, value: any) => {
    setCaseStudy({
      ...caseStudy,
      [parent]: {
        ...caseStudy[parent as keyof typeof caseStudy],
        [field]: value
      }
    });
  };

  // Handle metrics changes
  const handleMetricChange = (index: number, field: string, value: string) => {
    const updatedMetrics = [...caseStudy.metrics];
    updatedMetrics[index] = {
      ...updatedMetrics[index],
      [field]: value
    };
    setCaseStudy({
      ...caseStudy,
      metrics: updatedMetrics
    });
  };

  // Add metric
  const handleAddMetric = () => {
    setCaseStudy({
      ...caseStudy,
      metrics: [
        ...caseStudy.metrics,
        { name: '', value: '', icon: '' }
      ]
    });
  };

  // Remove metric
  const handleRemoveMetric = (index: number) => {
    const updatedMetrics = [...caseStudy.metrics];
    updatedMetrics.splice(index, 1);
    setCaseStudy({
      ...caseStudy,
      metrics: updatedMetrics
    });
  };

  // Handle images changes
  const handleImageChange = (index: number, field: string, value: string) => {
    const updatedImages = [...caseStudy.images];
    updatedImages[index] = {
      ...updatedImages[index],
      [field]: value
    };
    setCaseStudy({
      ...caseStudy,
      images: updatedImages
    });
  };

  // Add image
  const handleAddImage = () => {
    const newOrder = caseStudy.images.length > 0
      ? Math.max(...caseStudy.images.map(img => img.order)) + 1
      : 0;

    setCaseStudy({
      ...caseStudy,
      images: [
        ...caseStudy.images,
        { url: '', caption: '', order: newOrder }
      ]
    });
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...caseStudy.images];
    updatedImages.splice(index, 1);
    setCaseStudy({
      ...caseStudy,
      images: updatedImages
    });
  };

  // Handle team changes
  const handleTeamChange = (index: number, field: string, value: string) => {
    const updatedTeam = [...caseStudy.team];
    updatedTeam[index] = {
      ...updatedTeam[index],
      [field]: value
    };
    setCaseStudy({
      ...caseStudy,
      team: updatedTeam
    });
  };

  // Add team member
  const handleAddTeamMember = () => {
    setCaseStudy({
      ...caseStudy,
      team: [
        ...caseStudy.team,
        { user: '', role: '' }
      ]
    });
  };

  // Remove team member
  const handleRemoveTeamMember = (index: number) => {
    const updatedTeam = [...caseStudy.team];
    updatedTeam.splice(index, 1);
    setCaseStudy({
      ...caseStudy,
      team: updatedTeam
    });
  };

  // Save case study
  const handleSave = async (andPublish = false) => {
    try {
      setSaving(true);

      // Validation
      if (!caseStudy.title || !caseStudy.summary || !caseStudy.challenge ||
          !caseStudy.solution || !caseStudy.results) {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields.',
          severity: 'error'
        });
        setSaving(false);
        return;
      }

      // Prepare data
      const dataToSave = {
        ...caseStudy,
        // Clean up empty metrics
        metrics: caseStudy.metrics.filter(m => m.name && m.value),
        // Clean up empty images
        images: caseStudy.images.filter(i => i.url),
        // Clean up empty team members
        team: caseStudy.team.filter(t => t.user && t.role),
        // Set status if publishing
        publishStatus: andPublish ? 'published' : caseStudy.publishStatus,
        publishedAt: andPublish ? new Date().toISOString() : caseStudy.publishedAt
      };

      // Create or update
      if (isNewCaseStudy) {
        const response = await caseStudyAPI.createCaseStudy(dataToSave);
        if (response.data?.data?.caseStudy) {
          setSnackbar({
            open: true,
            message: 'Case study created successfully.',
            severity: 'success'
          });

          // Redirect to the edit page of the new case study
          setTimeout(() => {
            router.push(`/dashboard/case-studies/${response.data.data.caseStudy._id}`);
          }, 1500);
        }
      } else {
        await caseStudyAPI.updateCaseStudy(id as string, dataToSave);
        setSnackbar({
          open: true,
          message: 'Case study updated successfully.',
          severity: 'success'
        });
      }

      // Close any open dialogs
      setPublishDialogOpen(false);
    } catch (err) {
      console.error('Error saving case study:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save case study. Please try again.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Handle cancel
  const handleCancel = () => {
    setDiscardDialogOpen(true);
  };

  // Handle discard confirm
  const handleDiscardConfirm = () => {
    setDiscardDialogOpen(false);
    router.push('/dashboard/case-studies');
  };

  // Handle publish
  const handlePublish = () => {
    setPublishDialogOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
          onClick={() => router.push('/dashboard/case-studies')}
        >
          Back to Case Studies
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', p: 3 }}>
        {/* Header with breadcrumbs */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Breadcrumbs sx={{ flexGrow: 1 }}>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/dashboard/case-studies">Case Studies</Link>
            <Typography color="text.primary">
              {isNewCaseStudy ? 'New Case Study' : 'Edit Case Study'}
            </Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleCancel}
            >
              Cancel
            </Button>

            {caseStudy.publishStatus !== 'published' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<VisibilityIcon />}
                onClick={handlePublish}
                disabled={saving}
              >
                Publish
              </Button>
            )}

            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Box>

        {/* Title and main status fields */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <TextField
              label="Case Study Title"
              variant="outlined"
              fullWidth
              required
              value={caseStudy.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                value={caseStudy.publishStatus}
                onChange={(e) => handleChange('publishStatus', e.target.value)}
                label="Status"
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Summary"
              variant="outlined"
              fullWidth
              required
              multiline
              rows={2}
              value={caseStudy.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              helperText="A brief summary of the case study (150-200 characters recommended)"
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="case study tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Content" icon={<FormatQuoteIcon />} iconPosition="start" />
            <Tab label="Client Info" icon={<BusinessIcon />} iconPosition="start" />
            <Tab label="Metrics & Results" icon={<DataUsageIcon />} iconPosition="start" />
            <Tab label="Media" icon={<ImageIcon />} iconPosition="start" />
            <Tab label="Categorization" icon={<CategoryIcon />} iconPosition="start" />
            <Tab label="Team & Tech" icon={<GroupIcon />} iconPosition="start" />
            <Tab label="SEO" icon={<SeoIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Content Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Challenge
              </Typography>
              <RichTextEditor
                value={caseStudy.challenge}
                onChange={(value) => handleChange('challenge', value)}
                placeholder="Describe the challenge or problem the client faced..."
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Solution
              </Typography>
              <RichTextEditor
                value={caseStudy.solution}
                onChange={(value) => handleChange('solution', value)}
                placeholder="Describe the solution provided to address the challenge..."
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Results
              </Typography>
              <RichTextEditor
                value={caseStudy.results}
                onChange={(value) => handleChange('results', value)}
                placeholder="Describe the results and impact of the solution..."
              />
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader title="Testimonial" avatar={<FormatQuoteIcon />} />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Testimonial Quote"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                        value={caseStudy.testimonial.quote}
                        onChange={(e) => handleNestedChange('testimonial', 'quote', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Author Name"
                        variant="outlined"
                        fullWidth
                        value={caseStudy.testimonial.author}
                        onChange={(e) => handleNestedChange('testimonial', 'author', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Position / Title"
                        variant="outlined"
                        fullWidth
                        value={caseStudy.testimonial.position}
                        onChange={(e) => handleNestedChange('testimonial', 'position', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Company"
                        variant="outlined"
                        fullWidth
                        value={caseStudy.testimonial.company}
                        onChange={(e) => handleNestedChange('testimonial', 'company', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Author Image URL"
                        variant="outlined"
                        fullWidth
                        value={caseStudy.testimonial.image}
                        onChange={(e) => handleNestedChange('testimonial', 'image', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Client Info Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card variant="outlined">
                <CardHeader title="Client Information" avatar={<BusinessIcon />} />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        label="Client Name"
                        variant="outlined"
                        fullWidth
                        value={caseStudy.client.name}
                        onChange={(e) => handleNestedChange('client', 'name', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={caseStudy.client.isAnonymous}
                            onChange={(e) => handleNestedChange('client', 'isAnonymous', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Anonymous Client"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="industry-label">Industry</InputLabel>
                        <Select
                          labelId="industry-label"
                          value={caseStudy.client.industry}
                          onChange={(e) => handleNestedChange('client', 'industry', e.target.value)}
                          label="Industry"
                        >
                          {INDUSTRY_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="client-organization-label">Client Organization</InputLabel>
                        <Select
                          labelId="client-organization-label"
                          value={caseStudy.client.organization}
                          onChange={(e) => handleNestedChange('client', 'organization', e.target.value)}
                          label="Client Organization"
                        >
                          <MenuItem value="">None</MenuItem>
                          {organizations.map((org) => (
                            <MenuItem key={org._id} value={org._id}>
                              {org.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Client Logo URL"
                        variant="outlined"
                        fullWidth
                        value={caseStudy.client.logo}
                        onChange={(e) => handleNestedChange('client', 'logo', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="organization-label">Your Organization</InputLabel>
                <Select
                  labelId="organization-label"
                  value={caseStudy.organization}
                  onChange={(e) => handleChange('organization', e.target.value)}
                  label="Your Organization"
                  required
                >
                  {organizations.map((org) => (
                    <MenuItem key={org._id} value={org._id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  The organization responsible for this case study
                </Typography>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Metrics & Results Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Key Metrics
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Add quantifiable results and achievements
          </Typography>

          {caseStudy.metrics.map((metric, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Metric Name"
                  variant="outlined"
                  fullWidth
                  value={metric.name}
                  onChange={(e) => handleMetricChange(index, 'name', e.target.value)}
                  placeholder="e.g., ROI Increase"
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Value"
                  variant="outlined"
                  fullWidth
                  value={metric.value}
                  onChange={(e) => handleMetricChange(index, 'value', e.target.value)}
                  placeholder="e.g., 150%"
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <TextField
                  label="Icon"
                  variant="outlined"
                  fullWidth
                  value={metric.icon}
                  onChange={(e) => handleMetricChange(index, 'icon', e.target.value)}
                  placeholder="Icon name"
                />
              </Grid>
              <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  color="error"
                  onClick={() => handleRemoveMetric(index)}
                  disabled={caseStudy.metrics.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddMetric}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            Add Metric
          </Button>
        </TabPanel>

        {/* Media Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Featured Image
              </Typography>
              <TextField
                label="Featured Image URL"
                variant="outlined"
                fullWidth
                value={caseStudy.featuredImage}
                onChange={(e) => handleChange('featuredImage', e.target.value)}
                helperText="This image will be used as the thumbnail and header"
                InputProps={{
                  endAdornment: caseStudy.featuredImage && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => window.open(caseStudy.featuredImage, '_blank')}>
                        <VisibilityIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              {caseStudy.featuredImage && (
                <Box sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}>
                  <img
                    src={caseStudy.featuredImage}
                    alt="Featured"
                    style={{ width: '100%', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Additional Images
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add screenshots, diagrams, or other visuals to illustrate the case study
              </Typography>

              {caseStudy.images.map((image, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Image URL"
                      variant="outlined"
                      fullWidth
                      value={image.url}
                      onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                      InputProps={{
                        endAdornment: image.url && (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => window.open(image.url, '_blank')}>
                              <VisibilityIcon />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Caption"
                      variant="outlined"
                      fullWidth
                      value={image.caption}
                      onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <TextField
                      label="Order"
                      variant="outlined"
                      fullWidth
                      type="number"
                      value={image.order}
                      onChange={(e) => handleImageChange(index, 'order', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}

              <Button
                startIcon={<AddIcon />}
                onClick={handleAddImage}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Image
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Categorization Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={CATEGORY_OPTIONS.map(option => option.value)}
                getOptionLabel={(option) => CATEGORY_OPTIONS.find(cat => cat.value === option)?.label || option}
                value={caseStudy.categories}
                onChange={(_, newValue) => handleChange('categories', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Categories"
                    placeholder="Select categories"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={CATEGORY_OPTIONS.find(cat => cat.value === option)?.label || option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={SERVICE_AREA_OPTIONS.map(option => option.value)}
                getOptionLabel={(option) => SERVICE_AREA_OPTIONS.find(area => area.value === option)?.label || option}
                value={caseStudy.serviceAreas}
                onChange={(_, newValue) => handleChange('serviceAreas', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Service Areas"
                    placeholder="Select service areas"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={SERVICE_AREA_OPTIONS.find(area => area.value === option)?.label || option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={caseStudy.tags}
                onChange={(_, newValue) => handleChange('tags', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Tags"
                    placeholder="Add tags and press Enter"
                    helperText="Type a tag and press Enter to add it"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option} {...getTagProps({ index })} />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={relatedCaseStudies.filter(cs => cs._id !== id) || []}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.title}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id || option._id === value
                }
                value={caseStudy.relatedCaseStudies.map(id =>
                  relatedCaseStudies.find(cs => cs._id === id) || id
                )}
                onChange={(_, newValue) => handleChange('relatedCaseStudies',
                  newValue.map(val => typeof val === 'string' ? val : val._id)
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Related Case Studies"
                    placeholder="Select related case studies"
                  />
                )}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Team & Technologies Tab */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Team Members
              </Typography>

              {caseStudy.team.map((member, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id={`team-member-${index}-label`}>Team Member</InputLabel>
                      <Select
                        labelId={`team-member-${index}-label`}
                        value={member.user}
                        onChange={(e) => handleTeamChange(index, 'user', e.target.value)}
                        label="Team Member"
                      >
                        {users.map((user) => (
                          <MenuItem key={user._id} value={user._id}>
                            {user.firstName} {user.lastName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      label="Role"
                      variant="outlined"
                      fullWidth
                      value={member.role}
                      onChange={(e) => handleTeamChange(index, 'role', e.target.value)}
                      placeholder="e.g., Project Lead"
                    />
                  </Grid>
                  <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveTeamMember(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}

              <Button
                startIcon={<AddIcon />}
                onClick={handleAddTeamMember}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Team Member
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Technologies Used
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={[
                  'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'MongoDB',
                  'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'Google Cloud',
                  'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'CircleCI',
                  'Python', 'Django', 'Flask', 'Java', 'Spring Boot', '.NET',
                  'GraphQL', 'REST API', 'Microservices', 'Serverless',
                  'Machine Learning', 'AI', 'IoT', 'Blockchain', 'Data Analytics'
                ]}
                value={caseStudy.technologies}
                onChange={(_, newValue) => handleChange('technologies', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Technologies"
                    placeholder="Add technologies used"
                    helperText="Type a technology and press Enter to add it"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      icon={<BuildIcon fontSize="small" />}
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* SEO Tab */}
        <TabPanel value={tabValue} index={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Meta Title"
                variant="outlined"
                fullWidth
                value={caseStudy.seo.metaTitle}
                onChange={(e) => handleNestedChange('seo', 'metaTitle', e.target.value)}
                helperText="Recommended length: 50-60 characters"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Meta Description"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={caseStudy.seo.metaDescription}
                onChange={(e) => handleNestedChange('seo', 'metaDescription', e.target.value)}
                helperText="Recommended length: 150-160 characters"
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={caseStudy.seo.keywords}
                onChange={(_, newValue) => handleNestedChange('seo', 'keywords', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="SEO Keywords"
                    placeholder="Add keywords and press Enter"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      icon={<TagIcon fontSize="small" />}
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Open Graph Image URL"
                variant="outlined"
                fullWidth
                value={caseStudy.seo.ogImage}
                onChange={(e) => handleNestedChange('seo', 'ogImage', e.target.value)}
                helperText="This image will be used when sharing on social media (recommended size: 1200x630)"
                InputProps={{
                  endAdornment: caseStudy.seo.ogImage && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => window.open(caseStudy.seo.ogImage, '_blank')}>
                        <VisibilityIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Bottom action buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>

          {caseStudy.publishStatus !== 'published' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<VisibilityIcon />}
              onClick={handlePublish}
              disabled={saving}
              sx={{ mr: 1 }}
            >
              Publish
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} /> Saving...
              </>
            ) : (
              'Save Case Study'
            )}
          </Button>
        </Box>
      </Paper>

      {/* Confirmation Dialogs */}
      <Dialog
        open={discardDialogOpen}
        onClose={() => setDiscardDialogOpen(false)}
      >
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Any unsaved changes will be lost. Are you sure you want to cancel?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscardDialogOpen(false)}>
            No, Continue Editing
          </Button>
          <Button onClick={handleDiscardConfirm} color="error" autoFocus>
            Yes, Discard Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
      >
        <DialogTitle>Publish Case Study?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This case study will be publicly available. Are you sure you want to publish it now?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => handleSave(true)}
            color="primary"
            variant="contained"
            autoFocus
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <VisibilityIcon />}
          >
            {saving ? 'Publishing...' : 'Yes, Publish'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
