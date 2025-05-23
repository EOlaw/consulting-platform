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
import { caseStudyAPI } from '@/lib/api';

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
import DevicesIcon from '@mui/icons-material/Devices';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import SchoolIcon from '@mui/icons-material/School';
import FactoryIcon from '@mui/icons-material/Factory';

// Industry options
const INDUSTRY_OPTIONS = [
  { value: 'all', label: 'All Industries' },
  { value: 'technology', label: 'Technology', icon: <DevicesIcon /> },
  { value: 'finance', label: 'Finance & Banking', icon: <AccountBalanceIcon /> },
  { value: 'healthcare', label: 'Healthcare', icon: <LocalHospitalIcon /> },
  { value: 'retail', label: 'Retail & E-commerce', icon: <ShoppingBasketIcon /> },
  { value: 'education', label: 'Education', icon: <SchoolIcon /> },
  { value: 'professional-services', label: 'Professional Services', icon: <BusinessIcon /> },
  { value: 'manufacturing', label: 'Manufacturing', icon: <FactoryIcon /> },
];

// Status options
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

// Service areas options
const SERVICE_AREA_OPTIONS = [
  { value: 'all', label: 'All Service Areas' },
  { value: 'strategy', label: 'Business Strategy' },
  { value: 'digital-transformation', label: 'Digital Transformation' },
  { value: 'operations', label: 'Operations Excellence' },
  { value: 'technology', label: 'Technology Implementation' },
  { value: 'market-analysis', label: 'Market Analysis' },
];

export default function CaseStudiesManagementPage() {
  const theme = useTheme();
  const router = useRouter();

  // State for case studies
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceAreaFilter, setServiceAreaFilter] = useState('all');

  // State for actions
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [caseStudyToDelete, setCaseStudyToDelete] = useState<string | null>(null);
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
  const [menuCaseStudy, setMenuCaseStudy] = useState<string | null>(null);

  // Fetch case studies from API
  useEffect(() => {
    const fetchCaseStudies = async () => {
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

        if (industryFilter !== 'all') {
          params.industry = industryFilter;
        }

        if (serviceAreaFilter !== 'all') {
          params.serviceArea = serviceAreaFilter;
        }

        if (searchQuery) {
          params.search = searchQuery;
        }

        const response = await caseStudyAPI.getAllCaseStudies(params);

        if (response.data?.data?.caseStudies) {
          setCaseStudies(response.data.data.caseStudies);

          if (response.data.data.pagination) {
            setTotalPages(response.data.data.pagination.pages);
            setTotalCount(response.data.data.pagination.total);
          }
        } else {
          setCaseStudies([]);
          setTotalPages(1);
          setTotalCount(0);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching case studies:', err);
        setError('Failed to load case studies. Please try again.');
        setCaseStudies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseStudies();
  }, [page, industryFilter, statusFilter, serviceAreaFilter, searchQuery]);

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to first page on search
  };

  // Handle filter changes
  const handleIndustryFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setIndustryFilter(event.target.value as string);
    setPage(1); // Reset to first page on filter change
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatusFilter(event.target.value as string);
    setPage(1); // Reset to first page on filter change
  };

  const handleServiceAreaFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setServiceAreaFilter(event.target.value as string);
    setPage(1); // Reset to first page on filter change
  };

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open action menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, caseStudyId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuCaseStudy(caseStudyId);
  };

  // Close action menu
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCaseStudy(null);
  };

  // Handle case study edit
  const handleEditCaseStudy = (caseStudyId: string) => {
    router.push(`/dashboard/case-studies/${caseStudyId}`);
    handleMenuClose();
  };

  // Handle case study view (in new tab)
  const handleViewCaseStudy = (caseStudy: any) => {
    if (caseStudy.slug) {
      window.open(`/case-studies/${caseStudy.slug}`, '_blank');
    }
    handleMenuClose();
  };

  // Handle case study duplication
  const handleDuplicateCaseStudy = async (caseStudyId: string) => {
    try {
      setActionLoading(true);
      const caseStudy = caseStudies.find(cs => cs._id === caseStudyId);

      if (!caseStudy) {
        throw new Error('Case study not found');
      }

      // Prepare duplicate data (omit unique identifiers)
      const duplicateData = {
        title: `${caseStudy.title} (Copy)`,
        summary: caseStudy.summary,
        challenge: caseStudy.challenge,
        solution: caseStudy.solution,
        results: caseStudy.results,
        client: caseStudy.client,
        metrics: caseStudy.metrics,
        testimonial: caseStudy.testimonial,
        images: caseStudy.images,
        featuredImage: caseStudy.featuredImage,
        categories: caseStudy.categories,
        tags: caseStudy.tags,
        publishStatus: 'draft',
        serviceAreas: caseStudy.serviceAreas,
        technologies: caseStudy.technologies,
        team: caseStudy.team,
        organization: caseStudy.organization?._id,
      };

      const response = await caseStudyAPI.createCaseStudy(duplicateData);

      if (response.data?.data?.caseStudy) {
        setSnackbar({
          open: true,
          message: 'Case study duplicated successfully',
          severity: 'success',
        });

        // Refresh case studies list
        const refreshResponse = await caseStudyAPI.getAllCaseStudies({
          page,
          limit: 9,
        });

        if (refreshResponse.data?.data?.caseStudies) {
          setCaseStudies(refreshResponse.data.data.caseStudies);
        }
      }
    } catch (err) {
      console.error('Error duplicating case study:', err);
      setSnackbar({
        open: true,
        message: 'Failed to duplicate case study',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
      handleMenuClose();
    }
  };

  // Open delete dialog
  const handleDeleteDialogOpen = (caseStudyId: string) => {
    setCaseStudyToDelete(caseStudyId);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Close delete dialog
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setCaseStudyToDelete(null);
  };

  // Delete case study
  const handleDeleteCaseStudy = async () => {
    try {
      if (!caseStudyToDelete) return;

      setActionLoading(true);
      await caseStudyAPI.deleteCaseStudy(caseStudyToDelete);

      setSnackbar({
        open: true,
        message: 'Case study deleted successfully',
        severity: 'success',
      });

      // Refresh case studies list
      const response = await caseStudyAPI.getAllCaseStudies({
        page,
        limit: 9,
      });

      if (response.data?.data?.caseStudies) {
        setCaseStudies(response.data.data.caseStudies);

        if (response.data.data.pagination) {
          setTotalPages(response.data.data.pagination.pages);
          setTotalCount(response.data.data.pagination.total);

          // If we deleted the last item on the last page, go back one page
          if (page > 1 && response.data.data.caseStudies.length === 0) {
            setPage(page - 1);
          }
        }
      } else {
        setCaseStudies([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Error deleting case study:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete case study',
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

  // Format industry label
  const getIndustryLabel = (industry: string) => {
    const option = INDUSTRY_OPTIONS.find(option => option.value === industry);
    return option ? option.label : industry;
  };

  // Get industry icon
  const getIndustryIcon = (industry: string) => {
    const option = INDUSTRY_OPTIONS.find(option => option.value === industry);
    return option ? option.icon : <BusinessIcon />;
  };

  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'default';
      case 'review':
        return 'primary';
      case 'archived':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, p: 3 }}>
        {/* Header with filters and actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            Case Studies
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => router.push('/dashboard/case-studies/new')}
            sx={{ ml: 2 }}
          >
            New Case Study
          </Button>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search case studies..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl variant="outlined" size="small" fullWidth>
              <InputLabel id="industry-filter-label">Industry</InputLabel>
              <Select
                labelId="industry-filter-label"
                id="industry-filter"
                value={industryFilter}
                onChange={handleIndustryFilterChange}
                label="Industry"
              >
                {INDUSTRY_OPTIONS.map((option) => (
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
              <InputLabel id="service-area-filter-label">Service Area</InputLabel>
              <Select
                labelId="service-area-filter-label"
                id="service-area-filter"
                value={serviceAreaFilter}
                onChange={handleServiceAreaFilterChange}
                label="Service Area"
              >
                {SERVICE_AREA_OPTIONS.map((option) => (
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
            {loading ? 'Loading...' : `${totalCount} case ${totalCount === 1 ? 'study' : 'studies'} found`}
          </Typography>
        </Box>

        {/* Case studies grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : caseStudies.length === 0 ? (
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
              No case studies found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {searchQuery || industryFilter !== 'all' || statusFilter !== 'all' || serviceAreaFilter !== 'all'
                ? 'Try adjusting your search criteria or filters'
                : 'Get started by creating your first case study'}
            </Typography>
            {searchQuery || industryFilter !== 'all' || statusFilter !== 'all' || serviceAreaFilter !== 'all' ? (
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchQuery('');
                  setIndustryFilter('all');
                  setStatusFilter('all');
                  setServiceAreaFilter('all');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => router.push('/dashboard/case-studies/new')}
              >
                Create Case Study
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {caseStudies.map((caseStudy) => (
              <Grid item xs={12} sm={6} md={4} key={caseStudy._id}>
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
                      height={200}
                      image={caseStudy.featuredImage || 'https://source.unsplash.com/random?business'}
                      alt={caseStudy.title}
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
                        label={caseStudy.publishStatus.charAt(0).toUpperCase() + caseStudy.publishStatus.slice(1)}
                        color={getStatusColor(caseStudy.publishStatus) as any}
                      />
                    </Box>
                    {caseStudy.client && caseStudy.client.industry && (
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
                          {getIndustryIcon(caseStudy.client.industry)}
                        </Box>
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 'medium' }}>
                          {getIndustryLabel(caseStudy.client.industry)}
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
                        onClick={(event) => handleMenuOpen(event, caseStudy._id)}
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
                      {caseStudy.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {caseStudy.summary?.substring(0, 120)}
                      {caseStudy.summary?.length > 120 ? '...' : ''}
                    </Typography>

                    {caseStudy.serviceAreas && caseStudy.serviceAreas.length > 0 && (
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {caseStudy.serviceAreas.slice(0, 3).map((area: string, idx: number) => (
                          <Chip
                            key={idx}
                            size="small"
                            label={area.split('-').map(word =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
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
                      onClick={() => handleEditCaseStudy(caseStudy._id)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewCaseStudy(caseStudy)}
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
        <MenuItem onClick={() => menuCaseStudy && handleViewCaseStudy(caseStudies.find(cs => cs._id === menuCaseStudy))}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1.5 }} />
          View Case Study
        </MenuItem>
        <MenuItem onClick={() => menuCaseStudy && handleEditCaseStudy(menuCaseStudy)}>
          <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
          Edit Case Study
        </MenuItem>
        <MenuItem onClick={() => menuCaseStudy && handleDuplicateCaseStudy(menuCaseStudy)}>
          <ContentCopyIcon fontSize="small" sx={{ mr: 1.5 }} />
          Duplicate
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => menuCaseStudy && handleDeleteDialogOpen(menuCaseStudy)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
          <Typography color="error">Delete Case Study</Typography>
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
          Delete Case Study
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this case study? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteCaseStudy}
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
