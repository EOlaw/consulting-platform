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
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Link from 'next/link';
import { serviceAPI, organizationAPI, caseStudyAPI } from '@/lib/api';

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
import MoneyIcon from '@mui/icons-material/Money';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TimelineIcon from '@mui/icons-material/Timeline';
import ImageIcon from '@mui/icons-material/Image';
import TagIcon from '@mui/icons-material/Tag';
import CategoryIcon from '@mui/icons-material/Category';
import LinkIcon from '@mui/icons-material/Link';
import SeoIcon from '@mui/icons-material/SettingsApplications';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import StarIcon from '@mui/icons-material/Star';

// Category options
const CATEGORY_OPTIONS = [
  { value: 'consulting', label: 'Consulting' },
  { value: 'analytics', label: 'Analytics & BI' },
  { value: 'development', label: 'Software Development' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'cloud', label: 'Cloud Services' },
  { value: 'finance', label: 'Financial Advisory' },
  { value: 'managed-services', label: 'Managed Services' },
];

// Status options
const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

// Billing cycle options
const BILLING_CYCLE_OPTIONS = [
  { value: 'one-time', label: 'One-time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

// Currency options
const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
];

// Icon options for benefits and process steps
const ICON_OPTIONS = [
  { value: 'CheckCircle', label: 'Check Circle' },
  { value: 'Star', label: 'Star' },
  { value: 'Lightbulb', label: 'Lightbulb' },
  { value: 'Speed', label: 'Speed' },
  { value: 'Security', label: 'Security' },
  { value: 'Support', label: 'Support' },
  { value: 'VerifiedUser', label: 'Verified User' },
  { value: 'Bolt', label: 'Bolt' },
  { value: 'Analytics', label: 'Analytics' },
  { value: 'Cloud', label: 'Cloud' },
  { value: 'Code', label: 'Code' },
  { value: 'Settings', label: 'Settings' },
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
      id={`service-tabpanel-${index}`}
      aria-labelledby={`service-tab-${index}`}
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

export default function ServiceEditPage() {
  const router = useRouter();
  const { id } = useParams();
  const isNewService = id === 'new';

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
  const [service, setService] = useState({
    title: '',
    shortDescription: '',
    description: '',
    icon: '',
    featuredImage: '',
    benefits: [{ title: '', description: '', icon: '' }],
    processSteps: [{ title: '', description: '', icon: '', order: 1 }],
    pricingTiers: [{
      name: '',
      price: 0,
      currency: 'USD',
      billingCycle: 'monthly',
      description: '',
      features: [''],
      isPopular: false
    }],
    category: '',
    tags: [] as string[],
    relatedCaseStudies: [] as string[],
    relatedServices: [] as string[],
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [] as string[],
      ogImage: ''
    },
    status: 'draft',
    organization: '',
  });

  // State for related data
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [relatedServices, setRelatedServices] = useState<any[]>([]);

  // Fetch service data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch organizations
        const orgResponse = await organizationAPI.getAllOrganizations();
        if (orgResponse.data?.data?.organizations) {
          setOrganizations(orgResponse.data.data.organizations);
        }

        // Fetch case studies for selection
        const caseStudiesResponse = await caseStudyAPI.getAllCaseStudies({
          limit: 100,
          fields: 'title,slug'
        });
        if (caseStudiesResponse.data?.data?.caseStudies) {
          setCaseStudies(caseStudiesResponse.data.data.caseStudies);
        }

        // Fetch related services for selection
        const servicesResponse = await serviceAPI.getAllServices({
          limit: 100,
          fields: 'title,slug'
        });
        if (servicesResponse.data?.data?.services) {
          setRelatedServices(servicesResponse.data.data.services);
        }

        // If editing, fetch service
        if (!isNewService) {
          const response = await serviceAPI.getServiceById(id as string);
          if (response.data?.data?.service) {
            const data = response.data.data.service;
            setService({
              ...service,
              ...data,
              seo: data.seo || {
                metaTitle: '',
                metaDescription: '',
                keywords: [],
                ogImage: ''
              }
            });
          } else {
            setError('Service not found');
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
  }, [id, isNewService]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle field changes
  const handleChange = (field: string, value: any) => {
    setService({
      ...service,
      [field]: value
    });
  };

  // Handle nested field changes
  const handleNestedChange = (parent: string, field: string, value: any) => {
    setService({
      ...service,
      [parent]: {
        ...service[parent as keyof typeof service],
        [field]: value
      }
    });
  };

  // Handle benefits changes
  const handleBenefitChange = (index: number, field: string, value: string) => {
    const updatedBenefits = [...service.benefits];
    updatedBenefits[index] = {
      ...updatedBenefits[index],
      [field]: value
    };
    setService({
      ...service,
      benefits: updatedBenefits
    });
  };

  // Add benefit
  const handleAddBenefit = () => {
    setService({
      ...service,
      benefits: [
        ...service.benefits,
        { title: '', description: '', icon: '' }
      ]
    });
  };

  // Remove benefit
  const handleRemoveBenefit = (index: number) => {
    const updatedBenefits = [...service.benefits];
    updatedBenefits.splice(index, 1);
    setService({
      ...service,
      benefits: updatedBenefits
    });
  };

  // Handle process steps changes
  const handleProcessStepChange = (index: number, field: string, value: any) => {
    const updatedProcessSteps = [...service.processSteps];
    updatedProcessSteps[index] = {
      ...updatedProcessSteps[index],
      [field]: value
    };
    setService({
      ...service,
      processSteps: updatedProcessSteps
    });
  };

  // Add process step
  const handleAddProcessStep = () => {
    const newOrder = service.processSteps.length > 0
      ? Math.max(...service.processSteps.map(step => step.order)) + 1
      : 1;

    setService({
      ...service,
      processSteps: [
        ...service.processSteps,
        { title: '', description: '', icon: '', order: newOrder }
      ]
    });
  };

  // Remove process step
  const handleRemoveProcessStep = (index: number) => {
    const updatedProcessSteps = [...service.processSteps];
    updatedProcessSteps.splice(index, 1);
    setService({
      ...service,
      processSteps: updatedProcessSteps
    });
  };

  // Handle pricing tier changes
  const handlePricingTierChange = (index: number, field: string, value: any) => {
    const updatedPricingTiers = [...service.pricingTiers];
    updatedPricingTiers[index] = {
      ...updatedPricingTiers[index],
      [field]: value
    };
    setService({
      ...service,
      pricingTiers: updatedPricingTiers
    });
  };

  // Handle pricing tier feature changes
  const handlePricingFeatureChange = (tierIndex: number, featureIndex: number, value: string) => {
    const updatedPricingTiers = [...service.pricingTiers];
    const updatedFeatures = [...updatedPricingTiers[tierIndex].features];
    updatedFeatures[featureIndex] = value;

    updatedPricingTiers[tierIndex] = {
      ...updatedPricingTiers[tierIndex],
      features: updatedFeatures
    };

    setService({
      ...service,
      pricingTiers: updatedPricingTiers
    });
  };

  // Add pricing feature
  const handleAddPricingFeature = (tierIndex: number) => {
    const updatedPricingTiers = [...service.pricingTiers];
    updatedPricingTiers[tierIndex] = {
      ...updatedPricingTiers[tierIndex],
      features: [
        ...updatedPricingTiers[tierIndex].features,
        ''
      ]
    };

    setService({
      ...service,
      pricingTiers: updatedPricingTiers
    });
  };

  // Remove pricing feature
  const handleRemovePricingFeature = (tierIndex: number, featureIndex: number) => {
    const updatedPricingTiers = [...service.pricingTiers];
    const updatedFeatures = [...updatedPricingTiers[tierIndex].features];
    updatedFeatures.splice(featureIndex, 1);

    updatedPricingTiers[tierIndex] = {
      ...updatedPricingTiers[tierIndex],
      features: updatedFeatures
    };

    setService({
      ...service,
      pricingTiers: updatedPricingTiers
    });
  };

  // Add pricing tier
  const handleAddPricingTier = () => {
    setService({
      ...service,
      pricingTiers: [
        ...service.pricingTiers,
        {
          name: '',
          price: 0,
          currency: 'USD',
          billingCycle: 'monthly',
          description: '',
          features: [''],
          isPopular: false
        }
      ]
    });
  };

  // Remove pricing tier
  const handleRemovePricingTier = (index: number) => {
    const updatedPricingTiers = [...service.pricingTiers];
    updatedPricingTiers.splice(index, 1);
    setService({
      ...service,
      pricingTiers: updatedPricingTiers
    });
  };

  // Save service
  const handleSave = async (andPublish = false) => {
    try {
      setSaving(true);

      // Validation
      if (!service.title || !service.shortDescription || !service.description ||
          !service.category || !service.organization) {
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
        ...service,
        // Clean up empty benefits
        benefits: service.benefits.filter(b => b.title && b.description),
        // Clean up empty process steps
        processSteps: service.processSteps.filter(p => p.title && p.description),
        // Clean up empty pricing tiers
        pricingTiers: service.pricingTiers.filter(p => p.name),
        // Set status if publishing
        status: andPublish ? 'published' : service.status,
      };

      // Create or update
      if (isNewService) {
        const response = await serviceAPI.createService(dataToSave);
        if (response.data?.data?.service) {
          setSnackbar({
            open: true,
            message: 'Service created successfully.',
            severity: 'success'
          });

          // Redirect to the edit page of the new service
          setTimeout(() => {
            router.push(`/dashboard/services/${response.data.data.service._id}`);
          }, 1500);
        }
      } else {
        await serviceAPI.updateService(id as string, dataToSave);
        setSnackbar({
          open: true,
          message: 'Service updated successfully.',
          severity: 'success'
        });
      }

      // Close any open dialogs
      setPublishDialogOpen(false);
    } catch (err) {
      console.error('Error saving service:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save service. Please try again.',
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
    router.push('/dashboard/services');
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
          onClick={() => router.push('/dashboard/services')}
        >
          Back to Services
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
            <Link href="/dashboard/services">Services</Link>
            <Typography color="text.primary">
              {isNewService ? 'New Service' : 'Edit Service'}
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

            {service.status !== 'published' && (
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
              label="Service Title"
              variant="outlined"
              fullWidth
              required
              value={service.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                value={service.status}
                onChange={(e) => handleChange('status', e.target.value)}
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
              label="Short Description"
              variant="outlined"
              fullWidth
              required
              multiline
              rows={2}
              value={service.shortDescription}
              onChange={(e) => handleChange('shortDescription', e.target.value)}
              helperText="A brief summary of the service (max 200 characters)"
              inputProps={{ maxLength: 200 }}
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="service tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Details" icon={<DescriptionIcon />} iconPosition="start" />
            <Tab label="Benefits" icon={<CheckCircleIcon />} iconPosition="start" />
            <Tab label="Process" icon={<TimelineIcon />} iconPosition="start" />
            <Tab label="Pricing" icon={<MoneyIcon />} iconPosition="start" />
            <Tab label="Media" icon={<ImageIcon />} iconPosition="start" />
            <Tab label="Categorization" icon={<CategoryIcon />} iconPosition="start" />
            <Tab label="Related Content" icon={<LinkIcon />} iconPosition="start" />
            <Tab label="SEO" icon={<SeoIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Details Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Full Description
              </Typography>
              <RichTextEditor
                value={service.description}
                onChange={(value) => handleChange('description', value)}
                placeholder="Provide a comprehensive description of the service..."
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardHeader title="Basic Settings" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                          labelId="category-label"
                          value={service.category}
                          onChange={(e) => handleChange('category', e.target.value)}
                          label="Category"
                          required
                        >
                          {CATEGORY_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Icon Name"
                        variant="outlined"
                        fullWidth
                        required
                        value={service.icon}
                        onChange={(e) => handleChange('icon', e.target.value)}
                        helperText="Material UI icon name, e.g., 'BusinessCenter'"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="organization-label">Organization</InputLabel>
                        <Select
                          labelId="organization-label"
                          value={service.organization}
                          onChange={(e) => handleChange('organization', e.target.value)}
                          label="Organization"
                          required
                        >
                          {organizations.map((org) => (
                            <MenuItem key={org._id} value={org._id}>
                              {org.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Benefits Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Service Benefits
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            List the key benefits or advantages of this service
          </Typography>

          {service.benefits.map((benefit, index) => (
            <Card variant="outlined" key={index} sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="Benefit Title"
                      variant="outlined"
                      fullWidth
                      required
                      value={benefit.title}
                      onChange={(e) => handleBenefitChange(index, 'title', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id={`benefit-icon-label-${index}`}>Icon</InputLabel>
                      <Select
                        labelId={`benefit-icon-label-${index}`}
                        value={benefit.icon}
                        onChange={(e) => handleBenefitChange(index, 'icon', e.target.value)}
                        label="Icon"
                      >
                        {ICON_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveBenefit(index)}
                      disabled={service.benefits.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Benefit Description"
                      variant="outlined"
                      fullWidth
                      required
                      multiline
                      rows={2}
                      value={benefit.description}
                      onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddBenefit}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            Add Benefit
          </Button>
        </TabPanel>

        {/* Process Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Service Process Steps
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Describe the process or methodology used to deliver this service
          </Typography>

          {service.processSteps.map((step, index) => (
            <Card variant="outlined" key={index} sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={7}>
                    <TextField
                      label="Step Title"
                      variant="outlined"
                      fullWidth
                      required
                      value={step.title}
                      onChange={(e) => handleProcessStepChange(index, 'title', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id={`step-icon-label-${index}`}>Icon</InputLabel>
                      <Select
                        labelId={`step-icon-label-${index}`}
                        value={step.icon}
                        onChange={(e) => handleProcessStepChange(index, 'icon', e.target.value)}
                        label="Icon"
                      >
                        {ICON_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="Order"
                      variant="outlined"
                      fullWidth
                      type="number"
                      required
                      value={step.order}
                      onChange={(e) => handleProcessStepChange(index, 'order', parseInt(e.target.value))}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveProcessStep(index)}
                      disabled={service.processSteps.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Step Description"
                      variant="outlined"
                      fullWidth
                      required
                      multiline
                      rows={2}
                      value={step.description}
                      onChange={(e) => handleProcessStepChange(index, 'description', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddProcessStep}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            Add Process Step
          </Button>
        </TabPanel>

        {/* Pricing Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Pricing Tiers
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Define different pricing options for this service
          </Typography>

          {service.pricingTiers.map((tier, tierIndex) => (
            <Card variant="outlined" key={tierIndex} sx={{ mb: 4 }}>
              <CardHeader
                title={tier.name || 'New Pricing Tier'}
                action={
                  <IconButton
                    color="error"
                    onClick={() => handleRemovePricingTier(tierIndex)}
                    disabled={service.pricingTiers.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Tier Name"
                      variant="outlined"
                      fullWidth
                      required
                      value={tier.name}
                      onChange={(e) => handlePricingTierChange(tierIndex, 'name', e.target.value)}
                      placeholder="e.g., Basic, Standard, Premium"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={tier.isPopular}
                          onChange={(e) => handlePricingTierChange(tierIndex, 'isPopular', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Mark as Popular"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Price"
                      variant="outlined"
                      fullWidth
                      required
                      type="number"
                      value={tier.price}
                      onChange={(e) => handlePricingTierChange(tierIndex, 'price', parseFloat(e.target.value))}
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id={`tier-currency-label-${tierIndex}`}>Currency</InputLabel>
                      <Select
                        labelId={`tier-currency-label-${tierIndex}`}
                        value={tier.currency}
                        onChange={(e) => handlePricingTierChange(tierIndex, 'currency', e.target.value)}
                        label="Currency"
                      >
                        {CURRENCY_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id={`tier-billing-label-${tierIndex}`}>Billing Cycle</InputLabel>
                      <Select
                        labelId={`tier-billing-label-${tierIndex}`}
                        value={tier.billingCycle}
                        onChange={(e) => handlePricingTierChange(tierIndex, 'billingCycle', e.target.value)}
                        label="Billing Cycle"
                      >
                        {BILLING_CYCLE_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Tier Description"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={2}
                      value={tier.description}
                      onChange={(e) => handlePricingTierChange(tierIndex, 'description', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Features
                    </Typography>

                    {tier.features.map((feature, featureIndex) => (
                      <Box key={featureIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TextField
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={feature}
                          onChange={(e) => handlePricingFeatureChange(tierIndex, featureIndex, e.target.value)}
                          placeholder="e.g., 24/7 Support"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CheckCircleIcon fontSize="small" color="primary" />
                              </InputAdornment>
                            )
                          }}
                        />
                        <IconButton
                          color="error"
                          onClick={() => handleRemovePricingFeature(tierIndex, featureIndex)}
                          disabled={tier.features.length === 1}
                          size="small"
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}

                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => handleAddPricingFeature(tierIndex)}
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Add Feature
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddPricingTier}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            Add Pricing Tier
          </Button>
        </TabPanel>

        {/* Media Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Featured Image
              </Typography>
              <TextField
                label="Featured Image URL"
                variant="outlined"
                fullWidth
                required
                value={service.featuredImage}
                onChange={(e) => handleChange('featuredImage', e.target.value)}
                helperText="This image will be used as the thumbnail and header"
                InputProps={{
                  endAdornment: service.featuredImage && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => window.open(service.featuredImage, '_blank')}>
                        <VisibilityIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              {service.featuredImage && (
                <Box sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}>
                  <img
                    src={service.featuredImage}
                    alt="Featured"
                    style={{ width: '100%', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Categorization Tab */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="category-label">Service Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={service.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  label="Service Category"
                  required
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={service.tags}
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
          </Grid>
        </TabPanel>

        {/* Related Content Tab */}
        <TabPanel value={tabValue} index={6}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Related Case Studies
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select case studies that demonstrate this service in action
              </Typography>

              <Autocomplete
                multiple
                options={caseStudies || []}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.title}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id || option._id === value
                }
                value={service.relatedCaseStudies.map(id =>
                  caseStudies.find(cs => cs._id === id) || id
                )}
                onChange={(_, newValue) => handleChange('relatedCaseStudies',
                  newValue.map(val => typeof val === 'string' ? val : val._id)
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Related Case Studies"
                    placeholder="Select case studies"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Related Services
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select other services that complement this one
              </Typography>

              <Autocomplete
                multiple
                options={relatedServices.filter(s => s._id !== id) || []}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.title}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id || option._id === value
                }
                value={service.relatedServices.map(id =>
                  relatedServices.find(s => s._id === id) || id
                )}
                onChange={(_, newValue) => handleChange('relatedServices',
                  newValue.map(val => typeof val === 'string' ? val : val._id)
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Related Services"
                    placeholder="Select related services"
                  />
                )}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* SEO Tab */}
        <TabPanel value={tabValue} index={7}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Meta Title"
                variant="outlined"
                fullWidth
                value={service.seo.metaTitle}
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
                value={service.seo.metaDescription}
                onChange={(e) => handleNestedChange('seo', 'metaDescription', e.target.value)}
                helperText="Recommended length: 150-160 characters"
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={service.seo.keywords}
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
                value={service.seo.ogImage}
                onChange={(e) => handleNestedChange('seo', 'ogImage', e.target.value)}
                helperText="This image will be used when sharing on social media (recommended size: 1200x630)"
                InputProps={{
                  endAdornment: service.seo.ogImage && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => window.open(service.seo.ogImage, '_blank')}>
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

          {service.status !== 'published' && (
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
              'Save Service'
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
        <DialogTitle>Publish Service?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This service will be publicly available. Are you sure you want to publish it now?
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
