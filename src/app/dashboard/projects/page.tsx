'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Tooltip,
  LinearProgress,
  Avatar,
  AvatarGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Checkbox,
  Collapse,
  Stack,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  useTheme,
  Badge,
  Breadcrumbs,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  MoreVert as MoreVertIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  CalendarMonth as CalendarMonthIcon,
  GetApp as ExportIcon,
  DoneAll as DoneAllIcon,
  PlayCircleOutline as RunningIcon,
  PauseCircleOutline as PausedIcon,
  Cancel as CancelledIcon,
  Schedule as PlannedIcon,
  AttachMoney as BudgetIcon,
  Person as PersonIcon,
  People as TeamIcon,
  Flag as MilestoneIcon,
  Warning as RiskIcon,
  Business as OrganizationIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/Layout';
import { projectAPI, userAPI, organizationAPI } from '@/lib/api';
import Link from 'next/link';
import { visuallyHidden } from '@mui/utils';

// Types
interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'canceled';
  startDate: string;
  endDate?: string;
  budget?: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly' | 'milestone';
  };
  team: Array<{
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      profileImage?: string;
    };
    role: string;
  }>;
  manager: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  organization: {
    _id: string;
    name: string;
    logo?: string;
  };
  client: {
    _id: string;
    name: string;
    logo?: string;
  };
  milestones?: Array<{
    title: string;
    status: 'pending' | 'in-progress' | 'completed' | 'delayed';
    dueDate: string;
  }>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Project | 'clientName' | 'teamSize' | 'actions';
  label: string;
  numeric: boolean;
  sortable: boolean;
}

const headCells: HeadCell[] = [
  { id: 'name', label: 'Project Name', numeric: false, sortable: true },
  { id: 'clientName', label: 'Client', numeric: false, sortable: true },
  { id: 'status', label: 'Status', numeric: false, sortable: true },
  { id: 'startDate', label: 'Start Date', numeric: false, sortable: true },
  { id: 'endDate', label: 'End Date', numeric: false, sortable: true },
  { id: 'teamSize', label: 'Team', numeric: true, sortable: true },
  { id: 'actions', label: 'Actions', numeric: false, sortable: false }
];

// CSV export function
const exportToCSV = (projects: Project[]) => {
  // Define headers
  const headers = ['Project Name', 'Client', 'Status', 'Start Date', 'End Date', 'Team Size', 'Manager'];

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...projects.map(project => [
      project.name,
      project.client?.name || 'N/A',
      project.status,
      new Date(project.startDate).toLocaleDateString(),
      project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A',
      project.team?.length || 0,
      project.manager ? `${project.manager.firstName} ${project.manager.lastName}` : 'N/A'
    ].join(','))
  ].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'projects.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ProjectsManagement() {
  const router = useRouter();
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const isDarkMode = theme.palette.mode === 'dark';

  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProjects, setTotalProjects] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterOrganization, setFilterOrganization] = useState('');
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof Project>('startDate');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [viewType, setViewType] = useState<'list' | 'grid' | 'calendar'>('list');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [clients, setClients] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);

  // Project stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    planning: 0,
    onHold: 0
  });

  // Fetch projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: page + 1,
        limit: rowsPerPage,
        sort: `${order === 'desc' ? '-' : ''}${orderBy}`,
        populate: 'manager team.user organization client'
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (filterStatus) {
        params.status = filterStatus;
      }

      if (filterClient) {
        params.client = filterClient;
      }

      if (filterOrganization) {
        params.organization = filterOrganization;
      }

      const response = await projectAPI.getAllProjects(params);
      setProjects(response.data.data);
      setTotalProjects(response.data.pagination.total);

      // Calculate stats
      const allProjectsResponse = await projectAPI.getAllProjects({ limit: 1000 });
      const allProjects = allProjectsResponse.data.data;

      setStats({
        total: allProjects.length,
        active: allProjects.filter(p => p.status === 'in-progress').length,
        completed: allProjects.filter(p => p.status === 'completed').length,
        planning: allProjects.filter(p => p.status === 'planning').length,
        onHold: allProjects.filter(p => p.status === 'on-hold').length
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to fetch projects');
      setLoading(false);
    }
  };

  // Fetch clients and organizations for filters
  const fetchClientsAndOrganizations = async () => {
    try {
      const clientsResponse = await organizationAPI.getAllOrganizations({ limit: 100 });
      setClients(clientsResponse.data.organizations);

      const orgsResponse = await organizationAPI.getAllOrganizations({ limit: 100 });
      setOrganizations(orgsResponse.data.organizations);
    } catch (error) {
      console.error('Error fetching clients and organizations:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchClientsAndOrganizations();
  }, [page, rowsPerPage, searchQuery, filterStatus, filterClient, filterOrganization, order, orderBy, refreshKey]);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle sort request
  const handleRequestSort = (property: keyof Project) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle row selection
  const handleSelectRow = (projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map(project => project._id));
    }
  };

  // Toggle row expansion
  const toggleRowExpanded = (projectId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Delete project
  const handleDeleteProject = async () => {
    if (!currentProject) return;

    try {
      await projectAPI.deleteProject(currentProject._id);
      setOpenDeleteDialog(false);
      setCurrentProject(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project');
    }
  };

  // Delete multiple projects
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedProjects.map(id => projectAPI.deleteProject(id)));
      setOpenBulkDeleteDialog(false);
      setSelectedProjects([]);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting projects:', error);
      setError('Failed to delete projects');
    }
  };

  // Get project status chip
  const getStatusChip = (status: string) => {
    switch(status) {
      case 'planning':
        return <Chip icon={<PlannedIcon />} label="Planning" size="small" color="info" />;
      case 'in-progress':
        return <Chip icon={<RunningIcon />} label="In Progress" size="small" color="primary" />;
      case 'on-hold':
        return <Chip icon={<PausedIcon />} label="On Hold" size="small" color="warning" />;
      case 'completed':
        return <Chip icon={<DoneAllIcon />} label="Completed" size="small" color="success" />;
      case 'canceled':
        return <Chip icon={<CancelledIcon />} label="Canceled" size="small" color="error" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // Menu functions
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleExport = () => {
    exportToCSV(projects);
    handleMenuClose();
  };

  // Stats cards
  const statsCards: StatCard[] = [
    {
      title: 'Total Projects',
      value: stats.total,
      icon: <AssignmentIcon />,
      color: primaryColor
    },
    {
      title: 'Active Projects',
      value: stats.active,
      icon: <RunningIcon />,
      color: theme.palette.success.main
    },
    {
      title: 'Completed Projects',
      value: stats.completed,
      icon: <DoneAllIcon />,
      color: theme.palette.secondary.main
    },
    {
      title: 'Planning Stage',
      value: stats.planning,
      icon: <PlannedIcon />,
      color: theme.palette.info.main
    },
    {
      title: 'On Hold',
      value: stats.onHold,
      icon: <PausedIcon />,
      color: theme.palette.warning.main
    }
  ];

  // Grid view render
  const renderGridView = () => (
    <Grid container spacing={2}>
      {projects.length > 0 ? (
        projects.map(project => (
          <Grid item xs={12} sm={6} md={4} key={project._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6,
                  cursor: 'pointer'
                }
              }}
              onClick={() => router.push(`/dashboard/projects/${project._id}`)}
            >
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: 1,
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssignmentIcon sx={{ mr: 1, color: primaryColor }} />
                  <Typography variant="h6" component="h2" noWrap>
                    {project.name}
                  </Typography>
                </Box>
                {getStatusChip(project.status)}
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    overflow: 'hidden',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 3,
                    mb: 2
                  }}
                >
                  {project.description}
                </Typography>

                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {project.client?.name || 'No client'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {project.manager ? `${project.manager.firstName} ${project.manager.lastName}` : 'No manager'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarMonthIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(project.startDate).toLocaleDateString()}
                      {project.endDate ? ` - ${new Date(project.endDate).toLocaleDateString()}` : ''}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>

              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 30, height: 30, fontSize: '0.8rem' } }}>
                    {project.team && project.team.map((member, index) => (
                      <Tooltip
                        key={index}
                        title={`${member.user.firstName} ${member.user.lastName}`}
                        arrow
                      >
                        <Avatar
                          alt={`${member.user.firstName} ${member.user.lastName}`}
                          src={member.user.profileImage}
                        >
                          {member.user.firstName[0]}{member.user.lastName[0]}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>

                  {project.budget?.amount && (
                    <Chip
                      icon={<BudgetIcon fontSize="small" />}
                      label={`${project.budget.amount} ${project.budget.currency}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </Card>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Projects Found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              No projects match your current filters.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => router.push('/dashboard/projects/new')}
            >
              Create Project
            </Button>
          </Paper>
        </Grid>
      )}
    </Grid>
  );

  // Table view render
  const renderTableView = () => (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 750 }} aria-labelledby="projectsTable">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={selectedProjects.length > 0 && selectedProjects.length < projects.length}
                checked={projects.length > 0 && selectedProjects.length === projects.length}
                onChange={handleSelectAll}
              />
            </TableCell>
            {headCells.map((headCell) => (
              <TableCell
                key={headCell.id}
                align={headCell.numeric ? 'right' : 'left'}
                sortDirection={orderBy === headCell.id ? order : false}
              >
                {headCell.sortable ? (
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={() => handleRequestSort(headCell.id as keyof Project)}
                  >
                    {headCell.label}
                    {orderBy === headCell.id ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                ) : (
                  headCell.label
                )}
              </TableCell>
            ))}
            <TableCell padding="checkbox"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.length > 0 ? (
            projects.map((project) => {
              const isSelected = selectedProjects.includes(project._id);
              const isExpanded = expandedRows[project._id] || false;

              return (
                <React.Fragment key={project._id}>
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={-1}
                    selected={isSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => handleSelectRow(project._id)}
                      />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AssignmentIcon sx={{ mr: 1, color: primaryColor }} />
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 'medium',
                            cursor: 'pointer',
                            '&:hover': {
                              color: primaryColor
                            }
                          }}
                          onClick={() => router.push(`/dashboard/projects/${project._id}`)}
                        >
                          {project.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {project.client ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            src={project.client.logo}
                            alt={project.client.name}
                            sx={{ width: 30, height: 30, mr: 1 }}
                          >
                            {project.client.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">
                            {project.client.name}
                          </Typography>
                        </Box>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>{getStatusChip(project.status)}</TableCell>
                    <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={`${project.team?.length || 0} team members`}>
                        <Chip
                          icon={<TeamIcon />}
                          label={project.team?.length || 0}
                          size="small"
                          color="default"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex' }}>
                        <Tooltip title="Edit Project">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/projects/${project._id}/edit`);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Project">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentProject(project);
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell padding="checkbox">
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => toggleRowExpanded(project._id)}
                      >
                        {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={9}
                    >
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, py: 2 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" gutterBottom component="div">
                                Description
                              </Typography>
                              <Typography variant="body2" paragraph>
                                {project.description}
                              </Typography>

                              {project.manager && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <PersonIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                                  <Typography variant="body2">
                                    <strong>Manager:</strong> {project.manager.firstName} {project.manager.lastName}
                                  </Typography>
                                </Box>
                              )}

                              {project.organization && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <OrganizationIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                                  <Typography variant="body2">
                                    <strong>Organization:</strong> {project.organization.name}
                                  </Typography>
                                </Box>
                              )}

                              {project.budget && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <BudgetIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                                  <Typography variant="body2">
                                    <strong>Budget:</strong> {project.budget.amount} {project.budget.currency} ({project.budget.type})
                                  </Typography>
                                </Box>
                              )}
                            </Grid>

                            <Grid item xs={12} md={6}>
                              {project.team && project.team.length > 0 && (
                                <>
                                  <Typography variant="subtitle2" gutterBottom component="div">
                                    Team Members
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                    {project.team.map((member, index) => (
                                      <Chip
                                        key={index}
                                        avatar={
                                          <Avatar
                                            alt={`${member.user.firstName} ${member.user.lastName}`}
                                            src={member.user.profileImage}
                                          >
                                            {member.user.firstName[0]}{member.user.lastName[0]}
                                          </Avatar>
                                        }
                                        label={`${member.user.firstName} ${member.user.lastName}`}
                                        variant="outlined"
                                        size="small"
                                      />
                                    ))}
                                  </Box>
                                </>
                              )}

                              {project.milestones && project.milestones.length > 0 && (
                                <>
                                  <Typography variant="subtitle2" gutterBottom component="div">
                                    Milestones
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {project.milestones.slice(0, 3).map((milestone, index) => (
                                      <Chip
                                        key={index}
                                        icon={<MilestoneIcon />}
                                        label={milestone.title}
                                        color={
                                          milestone.status === 'completed' ? 'success' :
                                          milestone.status === 'in-progress' ? 'primary' :
                                          milestone.status === 'delayed' ? 'error' : 'default'
                                        }
                                        size="small"
                                        sx={{ alignSelf: 'flex-start' }}
                                      />
                                    ))}
                                    {project.milestones.length > 3 && (
                                      <Typography variant="caption">
                                        +{project.milestones.length - 3} more milestones
                                      </Typography>
                                    )}
                                  </Box>
                                </>
                              )}
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={9} align="center">
                <Box sx={{ py: 3 }}>
                  <Typography variant="body1">No projects found</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render content based on view type
  const renderContent = () => {
    if (loading) {
      return <LinearProgress />;
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      );
    }

    return (
      <>
        {viewType === 'grid' ? renderGridView() : renderTableView()}

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalProjects}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </>
    );
  };

  return (
    <DashboardLayout title="Project Management">
      <Box sx={{ mt: 2 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/dashboard" passHref>
            <Typography
              color="inherit"
              variant="body2"
              component="a"
              sx={{
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Dashboard
            </Typography>
          </Link>
          <Typography color="text.primary" variant="body2">Projects</Typography>
        </Breadcrumbs>

        {/* Stats cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={2.4} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4">
                        {stat.value}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        backgroundColor: stat.color,
                        color: '#fff',
                        height: 45,
                        width: 45
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Projects
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedProjects.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setOpenBulkDeleteDialog(true)}
                >
                  Delete ({selectedProjects.length})
                </Button>
              )}

              <Box sx={{ display: 'flex', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Tooltip title="List view">
                  <IconButton
                    color={viewType === 'list' ? 'primary' : 'default'}
                    onClick={() => setViewType('list')}
                  >
                    <ViewListIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Grid view">
                  <IconButton
                    color={viewType === 'grid' ? 'primary' : 'default'}
                    onClick={() => setViewType('grid')}
                  >
                    <ViewModuleIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Calendar view">
                  <IconButton
                    color={viewType === 'calendar' ? 'primary' : 'default'}
                    onClick={() => setViewType('calendar')}
                    disabled
                  >
                    <CalendarMonthIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => router.push('/dashboard/projects/new')}
                sx={{ ml: 1 }}
              >
                New Project
              </Button>

              <IconButton onClick={handleMenuOpen}>
                <MoreVertIcon />
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
                  <ListItemText>Export to CSV</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                  setRefreshKey(prev => prev + 1);
                  handleMenuClose();
                }}>
                  <ListItemIcon>
                    <RefreshIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Refresh</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', mb: 2, gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Search Projects"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 240 }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={filterStatus}
                label="Status"
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="planning">Planning</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="on-hold">On Hold</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="canceled">Canceled</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="client-filter-label">Client</InputLabel>
              <Select
                labelId="client-filter-label"
                value={filterClient}
                label="Client"
                onChange={(e) => {
                  setFilterClient(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Clients</MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client._id} value={client._id}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="organization-filter-label">Organization</InputLabel>
              <Select
                labelId="organization-filter-label"
                value={filterOrganization}
                label="Organization"
                onChange={(e) => {
                  setFilterOrganization(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Organizations</MenuItem>
                {organizations.map((org) => (
                  <MenuItem key={org._id} value={org._id}>
                    {org.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {renderContent()}
        </Paper>
      </Box>

      {/* Delete Project Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the project "{currentProject?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteProject} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog
        open={openBulkDeleteDialog}
        onClose={() => setOpenBulkDeleteDialog(false)}
      >
        <DialogTitle>Delete Multiple Projects</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedProjects.length} selected projects? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkDelete} color="error">
            Delete {selectedProjects.length} Projects
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
