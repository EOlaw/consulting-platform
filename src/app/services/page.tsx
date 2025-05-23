'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { alpha, useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { serviceAPI } from '@/lib/api';
import BusinessIcon from '@mui/icons-material/Business';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import GroupIcon from '@mui/icons-material/Group';
import WorkIcon from '@mui/icons-material/Work';
import DevicesIcon from '@mui/icons-material/Devices';
import SecurityIcon from '@mui/icons-material/Security';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Service categories
const CATEGORIES = [
  { id: 'all', label: 'All Services' },
  { id: 'business-consulting', label: 'Business Consulting' },
  { id: 'digital-transformation', label: 'Digital Transformation' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'operations', label: 'Operations' },
  { id: 'technology', label: 'Technology' },
];

// Placeholder for service icons
const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'business-consulting': <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'market-analysis': <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'talent-management': <GroupIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'project-management': <WorkIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'digital-transformation': <DevicesIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'security-consulting': <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'leadership-coaching': <PsychologyIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'strategy': <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'operations': <WorkIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'technology': <DevicesIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
};

// Default placeholder services for initial render or fallback
const DEFAULT_SERVICES = [
  {
    _id: '1',
    title: 'Business Strategy Consulting',
    slug: 'business-strategy-consulting',
    shortDescription: 'Develop robust business strategies that drive sustainable growth and competitive advantage.',
    icon: 'strategy',
    category: 'business-consulting',
    featuredImage: 'https://source.unsplash.com/random?business',
  },
  {
    _id: '2',
    title: 'Digital Transformation',
    slug: 'digital-transformation',
    shortDescription: 'Leverage technology to reimagine business processes, culture, and customer experiences.',
    icon: 'digital-transformation',
    category: 'digital-transformation',
    featuredImage: 'https://source.unsplash.com/random?digital',
  },
  {
    _id: '3',
    title: 'Operations Excellence',
    slug: 'operations-excellence',
    shortDescription: 'Optimize operational processes to enhance efficiency, quality, and customer satisfaction.',
    icon: 'operations',
    category: 'operations',
    featuredImage: 'https://source.unsplash.com/random?operations',
  },
  {
    _id: '4',
    title: 'Leadership Development',
    slug: 'leadership-development',
    shortDescription: 'Cultivate leadership capabilities across all organizational levels to drive high performance.',
    icon: 'leadership-coaching',
    category: 'business-consulting',
    featuredImage: 'https://source.unsplash.com/random?leadership',
  },
  {
    _id: '5',
    title: 'Technology Strategy',
    slug: 'technology-strategy',
    shortDescription: 'Align technology initiatives with business objectives to create sustainable competitive advantages.',
    icon: 'technology',
    category: 'technology',
    featuredImage: 'https://source.unsplash.com/random?technology',
  },
  {
    _id: '6',
    title: 'Market Analysis & Research',
    slug: 'market-analysis-research',
    shortDescription: 'Gain deep insights into market trends, customer behavior, and competitive landscape.',
    icon: 'market-analysis',
    category: 'strategy',
    featuredImage: 'https://source.unsplash.com/random?market',
  },
];

export default function ServicesPage() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [filteredServices, setFilteredServices] = useState(DEFAULT_SERVICES);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Fetch services from API
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await serviceAPI.getAllServices({ status: 'published' });
        if (response.data?.data?.services && response.data.data.services.length > 0) {
          setServices(response.data.data.services);
          setFilteredServices(response.data.data.services);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
        // Keep default services as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Filter services when category changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredServices(services);
    } else {
      setFilteredServices(services.filter(service => service.category === selectedCategory));
    }
  }, [selectedCategory, services]);

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
  };

  const getServiceIcon = (iconName: string) => {
    return SERVICE_ICONS[iconName] || <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom align="center">
            Our Services
          </Typography>
          <Typography variant="h5" component="p" paragraph align="center" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            Comprehensive consulting services tailored to help your business thrive in today's competitive landscape
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {/* Category Tabs */}
        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '.MuiTabs-indicator': {
                backgroundColor: 'primary.main',
              },
            }}
          >
            {CATEGORIES.map((category) => (
              <Tab
                key={category.id}
                label={category.label}
                value={category.id}
                sx={{
                  fontWeight: 'medium',
                  textTransform: 'none',
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 'bold',
                  },
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Loading Indicator */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Services Grid */}
        {!loading && (
          <Grid container spacing={4}>
            {filteredServices.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 20px -10px rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={service.featuredImage || `https://source.unsplash.com/random?${service.title}`}
                    alt={service.title}
                  />
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    {getServiceIcon(service.icon)}
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2" align="center">
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" paragraph>
                      {service.shortDescription}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Link href={`/services/${service.slug}`} passHref legacyBehavior>
                        <Button variant="outlined" color="primary" size="small">
                          Learn More
                        </Button>
                      </Link>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* No Services Message */}
        {!loading && filteredServices.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No services found in this category.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setSelectedCategory('all')}
              sx={{ mt: 2 }}
            >
              View All Services
            </Button>
          </Box>
        )}
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Need a Customized Solution?
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Our team of expert consultants is ready to help you achieve your business goals.
          </Typography>
          <Link href="/contact" passHref legacyBehavior>
            <Button variant="contained" color="primary" size="large">
              Contact Us
            </Button>
          </Link>
        </Container>
      </Box>
    </Box>
  );
}
