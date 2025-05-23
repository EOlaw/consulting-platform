'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import DashboardLayout from '@/components/dashboard/Layout';
import { Paper, Typography, Tabs, Tab, CircularProgress, useTheme } from '@mui/material';
import { analyticsAPI } from '@/lib/api';

// Import custom components
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import SummaryStats from '@/components/dashboard/SummaryStats';
import MetricsCard from '@/components/dashboard/MetricsCard';
import TopPerformersCard from '@/components/dashboard/TopPerformersCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import InsightsCard from '@/components/dashboard/InsightsCard';
import MapChart from '@/components/dashboard/MapChart';
import GaugeChart from '@/components/dashboard/GaugeChart';

// Import icons
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CelebrationIcon from '@mui/icons-material/Celebration';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PublicIcon from '@mui/icons-material/Public';
import SpeedIcon from '@mui/icons-material/Speed';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// Define time period options for dashboard
const TIME_PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
];

export default function Dashboard() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('year');
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // For demo purposes, use the mock data function
        const response = await analyticsAPI.getMockDashboardData();
        setDashboardData(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeframe]);

  const handleTimeframeChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setTimeframe(TIME_PERIODS[newValue].value);
  };

  if (loading && !dashboardData) {
    return (
      <DashboardLayout title="Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <Box sx={{ mt: 2 }}>
          <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography variant="h6">Error Loading Dashboard</Typography>
            <Typography>{error}</Typography>
          </Paper>
        </Box>
      </DashboardLayout>
    );
  }

  // Extract data from the API response
  const { stats, revenueData, clientAcquisition, servicePerformance, projectStats, regionalStats, salesFunnel, teamPerformance, recentActivity } = dashboardData || {};

  // Format data for the revenue chart
  const revenueChartData = revenueData || [];

  // Format data for client acquisition chart
  const clientAcquisitionData = clientAcquisition || [];

  // Format data for service performance chart
  const servicePerformanceData = servicePerformance || [];

  // Format data for top performers
  const topServices = servicePerformanceData.map((service: any) => ({
    id: service.service,
    title: service.service,
    subtitle: `${service.clients} clients`,
    value: service.revenue,
    percentage: (service.revenue / stats.totalRevenue) * 100,
    rating: service.satisfaction / 20, // Convert to 5-star scale
    status: service.satisfaction > 85 ? 'positive' : 'neutral',
    iconColor: theme.palette.primary.main,
    badge: service.satisfaction > 90 ? 'Top Rated' : undefined,
    chipColor: theme.palette.success.main,
  }));

  // Format data for insights
  const insights = [
    {
      id: '1',
      title: 'Revenue trend exceeding targets',
      description: 'Monthly revenue has exceeded targets for 3 consecutive months, with a consistent growth pattern.',
      type: 'achievement',
      metric: {
        name: 'Revenue Growth',
        value: '$125,300',
        change: 8
      },
      recommendation: 'Consider expanding service offerings in high-performing areas.',
      category: 'Finance',
      timestamp: '2 days ago'
    },
    {
      id: '2',
      title: 'Client retention rates dropping',
      description: 'Client retention has decreased by 3% compared to last quarter, primarily in the technology sector.',
      type: 'warning',
      severity: 'medium',
      metric: {
        name: 'Retention Rate',
        value: '82.5%',
        change: -3
      },
      recommendation: 'Schedule follow-ups with at-risk clients and review service delivery processes.',
      link: {
        text: 'View Affected Clients',
        url: '/dashboard/clients?filter=retention'
      },
      category: 'Client Relations',
      timestamp: '3 days ago'
    },
    {
      id: '3',
      title: 'New opportunity in healthcare sector',
      description: 'Market analysis shows growing demand for digital transformation services in healthcare, with 34% increase in inquiries.',
      type: 'opportunity',
      metric: {
        name: 'Inquiry Growth',
        value: '34%',
        change: 34
      },
      recommendation: 'Develop targeted marketing materials for healthcare clients.',
      category: 'Market Trends',
      timestamp: '1 week ago'
    },
    {
      id: '4',
      title: 'Financial Advisory underperforming',
      description: 'Financial Advisory services showing 12% lower conversion rates compared to other service areas.',
      type: 'warning',
      severity: 'high',
      metric: {
        name: 'Conversion Rate',
        value: '18%',
        change: -12
      },
      recommendation: 'Review pricing structure and client feedback for this service area.',
      category: 'Services',
      timestamp: '5 days ago'
    },
    {
      id: '5',
      title: 'Team utilization at optimal levels',
      description: 'Overall team utilization rate is at 87%, within the optimal range of 85-90%.',
      type: 'observation',
      metric: {
        name: 'Utilization Rate',
        value: '87%',
        change: 2
      },
      category: 'Operations',
      timestamp: '2 days ago'
    }
  ];

  // Format data for activity feed
  const activities = [
    {
      id: '1',
      title: 'New client onboarded',
      description: 'Tech Solutions Inc. has been successfully onboarded. Initial project meeting scheduled.',
      type: 'client',
      timestamp: '2 hours ago',
      read: false,
      actions: [
        { label: 'View Client', href: '/dashboard/clients/123' },
        { label: 'View Schedule', color: 'secondary' }
      ]
    },
    {
      id: '2',
      title: 'Project status updated',
      description: 'Website Redesign project status changed from "Planning" to "In Progress".',
      type: 'project',
      timestamp: '5 hours ago',
      read: false
    },
    {
      id: '3',
      title: 'New team member added',
      description: 'Jane Smith (UI/UX Designer) has joined the platform. Pending team assignment.',
      type: 'user',
      timestamp: '1 day ago',
      read: true,
      avatarUrl: 'https://randomuser.me/api/portraits/women/43.jpg'
    },
    {
      id: '4',
      title: 'Completed project milestones',
      description: 'All milestones for Strategic Market Analysis have been completed ahead of schedule.',
      type: 'project',
      timestamp: '2 days ago',
      read: true
    },
    {
      id: '5',
      title: 'New case study published',
      description: '"Digital Transformation Success" case study has been published and is now live.',
      type: 'document',
      timestamp: '3 days ago',
      read: true,
      link: '/case-studies/digital-transformation-success'
    }
  ];

  // Format data for top clients
  const topClients = [
    {
      id: 'client1',
      title: 'Global Tech Inc.',
      subtitle: 'Technology',
      value: 250000,
      percentage: 28,
      trend: 'up',
      change: 15,
      avatar: 'https://source.unsplash.com/random/100x100/?tech',
      verified: true
    },
    {
      id: 'client2',
      title: 'Finance Partners',
      subtitle: 'Finance',
      value: 180000,
      percentage: 20,
      trend: 'down',
      change: -5,
      avatar: 'https://source.unsplash.com/random/100x100/?finance',
      verified: true
    },
    {
      id: 'client3',
      title: 'Healthcare Solutions',
      subtitle: 'Healthcare',
      value: 145000,
      percentage: 16,
      trend: 'up',
      change: 8,
      avatar: 'https://source.unsplash.com/random/100x100/?healthcare'
    },
    {
      id: 'client4',
      title: 'Retail Innovators',
      subtitle: 'Retail',
      value: 120000,
      percentage: 14,
      trend: 'stable',
      change: 2,
      avatar: 'https://source.unsplash.com/random/100x100/?retail'
    },
    {
      id: 'client5',
      title: 'Education First',
      subtitle: 'Education',
      value: 95000,
      percentage: 11,
      trend: 'up',
      change: 22,
      avatar: 'https://source.unsplash.com/random/100x100/?education',
      badge: 'New'
    }
  ];

  // Format data for regional map
  const regionMapData = regionalStats || [];

  return (
    <DashboardLayout title="Dashboard">
      <Box sx={{ mt: 2 }}>
        {/* Time period selector */}
        <Paper sx={{ px: 2, mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTimeframeChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
          >
            {TIME_PERIODS.map((period, index) => (
              <Tab key={period.value} label={period.label} />
            ))}
          </Tabs>
        </Paper>

        {/* Key Stats */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SummaryStats
              stats={[
                {
                  title: 'Total Clients',
                  value: stats.totalClients,
                  percentChange: 12,
                  icon: <PeopleIcon />,
                  color: theme.palette.primary.main,
                  footer: `${stats.totalClients - 8} active clients`
                },
                {
                  title: 'Active Projects',
                  value: stats.activeProjects,
                  percentChange: 5,
                  icon: <AssignmentIcon />,
                  color: theme.palette.error.main,
                  footer: `${stats.activeProjects - 6} in progress`
                },
                {
                  title: 'Team Members',
                  value: stats.teamMembers,
                  percentChange: -2,
                  status: 'neutral',
                  icon: <PeopleIcon />,
                  color: theme.palette.info.main,
                  footer: '12 open positions'
                },
                {
                  title: 'Monthly Revenue',
                  value: stats.monthlyRevenue,
                  formatter: (value) => `$${(value/1000).toFixed(1)}K`,
                  percentChange: 8,
                  icon: <AttachMoneyIcon />,
                  color: theme.palette.success.main,
                  footer: `YTD: $${(stats.totalRevenue/1000).toFixed(0)}K`
                },
              ]}
              columns={4}
              spacing={3}
            />
          </Grid>

          {/* Revenue Chart */}
          <Grid item xs={12} md={8}>
            <PerformanceChart
              title="Revenue Overview"
              subtitle="Monthly revenue performance with projections"
              type="area"
              data={revenueChartData}
              xAxisKey="month"
              series={[
                { name: 'Revenue', dataKey: 'amount', color: theme.palette.primary.main }
              ]}
              valueFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
              height={365}
            />
          </Grid>

          {/* Insights */}
          <Grid item xs={12} md={4}>
            <InsightsCard
              insights={insights}
              height={365}
            />
          </Grid>

          {/* Client Acquisition */}
          <Grid item xs={12} md={6}>
            <PerformanceChart
              title="Client Acquisition"
              subtitle="New clients and retention rates"
              type="line"
              data={clientAcquisitionData}
              xAxisKey="month"
              series={[
                { name: 'New Clients', dataKey: 'newClients', color: theme.palette.primary.main },
                { name: 'Retention %', dataKey: 'retention', color: theme.palette.success.main }
              ]}
              height={350}
            />
          </Grid>

          {/* Service Performance */}
          <Grid item xs={12} md={6}>
            <PerformanceChart
              title="Service Performance"
              subtitle="Revenue by service category"
              type="bar"
              data={servicePerformanceData}
              xAxisKey="service"
              series={[
                { name: 'Revenue', dataKey: 'revenue', color: theme.palette.primary.main }
              ]}
              valueFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
              height={350}
            />
          </Grid>

          {/* Performance Metrics */}
          <Grid item xs={12} md={4}>
            <MetricsCard
              title="Performance Metrics"
              metrics={[
                {
                  title: 'Client Retention Rate',
                  value: stats.clientRetention,
                  percentChange: -2.5,
                  status: 'warning',
                  icon: <HandshakeIcon />,
                  color: theme.palette.warning.main,
                  target: 85,
                  progress: (stats.clientRetention / 90) * 100,
                  info: 'Percentage of clients that continue to use our services'
                },
                {
                  title: 'Conversion Rate',
                  value: stats.conversionRate,
                  percentChange: 4.2,
                  icon: <TrendingUpIcon />,
                  color: theme.palette.success.main,
                  target: 30,
                  progress: (stats.conversionRate / 40) * 100
                },
                {
                  title: 'Average Deal Size',
                  value: stats.averageDealSize,
                  formatter: (value) => `$${(value/1000).toFixed(1)}K`,
                  percentChange: 6.8,
                  icon: <ReceiptIcon />,
                  color: theme.palette.primary.main
                },
                {
                  title: 'Client Satisfaction',
                  value: 92.7,
                  percentChange: 1.5,
                  icon: <StarIcon />,
                  color: theme.palette.success.main,
                  target: 90,
                  progress: 92.7
                }
              ]}
            />
          </Grid>

          {/* Top Clients */}
          <Grid item xs={12} md={4}>
            <TopPerformersCard
              title="Top Clients"
              subtitle="By revenue contribution"
              items={topClients}
              valueLabel="Revenue"
              orderBy="desc"
              onOrderByChange={(order) => console.log(`Order changed to ${order}`)}
              viewAllHref="/dashboard/clients"
              height={350}
            />
          </Grid>

          {/* Activity Feed */}
          <Grid item xs={12} md={4}>
            <ActivityFeed
              title="Recent Activity"
              activities={activities}
              onMarkAllAsRead={() => console.log('Marked all as read')}
              height={350}
            />
          </Grid>

          {/* Regional Stats */}
          <Grid item xs={12} md={6}>
            <MapChart
              title="Regional Performance"
              subtitle="Revenue by region"
              data={regionMapData}
              height={350}
              valueLabel="Revenue"
              secondaryValueLabel="Clients"
            />
          </Grid>

          {/* Sales Funnel */}
          <Grid item xs={12} md={6}>
            <PerformanceChart
              title="Sales Funnel"
              subtitle="Conversion through sales stages"
              type="bar"
              data={salesFunnel}
              xAxisKey="stage"
              series={[
                { name: 'Count', dataKey: 'count', color: theme.palette.primary.main }
              ]}
              height={350}
            />
          </Grid>

          {/* KPI Gauges */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
              Key Performance Indicators
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <GaugeChart
                  title="Client Retention"
                  value={stats.clientRetention}
                  target={90}
                  previousValue={85}
                  thresholds={{ warning: 70, success: 85 }}
                  description="Percentage of clients retained from previous period"
                  height={300}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <GaugeChart
                  title="Team Utilization"
                  value={87}
                  maxValue={100}
                  target={85}
                  previousValue={82}
                  thresholds={{ warning: 60, success: 80 }}
                  description="Percentage of billable hours across all team members"
                  height={300}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <GaugeChart
                  title="Project Completion"
                  value={92}
                  maxValue={100}
                  target={95}
                  previousValue={88}
                  thresholds={{ warning: 75, success: 90 }}
                  description="On-time project delivery rate"
                  height={300}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <GaugeChart
                  title="Conversion Rate"
                  value={stats.conversionRate}
                  maxValue={100}
                  target={30}
                  previousValue={24}
                  thresholds={{ warning: 15, success: 25 }}
                  description="Percentage of leads converted to clients"
                  height={300}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Top Services */}
          <Grid item xs={12}>
            <TopPerformersCard
              title="Service Performance"
              subtitle="By revenue and client satisfaction"
              items={topServices}
              valueLabel="Revenue"
              orderBy="desc"
              variant="detailed"
              viewAllHref="/dashboard/services"
              maxItems={5}
            />
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
