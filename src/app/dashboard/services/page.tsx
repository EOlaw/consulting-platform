'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Pagination from '@mui/material/Pagination';
import { alpha, useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { serviceAPI } from '@/lib/api';

// Import icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BusinessIcon from '@mui/icons-material/Business';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CodeIcon from '@mui/icons-material/Code';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CloudIcon from '@mui/icons-material/Cloud';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SettingsIcon from '@mui/icons-material/Settings';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// Category options
const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'consulting', label: 'Consulting', icon: <BusinessIcon /> },
  { value: 'analytics', label: 'Analytics & BI', icon: <AnalyticsIcon /> },
  { value: 'development', label: 'Software Development', icon: <CodeIcon /> },
  { value: 'strategy', label: 'Strategy', icon: <PsychologyIcon /> },
  { value: 'cloud', label: 'Cloud Services', icon: <CloudIcon /> },
  { value: 'finance', label: 'Financial Advisory', icon: <AccountBalanceIcon /> },
  { value: 'managed-services', label: 'Managed Services', icon: <SettingsIcon /> },
];

// Status options
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

// Pricing options
const PRICING_OPTIONS = [
  { value: 'all', label: 'All Pricing Types' },
  { value: 'fixed', label: 'Fixed Fee' },
  { value: 'tiered', label: 'Tiered Pricing' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'custom', label: 'Custom' },
];

export default function ServicesManagementPage() {
  const theme = useTheme();
  const router = useRouter();

  // State for services
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pricingFilter, setPricingFilter] = useState('all');

  // State for actions
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // State for action menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuService, setMenuService] = useState<string | null>(null);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);

        // Prepare API request params
        const params: any = {
          page,
          limit: 9, // 3x3 grid
        };

        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }

        if (categoryFilter !== 'all') {
          params.category = categoryFilter;
        }

        if (searchQuery) {
          params.search = searchQuery;
        }

        const response = await serviceAPI.getAllServices(params);

        if (response.data?.data?.services) {
          setServices(response.data.data.services);

          if (response.data.data.pagination) {
            setTotalPages(response.data.data.pagination.pages);
            setTotalCount(response.data.data.pagination.total);
          }
        } else {
          setServices([]);
          setTotalPages(1);
          setTotalCount(0);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again.');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [page, categoryFilter, statusFilter, pricingFilter, searchQuery]);

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to first page on search
  };

  // Handle filter changes
  const handleCategoryFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setCategoryFilter(event.target.value as string);
    setPage(1); // Reset to first page on filter change
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatusFilter(event.target.value as string);
    setPage(1); // Reset to first page on filter change
  };

  const handlePricingFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setPricingFilter(event.target.value as string);
    setPage(1); // Reset to first page on filter change
  };

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open action menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, serviceId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuService(serviceId);
  };

  // Close action menu
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuService(null);
  };

  // Handle service edit
  const handleEditService = (serviceId: string) => {
    router.push(`/dashboard/services/${serviceId}`);
    handleMenuClose();
  };

  // Handle service view (in new tab)
  const handleViewService = (service: any) => {
    if (service.slug) {
      window.open(`/services/${service.slug}`, '_blank');
    }
    handleMenuClose();
  };

  // Handle service duplication
  const handleDuplicateService = async (serviceId: string) => {
    try {
      setActionLoading(true);
      const service = services.find(s => s._id === serviceId);

      if (!service) {
        throw new Error('Service not found');
      }

      // Prepare duplicate data (omit unique identifiers)
      const duplicateData = {
        title: `${service.title} (Copy)`,
        shortDescription: service.shortDescription,
        description: service.description,
        icon: service.icon,
        featuredImage: service.featuredImage,
        benefits: service.benefits,
        processSteps: service.processSteps,
        pricingTiers: service.pricingTiers,
        category: service.category,
        tags: service.tags,
        relatedCaseStudies: service.relatedCaseStudies,
        relatedServices: service.relatedServices,
        seo: service.seo,
        status: 'draft',
        organization: service.organization?._id || service.organization,
      };

      const response = await serviceAPI.createService(duplicateData);

      if (response.data?.data?.service) {
        setSnackbar({
          open: true,
          message: 'Service duplicated successfully',
          severity: 'success',
        });

        // Refresh services list
        const refreshResponse = await serviceAPI.getAllServices({
          page,
          limit: 9,
        });

        if (refreshResponse.data?.data?.services) {
          setServices(refreshResponse.data.data.services);
        }
      }
    } catch (err) {
      console.error('Error duplicating service:', err);
      setSnackbar({
        open: true,
        message: 'Failed to duplicate service',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
      handleMenuClose();
    }
  };

  // Open delete dialog
  const handleDeleteDialogOpen = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Close delete dialog
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  // Delete service
  const handleDeleteService = async () => {
    try {
      if (!serviceToDelete) return;

      setActionLoading(true);
      await serviceAPI.deleteService(serviceToDelete);

      setSnackbar({
        open: true,
        message: 'Service deleted successfully',
        severity: 'success',
      });

      // Refresh services list
      const response = await serviceAPI.getAllServices({
        page,
        limit: 9,
      });

      if (response.data?.data?.services) {
        setServices(response.data.data.services);

        if (response.data.data.pagination) {
          setTotalPages(response.data.data.pagination.pages);
          setTotalCount(response.data.data.pagination.total);

          // If we deleted the last item on the last page, go back one page
          if (page > 1 && response.data.data.services.length === 0) {
            setPage(page - 1);
          }
        }
      } else {
        setServices([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Error deleting service:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete service',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
      handleDeleteDialogClose();
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // Format category label
  const getCategoryLabel = (category: string) => {
    const option = CATEGORY_OPTIONS.find(option => option.value === category);
    return option ? option.label : category;
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const option = CATEGORY_OPTIONS.find(option => option.value === category);
    return option ? option.icon : <BusinessIcon />;
  };

  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'default';
      case 'archived':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format price display
  const formatPrice = (pricing: any) => {
    if (!pricing || pricing.length === 0) return 'Custom Pricing';

    const lowestTier = pricing.reduce((prev: any, current: any) =>
      (prev.price < current.price) ? prev : current
    );

    return `From ${lowestTier.currency === 'USD' ? '$' : ''}${lowestTier.price} ${lowestTier.billingCycle ? `/${lowestTier.billingCycle.replace('ly', '')}` : ''}`;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, p: 3 }}>
        {/* Header with filters and actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            Services
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => router.push('/dashboard/services/new')}
            sx={{ ml: 2 }}
          >
            New Service
          </Button>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search services..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl variant="outlined" size="small" fullWidth>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
                label="Category"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.value !== 'all' && (
                      <Box component="span" sx={{ mr: 1, display: 'inline-flex', alignItems: 'center' }}>
                        {React.cloneElement(option.icon as React.ReactElement, {
                          fontSize: 'small',
                          sx: { mr: 1 }
                        })}
                      </Box>
                    )}
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl variant="outlined" size="small" fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
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

          <Grid item xs={12} md={3}>
            <FormControl variant="outlined" size="small" fullWidth>
              <InputLabel id="pricing-filter-label">Pricing Type</InputLabel>
              <Select
                labelId="pricing-filter-label"
                id="pricing-filter"
                value={pricingFilter}
                onChange={handlePricingFilterChange}
                label="Pricing Type"
              >
                {PRICING_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Results count */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Loading...' : `${totalCount} service${totalCount === 1 ? '' : 's'} found`}
          </Typography>
        </Box>

        {/* Services grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : services.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>
              No services found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || pricingFilter !== 'all'
                ? 'Try adjusting your search criteria or filters'
                : 'Get started by creating your first service'}
            </Typography>
            {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || pricingFilter !== 'all' ? (
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                  setPricingFilter('all');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => router.push('/dashboard/services/new')}
              >
                Create Service
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height={180}
                      image={service.featuredImage || 'https://source.unsplash.com/random?business'}
                      alt={service.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        display: 'flex',
                        gap: 1
                      }}
                    >
                      <Chip
                        size="small"
                        label={service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                        color={getStatusColor(service.status) as any}
                      />
                    </Box>
                    {service.category && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          bgcolor: alpha('#000', 0.7),
                          borderRadius: 4,
                          p: 0.5,
                          px: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <Box sx={{ color: 'white' }}>
                          {getCategoryIcon(service.category)}
                        </Box>
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 'medium' }}>
                          {getCategoryLabel(service.category)}
                        </Typography>
                      </Box>
                    )}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        m: 1
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuOpen(event, service._id)}
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 1)',
                          }
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {service.shortDescription?.substring(0, 100)}
                      {service.shortDescription?.length > 100 ? '...' : ''}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <AttachMoneyIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {service.pricingTiers && formatPrice(service.pricingTiers)}
                      </Typography>
                    </Box>

                    {service.tags && service.tags.length > 0 && (
                      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {service.tags.slice(0, 3).map((tag: string, idx: number) => (
                          <Chip
                            key={idx}
                            size="small"
                            label={tag}
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ pt: 1, pb: 1 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditService(service._id)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewService(service)}
                    >
                      View
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 1,
          sx: {
            minWidth: 180,
            boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
          },
        }}
      >
        <MenuItem onClick={() => menuService && handleViewService(services.find(s => s._id === menuService))}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1.5 }} />
          View Service
        </MenuItem>
        <MenuItem onClick={() => menuService && handleEditService(menuService)}>
          <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
          Edit Service
        </MenuItem>
        <MenuItem onClick={() => menuService && handleDuplicateService(menuService)}>
          <ContentCopyIcon fontSize="small" sx={{ mr: 1.5 }} />
          Duplicate
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => menuService && handleDeleteDialogOpen(menuService)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
          <Typography color="error">Delete Service</Typography>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete Service
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this service? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteService}
            color="error"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
            autoFocus
          >
            Delete
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
