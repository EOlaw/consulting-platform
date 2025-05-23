'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Avatar,
  Checkbox,
  Menu,
  ListItemIcon,
  ListItemText,
  Collapse,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Divider,
  Stack,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  GetApp as ExportIcon,
  CloudUpload as ImportIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  AssignmentTurnedIn as ProjectIcon,
  WorkOutline as CaseStudyIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  Link as LinkIcon,
  Public as WebsiteIcon,
  Person as PersonIcon,
  School as IndustryIcon,
  CalendarToday as FoundedIcon,
  DeleteSweep as BulkDeleteIcon,
  ImportExport as ExportImportIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/Layout';
import { organizationAPI, userAPI } from '@/lib/api';

// Organization type definition
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
    city?: string;
    country?: string;
  };
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  members: Array<{
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    role: string;
  }>;
  active: boolean;
  subscription: {
    plan: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

// CSV export function
const exportToCSV = (organizations: Organization[]) => {
  // Define headers
  const headers = ['Name', 'Industry', 'Size', 'Owner', 'Members', 'Subscription Plan', 'Status'];

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...organizations.map(org => [
      org.name,
      org.industry || '',
      org.size || '',
      org.owner ? `${org.owner.firstName} ${org.owner.lastName}` : '',
      org.members ? org.members.length.toString() : '0',
      org.subscription?.plan || 'free',
      org.active ? 'Active' : 'Inactive'
    ].join(','))
  ].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'organizations.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function OrganizationManagement() {
  const router = useRouter();

  // State
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalOrganizations, setTotalOrganizations] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    size: '',
    website: '',
    founded: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterSize, setFilterSize] = useState('');
  const [filterSubscription, setFilterSubscription] = useState('');
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [organizationStats, setOrganizationStats] = useState({
    total: 0,
    active: 0,
    enterprise: 0,
    professional: 0,
    basic: 0,
    free: 0
  });
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [availableOwners, setAvailableOwners] = useState<Array<any>>([]);

  // Fetch organizations
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: page + 1,
        limit: rowsPerPage,
        populate: 'owner members.user'
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (filterIndustry) {
        params.industry = filterIndustry;
      }

      if (filterSize) {
        params.size = filterSize;
      }

      if (filterSubscription) {
        params['subscription.plan'] = filterSubscription;
      }

      const response = await organizationAPI.getAllOrganizations(params);
      setOrganizations(response.data.organizations);
      setTotalOrganizations(response.data.total);

      // Calculate stats from the data
      if (response.data.stats) {
        setOrganizationStats(response.data.stats);
      } else {
        // If server doesn't provide stats, calculate basic stats
        const allOrgsResponse = await organizationAPI.getAllOrganizations({ limit: 1000 });
        const allOrgs = allOrgsResponse.data.organizations;

        setOrganizationStats({
          total: allOrgs.length,
          active: allOrgs.filter(org => org.active).length,
          enterprise: allOrgs.filter(org => org.subscription?.plan === 'enterprise').length,
          professional: allOrgs.filter(org => org.subscription?.plan === 'professional').length,
          basic: allOrgs.filter(org => org.subscription?.plan === 'basic').length,
          free: allOrgs.filter(org => org.subscription?.plan === 'free').length
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError('Failed to fetch organizations. Please try again.');
      setLoading(false);
    }
  };

  // Fetch available owners/admins for org creation
  const fetchAvailableOwners = async () => {
    try {
      const response = await userAPI.getAllUsers({ role: ['admin', 'super-admin'] });
      setAvailableOwners(response.data.data);
    } catch (error) {
      console.error('Error fetching available owners:', error);
    }
  };

  useEffect(() => {
    fetchOrganizations();
    fetchAvailableOwners();
  }, [page, rowsPerPage, searchQuery, filterIndustry, filterSize, filterSubscription, refreshKey]);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open create/edit dialog
  const handleOpenDialog = (organization: Organization | null = null) => {
    if (organization) {
      setCurrentOrganization(organization);
      setFormData({
        name: organization.name,
        description: organization.description || '',
        industry: organization.industry || '',
        size: organization.size || '',
        website: organization.website || '',
        founded: organization.founded ? organization.founded.toString() : '',
      });
    } else {
      setCurrentOrganization(null);
      setFormData({
        name: '',
        description: '',
        industry: '',
        size: '',
        website: '',
        founded: '',
      });
    }
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentOrganization(null);
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        founded: formData.founded ? parseInt(formData.founded) : undefined
      };

      if (currentOrganization) {
        // Update existing organization
        await organizationAPI.updateOrganization(currentOrganization._id, submitData);
      } else {
        // Create new organization
        await organizationAPI.createOrganization(submitData);
      }
      handleCloseDialog();
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      console.error('Error saving organization:', error);
      setError('Failed to save organization. Please try again.');
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (organization: Organization) => {
    setCurrentOrganization(organization);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentOrganization(null);
  };

  // Delete organization
  const handleDeleteOrganization = async () => {
    if (!currentOrganization) return;

    try {
      await organizationAPI.deleteOrganization(currentOrganization._id);
      handleCloseDeleteDialog();
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      console.error('Error deleting organization:', error);
      setError('Failed to delete organization. Please try again.');
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  // Handle industry filter
  const handleIndustryFilter = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFilterIndustry(e.target.value as string);
    setPage(0);
  };

  // Handle size filter
  const handleSizeFilter = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFilterSize(e.target.value as string);
    setPage(0);
  };

  // Handle subscription filter
  const handleSubscriptionFilter = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFilterSubscription(e.target.value as string);
    setPage(0);
  };

  // Handle row selection
  const handleSelectRow = (orgId: string) => {
    setSelectedOrganizations(prev => {
      if (prev.includes(orgId)) {
        return prev.filter(id => id !== orgId);
      } else {
        return [...prev, orgId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedOrganizations.length === organizations.length) {
      setSelectedOrganizations([]);
    } else {
      setSelectedOrganizations(organizations.map(org => org._id));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedOrganizations.map(orgId => organizationAPI.deleteOrganization(orgId)));
      setOpenBulkDeleteDialog(false);
      setSelectedOrganizations([]);
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      console.error('Error bulk deleting organizations:', error);
      setError('Failed to delete organizations. Please try again.');
    }
  };

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle export organizations
  const handleExport = () => {
    exportToCSV(organizations);
    handleMenuClose();
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    handleMenuClose();
  };

  // Toggle row expansion
  const toggleRowExpanded = (orgId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [orgId]: !prev[orgId]
    }));
  };

  // Handle view details
  const handleViewDetails = (orgId: string) => {
    router.push(`/dashboard/organizations/${orgId}`);
  };

  return (
    <DashboardLayout title="Organization Management">
      <Box sx={{ mt: 2 }}>
        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Organizations
                </Typography>
                <Typography variant="h4">{organizationStats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Organizations
                </Typography>
                <Typography variant="h4">{organizationStats.active}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Enterprise Plan
                </Typography>
                <Typography variant="h4">{organizationStats.enterprise}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Professional Plan
                </Typography>
                <Typography variant="h4">{organizationStats.professional}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Basic Plan
                </Typography>
                <Typography variant="h4">{organizationStats.basic}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Free Plan
                </Typography>
                <Typography variant="h4">{organizationStats.free}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Organizations
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedOrganizations.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<BulkDeleteIcon />}
                  onClick={() => setOpenBulkDeleteDialog(true)}
                >
                  Delete {selectedOrganizations.length} Selected
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Organization
              </Button>
              <IconButton onClick={handleMenuOpen}>
                <MoreIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleExport}>
                  <ListItemIcon>
                    <ExportIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Export Organizations</ListItemText>
                </MenuItem>
                <MenuItem>
                  <ListItemIcon>
                    <ImportIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Import Organizations</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleRefresh}>
                  <ListItemIcon>
                    <FilterIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Refresh</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Search and filters */}
          <Box sx={{ display: 'flex', mb: 2, gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearch}
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="industry-filter-label">Industry</InputLabel>
              <Select
                labelId="industry-filter-label"
                value={filterIndustry}
                onChange={handleIndustryFilter}
                input={<OutlinedInput label="Industry" />}
              >
                <MenuItem value="">All Industries</MenuItem>
                <MenuItem value="Technology">Technology</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="Healthcare">Healthcare</MenuItem>
                <MenuItem value="Education">Education</MenuItem>
                <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                <MenuItem value="Retail">Retail</MenuItem>
                <MenuItem value="Services">Services</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="size-filter-label">Size</InputLabel>
              <Select
                labelId="size-filter-label"
                value={filterSize}
                onChange={handleSizeFilter}
                input={<OutlinedInput label="Size" />}
              >
                <MenuItem value="">All Sizes</MenuItem>
                <MenuItem value="1-10">1-10</MenuItem>
                <MenuItem value="11-50">11-50</MenuItem>
                <MenuItem value="51-200">51-200</MenuItem>
                <MenuItem value="201-500">201-500</MenuItem>
                <MenuItem value="501-1000">501-1000</MenuItem>
                <MenuItem value="1000+">1000+</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="subscription-filter-label">Subscription</InputLabel>
              <Select
                labelId="subscription-filter-label"
                value={filterSubscription}
                onChange={handleSubscriptionFilter}
                input={<OutlinedInput label="Subscription" />}
              >
                <MenuItem value="">All Plans</MenuItem>
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <LinearProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedOrganizations.length > 0 && selectedOrganizations.length < organizations.length}
                          checked={organizations.length > 0 && selectedOrganizations.length === organizations.length}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell>Organization</TableCell>
                      <TableCell>Industry</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Owner</TableCell>
                      <TableCell>Members</TableCell>
                      <TableCell>Subscription</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {organizations.map((org) => {
                      const isExpanded = expandedRows[org._id] || false;
                      return (
                        <React.Fragment key={org._id}>
                          <TableRow
                            hover
                            selected={selectedOrganizations.includes(org._id)}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedOrganizations.includes(org._id)}
                                onChange={() => handleSelectRow(org._id)}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  src={org.logo}
                                  alt={org.name}
                                  variant="rounded"
                                  sx={{ mr: 2, width: 40, height: 40, bgcolor: 'primary.main' }}
                                >
                                  {org.name.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" fontWeight="medium">
                                    {org.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {org.description
                                      ? org.description.length > 50
                                        ? `${org.description.substring(0, 50)}...`
                                        : org.description
                                      : 'No description'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>{org.industry || 'N/A'}</TableCell>
                            <TableCell>{org.size || 'N/A'}</TableCell>
                            <TableCell>
                              {org.owner && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar
                                    sx={{ width: 30, height: 30, mr: 1, fontSize: '0.875rem' }}
                                  >
                                    {org.owner.firstName.charAt(0)}{org.owner.lastName.charAt(0)}
                                  </Avatar>
                                  <Typography variant="body2">
                                    {`${org.owner.firstName} ${org.owner.lastName}`}
                                  </Typography>
                                </Box>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                avatar={<Avatar>{org.members.length}</Avatar>}
                                label="Members"
                                color="default"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={org.subscription?.plan || 'free'}
                                color={
                                  org.subscription?.plan === 'enterprise' ? 'primary' :
                                  org.subscription?.plan === 'professional' ? 'secondary' :
                                  org.subscription?.plan === 'basic' ? 'info' :
                                  'default'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={org.active ? 'Active' : 'Inactive'}
                                color={org.active ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Tooltip title="View Details">
                                  <IconButton
                                    onClick={() => handleViewDetails(org._id)}
                                    size="small"
                                  >
                                    <Business />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton
                                    onClick={() => handleOpenDialog(org)}
                                    size="small"
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    onClick={() => handleOpenDeleteDialog(org)}
                                    size="small"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={isExpanded ? "Show Less" : "Show More"}>
                                  <IconButton
                                    onClick={() => toggleRowExpanded(org._id)}
                                    size="small"
                                  >
                                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>

                          {/* Expanded details row */}
                          <TableRow>
                            <TableCell
                              style={{ paddingBottom: 0, paddingTop: 0 }}
                              colSpan={9}
                            >
                              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <Box sx={{ my: 2, mx: 2 }}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={1}>
                                        {org.website && (
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <WebsiteIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                            <Typography variant="body2">
                                              <Link href={org.website} target="_blank" rel="noopener">
                                                {org.website}
                                              </Link>
                                            </Typography>
                                          </Box>
                                        )}

                                        {org.founded && (
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <FoundedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                            <Typography variant="body2">
                                              Founded: {org.founded}
                                            </Typography>
                                          </Box>
                                        )}

                                        {org.headquarters?.city && org.headquarters?.country && (
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                            <Typography variant="body2">
                                              HQ: {org.headquarters.city}, {org.headquarters.country}
                                            </Typography>
                                          </Box>
                                        )}
                                      </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                      <Typography variant="subtitle2" gutterBottom>
                                        Members ({org.members.length})
                                      </Typography>
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {org.members.slice(0, 5).map((member, idx) => (
                                          <Tooltip
                                            key={idx}
                                            title={`${member.user.firstName} ${member.user.lastName} (${member.role})`}
                                          >
                                            <Chip
                                              size="small"
                                              avatar={
                                                <Avatar sx={{ width: 24, height: 24 }}>
                                                  {member.user.firstName.charAt(0)}
                                                </Avatar>
                                              }
                                              label={`${member.user.firstName} ${member.user.lastName.charAt(0)}.`}
                                              variant="outlined"
                                            />
                                          </Tooltip>
                                        ))}
                                        {org.members.length > 5 && (
                                          <Chip
                                            size="small"
                                            label={`+${org.members.length - 5} more`}
                                            onClick={() => handleViewDetails(org._id)}
                                          />
                                        )}
                                      </Box>
                                    </Grid>
                                  </Grid>

                                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                      size="small"
                                      onClick={() => handleViewDetails(org._id)}
                                      endIcon={<ArrowForwardIcon />}
                                    >
                                      View full details
                                    </Button>
                                  </Box>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                    {organizations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          No organizations found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={totalOrganizations}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </Paper>
      </Box>

      {/* Create/Edit Organization Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentOrganization ? 'Edit Organization' : 'Add New Organization'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Organization Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
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
                  select
                  label="Size"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
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
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="https://example.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Founded Year"
                  name="founded"
                  value={formData.founded}
                  onChange={handleInputChange}
                  fullWidth
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FoundedIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentOrganization ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Organization</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {currentOrganization?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteOrganization} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={openBulkDeleteDialog}
        onClose={() => setOpenBulkDeleteDialog(false)}
      >
        <DialogTitle>Delete Multiple Organizations</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedOrganizations.length} selected organizations? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkDelete} color="error">
            Delete {selectedOrganizations.length} Organizations
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
