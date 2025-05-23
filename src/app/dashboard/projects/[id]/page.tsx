'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  Avatar,
  AvatarGroup,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  CircularProgress,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Business as BusinessIcon,
  Today as DateIcon,
  Person as PersonIcon,
  Notes as NotesIcon,
  Description as DescriptionIcon,
  Group as TeamIcon,
  Flag as MilestoneIcon,
  Warning as RiskIcon,
  Assessment as KpiIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Timeline as TimelineIcon,
  AttachMoney as BudgetIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  HourglassEmpty as PendingIcon,
  PriorityHigh as HighIcon,
  WarningAmber as MediumIcon,
  Info as LowIcon
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/Layout';
import { projectAPI, userAPI } from '@/lib/api';

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id;

  // State
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openMilestoneDialog, setOpenMilestoneDialog] = useState(false);
  const [openRiskDialog, setOpenRiskDialog] = useState(false);
  const [openKpiDialog, setOpenKpiDialog] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState(null);
  const [currentRisk, setCurrentRisk] = useState(null);
  const [currentKpi, setCurrentKpi] = useState(null);
  const [users, setUsers] = useState([]);
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'pending'
  });
  const [riskForm, setRiskForm] = useState({
    title: '',
    description: '',
    impact: 'medium',
    probability: 'medium',
    mitigation: '',
    status: 'identified'
  });
  const [kpiForm, setKpiForm] = useState({
    name: '',
    description: '',
    target: '',
    current: '',
    unit: '',
    status: 'on-track'
  });

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      try {
        const response = await projectAPI.getProjectById(projectId);
        setProject(response.data.data);

        // Fetch users for team management
        const usersResponse = await userAPI.getAllUsers({ limit: 100 });
        setUsers(usersResponse.data.data);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project data. Please try again.');
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'planning':
        return 'info';
      case 'in-progress':
        return 'primary';
      case 'on-hold':
        return 'warning';
      case 'completed':
        return 'success';
      case 'canceled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get milestone status icon
  const getMilestoneStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckIcon color="success" />;
      case 'in-progress':
        return <TimelineIcon color="primary" />;
      case 'delayed':
        return <CancelIcon color="error" />;
      default:
        return <PendingIcon color="action" />;
    }
  };

  // Get risk impact icon
  const getRiskImpactIcon = (impact) => {
    switch (impact) {
      case 'critical':
        return <HighIcon color="error" />;
      case 'high':
        return <HighIcon color="warning" />;
      case 'medium':
        return <MediumIcon color="warning" />;
      case 'low':
        return <LowIcon color="info" />;
      default:
        return <MediumIcon color="action" />;
    }
  };

  // Get KPI status icon
  const getKpiStatusIcon = (status) => {
    switch (status) {
      case 'on-track':
        return <CheckIcon color="success" />;
      case 'at-risk':
        return <WarningAmber color="warning" />;
      case 'off-track':
        return <CancelIcon color="error" />;
      default:
        return <CheckIcon color="success" />;
    }
  };

  // Calculate KPI progress
  const calculateKpiProgress = (current, target) => {
    if (!current || !target) return 0;
    const progress = (current / target) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  // Milestone Dialog Functions
  const handleOpenMilestoneDialog = (milestone = null) => {
    if (milestone) {
      setCurrentMilestone(milestone);
      setMilestoneForm({
        title: milestone.title,
        description: milestone.description || '',
        dueDate: new Date(milestone.dueDate).toISOString().split('T')[0],
        status: milestone.status
      });
    } else {
      setCurrentMilestone(null);
      setMilestoneForm({
        title: '',
        description: '',
        dueDate: '',
        status: 'pending'
      });
    }
    setOpenMilestoneDialog(true);
  };

  const handleCloseMilestoneDialog = () => {
    setOpenMilestoneDialog(false);
    setCurrentMilestone(null);
  };

  const handleMilestoneInputChange = (e) => {
    const { name, value } = e.target;
    setMilestoneForm({
      ...milestoneForm,
      [name]: value
    });
  };

  const handleMilestoneSave = async () => {
    try {
      if (currentMilestone) {
        // Update existing milestone
        await projectAPI.updateProjectMilestone(
          projectId,
          currentMilestone._id,
          milestoneForm
        );
      } else {
        // Add new milestone
        await projectAPI.addProjectMilestone(projectId, milestoneForm);
      }

      // Refresh project data
      const response = await projectAPI.getProjectById(projectId);
      setProject(response.data.data);

      handleCloseMilestoneDialog();
    } catch (err) {
      console.error('Error saving milestone:', err);
      setError('Failed to save milestone. Please try again.');
    }
  };

  // Risk Dialog Functions
  const handleOpenRiskDialog = (risk = null) => {
    if (risk) {
      setCurrentRisk(risk);
      setRiskForm({
        title: risk.title,
        description: risk.description || '',
        impact: risk.impact,
        probability: risk.probability,
        mitigation: risk.mitigation || '',
        status: risk.status
      });
    } else {
      setCurrentRisk(null);
      setRiskForm({
        title: '',
        description: '',
        impact: 'medium',
        probability: 'medium',
        mitigation: '',
        status: 'identified'
      });
    }
    setOpenRiskDialog(true);
  };

  const handleCloseRiskDialog = () => {
    setOpenRiskDialog(false);
    setCurrentRisk(null);
  };

  const handleRiskInputChange = (e) => {
    const { name, value } = e.target;
    setRiskForm({
      ...riskForm,
      [name]: value
    });
  };

  const handleRiskSave = async () => {
    try {
      // For demonstration - would need to add these API endpoints
      if (currentRisk) {
        // Update existing risk - placeholder for API call
        // await projectAPI.updateProjectRisk(projectId, currentRisk._id, riskForm);

        // For now, manually update the project object
        const updatedRisks = project.risks.map(risk =>
          risk._id === currentRisk._id ? { ...risk, ...riskForm } : risk
        );
        setProject({ ...project, risks: updatedRisks });
      } else {
        // Add new risk - placeholder for API call
        // await projectAPI.addProjectRisk(projectId, riskForm);

        // For now, manually update the project object
        const newRisk = {
          ...riskForm,
          _id: Date.now().toString() // Temporary ID
        };
        setProject({ ...project, risks: [...project.risks, newRisk] });
      }

      handleCloseRiskDialog();
    } catch (err) {
      console.error('Error saving risk:', err);
      setError('Failed to save risk. Please try again.');
    }
  };

  // KPI Dialog Functions
  const handleOpenKpiDialog = (kpi = null) => {
    if (kpi) {
      setCurrentKpi(kpi);
      setKpiForm({
        name: kpi.name,
        description: kpi.description || '',
        target: kpi.target,
        current: kpi.current,
        unit: kpi.unit || '',
        status: kpi.status
      });
    } else {
      setCurrentKpi(null);
      setKpiForm({
        name: '',
        description: '',
        target: '',
        current: '',
        unit: '',
        status: 'on-track'
      });
    }
    setOpenKpiDialog(true);
  };

  const handleCloseKpiDialog = () => {
    setOpenKpiDialog(false);
    setCurrentKpi(null);
  };

  const handleKpiInputChange = (e) => {
    const { name, value } = e.target;
    setKpiForm({
      ...kpiForm,
      [name]: value
    });
  };

  const handleKpiSave = async () => {
    try {
      // For demonstration - would need to add these API endpoints
      if (currentKpi) {
        // Update existing KPI - placeholder for API call
        // await projectAPI.updateProjectKpi(projectId, currentKpi._id, kpiForm);

        // For now, manually update the project object
        const updatedKpis = project.kpis.map(kpi =>
          kpi._id === currentKpi._id ? { ...kpi, ...kpiForm } : kpi
        );
        setProject({ ...project, kpis: updatedKpis });
      } else {
        // Add new KPI - placeholder for API call
        // await projectAPI.addProjectKpi(projectId, kpiForm);

        // For now, manually update the project object
        const newKpi = {
          ...kpiForm,
          _id: Date.now().toString() // Temporary ID
        };
        setProject({ ...project, kpis: [...project.kpis, newKpi] });
      }

      handleCloseKpiDialog();
    } catch (err) {
      console.error('Error saving KPI:', err);
      setError('Failed to save KPI. Please try again.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Project Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout title="Project Details">
        <Box sx={{ mt: 2 }}>
          <Alert severity="error">{error || 'Project not found'}</Alert>
          <Button
            startIcon={<BackIcon />}
            onClick={() => router.push('/dashboard/projects')}
            sx={{ mt: 2 }}
          >
            Back to Projects
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Project Details">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => router.push('/dashboard/projects')}
          sx={{ mb: 2 }}
        >
          Back to Projects
        </Button>

        <Paper sx={{ p: 0, overflow: 'hidden' }}>
          {/* Project Header */}
          <Box
            sx={{
              p: 3,
              backgroundColor: 'primary.main',
              color: 'white',
              position: 'relative'
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Typography variant="h5" component="h1">
                  {project.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <BusinessIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body1">
                    {project.client?.name || 'No client specified'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item>
                <Chip
                  label={project.status.replace('-', ' ')}
                  color={getStatusColor(project.status)}
                  sx={{
                    textTransform: 'capitalize',
                    fontWeight: 'bold',
                    color: 'white',
                    borderColor: 'white',
                    '& .MuiChip-label': { px: 2 }
                  }}
                  variant="outlined"
                  size="medium"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="project tabs">
              <Tab label="Overview" />
              <Tab label="Team" />
              <Tab label="Milestones" />
              <Tab label="Risks" />
              <Tab label="KPIs" />
            </Tabs>
          </Box>

          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      Project Description
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    {project.description}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <NotesIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      Project Details
                    </Typography>
                  </Box>
                  <List disablePadding>
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <DateIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Timeline"
                        secondary={`${new Date(project.startDate).toLocaleDateString()} - ${project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}`}
                      />
                    </ListItem>
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <PersonIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Project Manager"
                        secondary={`${project.manager?.firstName} ${project.manager?.lastName}`}
                      />
                    </ListItem>
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <TeamIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Team Size"
                        secondary={`${project.team?.length || 0} members`}
                      />
                    </ListItem>
                    {project.budget?.amount && (
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <BudgetIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Budget"
                          secondary={`${project.budget.currency} ${project.budget.amount.toLocaleString()} (${project.budget.type})`}
                        />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MilestoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      Progress Overview
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {/* Key stats cards */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h4" align="center" color="primary" gutterBottom>
                            {project.milestones?.filter(m => m.status === 'completed').length || 0}/{project.milestones?.length || 0}
                          </Typography>
                          <Typography variant="body2" align="center" color="text.secondary">
                            Milestones Completed
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h4" align="center" color="warning.main" gutterBottom>
                            {project.risks?.filter(r => r.status === 'identified' || r.status === 'monitoring').length || 0}
                          </Typography>
                          <Typography variant="body2" align="center" color="text.secondary">
                            Active Risks
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h4" align="center" color="success.main" gutterBottom>
                            {project.kpis?.filter(k => k.status === 'on-track').length || 0}/{project.kpis?.length || 0}
                          </Typography>
                          <Typography variant="body2" align="center" color="text.secondary">
                            KPIs On Track
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h4" align="center" color="info.main" gutterBottom>
                            {project.team?.length || 0}
                          </Typography>
                          <Typography variant="body2" align="center" color="text.secondary">
                            Team Members
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Team Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Project Team
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                // For now, just as a placeholder, would need to implement this functionality
                onClick={() => {}}
              >
                Add Team Member
              </Button>
            </Box>
            <Grid container spacing={2}>
              {project.team && project.team.length > 0 ? (
                project.team.map((member) => (
                  <Grid item xs={12} md={6} lg={4} key={member.user._id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            src={member.user.profileImage}
                            alt={`${member.user.firstName} ${member.user.lastName}`}
                            sx={{ mr: 2, width: 60, height: 60 }}
                          >
                            {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="h6">
                              {member.user.firstName} {member.user.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {member.role || 'Team Member'}
                            </Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Email:</strong> {member.user.email}
                        </Typography>
                        {member.user.phoneNumber && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Phone:</strong> {member.user.phoneNumber}
                          </Typography>
                        )}
                        {member.hoursAllocated && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Hours Allocated:</strong> {member.hoursAllocated} hours
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Added:</strong> {new Date(member.addedAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info">
                    No team members assigned to this project yet. Add team members to get started.
                  </Alert>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          {/* Milestones Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Project Milestones
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenMilestoneDialog()}
              >
                Add Milestone
              </Button>
            </Box>
            {project.milestones && project.milestones.length > 0 ? (
              <List>
                {project.milestones.map((milestone, index) => (
                  <React.Fragment key={milestone._id || index}>
                    <ListItem
                      secondaryAction={
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton edge="end" onClick={() => handleOpenMilestoneDialog(milestone)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    >
                      <ListItemIcon>
                        {getMilestoneStatusIcon(milestone.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1" component="span">
                              {milestone.title}
                            </Typography>
                            <Chip
                              label={milestone.status.replace('-', ' ')}
                              size="small"
                              sx={{ ml: 2, textTransform: 'capitalize' }}
                              color={
                                milestone.status === 'completed' ? 'success' :
                                milestone.status === 'in-progress' ? 'primary' :
                                milestone.status === 'delayed' ? 'error' : 'default'
                              }
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mt: 0.5 }} color="text.secondary">
                              {milestone.description || 'No description provided'}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }} color="text.secondary">
                              Due Date: {new Date(milestone.dueDate).toLocaleDateString()}
                            </Typography>
                            {milestone.completedAt && (
                              <Typography variant="body2" color="success.main">
                                Completed: {new Date(milestone.completedAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < project.milestones.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No milestones defined for this project yet. Add milestones to track progress.
              </Alert>
            )}
          </TabPanel>

          {/* Risks Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Project Risks
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenRiskDialog()}
              >
                Add Risk
              </Button>
            </Box>
            {project.risks && project.risks.length > 0 ? (
              <List>
                {project.risks.map((risk, index) => (
                  <React.Fragment key={risk._id || index}>
                    <ListItem
                      secondaryAction={
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton edge="end" onClick={() => handleOpenRiskDialog(risk)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    >
                      <ListItemIcon>
                        {getRiskImpactIcon(risk.impact)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1" component="span">
                              {risk.title}
                            </Typography>
                            <Chip
                              label={risk.status.replace('-', ' ')}
                              size="small"
                              sx={{ ml: 2, textTransform: 'capitalize' }}
                              color={
                                risk.status === 'mitigated' ? 'success' :
                                risk.status === 'occurred' ? 'error' :
                                risk.status === 'monitoring' ? 'warning' : 'info'
                              }
                            />
                            <Chip
                              label={`Impact: ${risk.impact}`}
                              size="small"
                              sx={{ ml: 1, textTransform: 'capitalize' }}
                              color={
                                risk.impact === 'critical' ? 'error' :
                                risk.impact === 'high' ? 'error' :
                                risk.impact === 'medium' ? 'warning' : 'info'
                              }
                            />
                            <Chip
                              label={`Probability: ${risk.probability}`}
                              size="small"
                              sx={{ ml: 1, textTransform: 'capitalize' }}
                              color={
                                risk.probability === 'very-high' ? 'error' :
                                risk.probability === 'high' ? 'error' :
                                risk.probability === 'medium' ? 'warning' : 'info'
                              }
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mt: 0.5 }} color="text.secondary">
                              {risk.description || 'No description provided'}
                            </Typography>
                            {risk.mitigation && (
                              <Typography variant="body2" sx={{ mt: 0.5 }} color="text.secondary">
                                <strong>Mitigation: </strong> {risk.mitigation}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < project.risks.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No risks identified for this project yet. Add risks to monitor potential issues.
              </Alert>
            )}
          </TabPanel>

          {/* KPIs Tab */}
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Project KPIs
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenKpiDialog()}
              >
                Add KPI
              </Button>
            </Box>
            {project.kpis && project.kpis.length > 0 ? (
              <Grid container spacing={2}>
                {project.kpis.map((kpi) => (
                  <Grid item xs={12} md={6} key={kpi._id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" component="div">
                            {kpi.name}
                          </Typography>
                          <Box>
                            <Tooltip title="Edit KPI">
                              <IconButton size="small" onClick={() => handleOpenKpiDialog(kpi)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {kpi.description || 'No description provided'}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Progress: {kpi.current} / {kpi.target} {kpi.unit}</span>
                            <span>
                              {Math.round((kpi.current / kpi.target) * 100)}%
                            </span>
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={calculateKpiProgress(kpi.current, kpi.target)}
                            color={
                              kpi.status === 'on-track' ? 'success' :
                              kpi.status === 'at-risk' ? 'warning' : 'error'
                            }
                            sx={{ mt: 1, height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getKpiStatusIcon(kpi.status)}
                          <Typography
                            variant="body2"
                            sx={{ ml: 1 }}
                            color={
                              kpi.status === 'on-track' ? 'success.main' :
                              kpi.status === 'at-risk' ? 'warning.main' : 'error.main'
                            }
                          >
                            Status: {kpi.status.replace('-', ' ')}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                No KPIs defined for this project yet. Add KPIs to measure project success.
              </Alert>
            )}
          </TabPanel>
        </Paper>
      </Box>

      {/* Milestone Dialog */}
      <Dialog open={openMilestoneDialog} onClose={handleCloseMilestoneDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{currentMilestone ? 'Edit Milestone' : 'Add New Milestone'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              name="title"
              value={milestoneForm.title}
              onChange={handleMilestoneInputChange}
              fullWidth
              required
            />
            <TextField
              label="Description"
              name="description"
              value={milestoneForm.description}
              onChange={handleMilestoneInputChange}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Due Date"
              name="dueDate"
              type="date"
              value={milestoneForm.dueDate}
              onChange={handleMilestoneInputChange}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              select
              label="Status"
              name="status"
              value={milestoneForm.status}
              onChange={handleMilestoneInputChange}
              fullWidth
              required
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="delayed">Delayed</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMilestoneDialog}>Cancel</Button>
          <Button
            onClick={handleMilestoneSave}
            variant="contained"
            color="primary"
            disabled={!milestoneForm.title || !milestoneForm.dueDate}
          >
            {currentMilestone ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Risk Dialog */}
      <Dialog open={openRiskDialog} onClose={handleCloseRiskDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{currentRisk ? 'Edit Risk' : 'Add New Risk'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              name="title"
              value={riskForm.title}
              onChange={handleRiskInputChange}
              fullWidth
              required
            />
            <TextField
              label="Description"
              name="description"
              value={riskForm.description}
              onChange={handleRiskInputChange}
              fullWidth
              multiline
              rows={3}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Impact"
                  name="impact"
                  value={riskForm.impact}
                  onChange={handleRiskInputChange}
                  fullWidth
                  required
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Probability"
                  name="probability"
                  value={riskForm.probability}
                  onChange={handleRiskInputChange}
                  fullWidth
                  required
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="very-high">Very High</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <TextField
              label="Mitigation Strategy"
              name="mitigation"
              value={riskForm.mitigation}
              onChange={handleRiskInputChange}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              select
              label="Status"
              name="status"
              value={riskForm.status}
              onChange={handleRiskInputChange}
              fullWidth
              required
            >
              <MenuItem value="identified">Identified</MenuItem>
              <MenuItem value="monitoring">Monitoring</MenuItem>
              <MenuItem value="mitigated">Mitigated</MenuItem>
              <MenuItem value="occurred">Occurred</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRiskDialog}>Cancel</Button>
          <Button
            onClick={handleRiskSave}
            variant="contained"
            color="primary"
            disabled={!riskForm.title}
          >
            {currentRisk ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* KPI Dialog */}
      <Dialog open={openKpiDialog} onClose={handleCloseKpiDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{currentKpi ? 'Edit KPI' : 'Add New KPI'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={kpiForm.name}
              onChange={handleKpiInputChange}
              fullWidth
              required
            />
            <TextField
              label="Description"
              name="description"
              value={kpiForm.description}
              onChange={handleKpiInputChange}
              fullWidth
              multiline
              rows={2}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Target Value"
                  name="target"
                  type="number"
                  value={kpiForm.target}
                  onChange={handleKpiInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Current Value"
                  name="current"
                  type="number"
                  value={kpiForm.current}
                  onChange={handleKpiInputChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            <TextField
              label="Unit"
              name="unit"
              value={kpiForm.unit}
              onChange={handleKpiInputChange}
              fullWidth
              placeholder="e.g., %, dollars, hours, etc."
            />
            <TextField
              select
              label="Status"
              name="status"
              value={kpiForm.status}
              onChange={handleKpiInputChange}
              fullWidth
              required
            >
              <MenuItem value="on-track">On Track</MenuItem>
              <MenuItem value="at-risk">At Risk</MenuItem>
              <MenuItem value="off-track">Off Track</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseKpiDialog}>Cancel</Button>
          <Button
            onClick={handleKpiSave}
            variant="contained"
            color="primary"
            disabled={!kpiForm.name || !kpiForm.target || !kpiForm.current}
          >
            {currentKpi ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
