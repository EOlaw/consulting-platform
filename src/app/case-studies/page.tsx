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
import CardActionArea from '@mui/material/CardActionArea';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { alpha, useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { caseStudyAPI } from '@/lib/api';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BusinessIcon from '@mui/icons-material/Business';
import DevicesIcon from '@mui/icons-material/Devices';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import SchoolIcon from '@mui/icons-material/School';

// Industry categories for filter
const INDUSTRIES = [
  { value: '', label: 'All Industries' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'education', label: 'Education' },
  { value: 'professional-services', label: 'Professional Services' },
];

// Service areas for filter
const SERVICE_AREAS = [
  { value: '', label: 'All Services' },
  { value: 'strategy', label: 'Business Strategy' },
  { value: 'digital-transformation', label: 'Digital Transformation' },
  { value: 'operations', label: 'Operations Excellence' },
  { value: 'technology', label: 'Technology Implementation' },
  { value: 'market-analysis', label: 'Market Analysis' },
];

// Icons for industry categories
const INDUSTRY_ICONS: Record<string, React.ReactNode> = {
  'technology': <DevicesIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'finance': <AccountBalanceIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'healthcare': <LocalHospitalIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'retail': <ShoppingBasketIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'education': <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'professional-services': <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'manufacturing': <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
};

// Placeholder case studies for initial render or fallback
const DEFAULT_CASE_STUDIES = [
  {
    _id: '1',
    title: 'Digital Transformation for Global Financial Institution',
    slug: 'digital-transformation-finance',
    summary: 'How we helped a leading bank modernize their legacy systems and improve customer experience.',
    client: {
      industry: 'finance',
    },
    featuredImage: 'https://source.unsplash.com/random?finance',
    metrics: [
      { name: 'Cost Reduction', value: '32%' },
      { name: 'Customer Satisfaction', value: '+45%' },
      { name: 'Process Efficiency', value: '+60%' }
    ],
    serviceAreas: ['digital-transformation', 'technology'],
  },
  {
    _id: '2',
    title: 'Supply Chain Optimization for Retail Giant',
    slug: 'supply-chain-retail',
    summary: 'Comprehensive supply chain redesign resulting in significant cost savings and improved delivery times.',
    client: {
      industry: 'retail',
    },
    featuredImage: 'https://source.unsplash.com/random?retail',
    metrics: [
      { name: 'Delivery Time', value: '-48%' },
      { name: 'Inventory Costs', value: '-27%' },
      { name: 'Order Accuracy', value: '+95%' }
    ],
    serviceAreas: ['operations', 'strategy'],
  },
  {
    _id: '3',
    title: 'Healthcare Provider Patient Experience Transformation',
    slug: 'healthcare-patient-experience',
    summary: 'Revolutionizing patient care through digital solutions and process improvements.',
    client: {
      industry: 'healthcare',
    },
    featuredImage: 'https://source.unsplash.com/random?healthcare',
    metrics: [
      { name: 'Patient Satisfaction', value: '+65%' },
      { name: 'Wait Times', value: '-40%' },
      { name: 'Staff Efficiency', value: '+35%' }
    ],
    serviceAreas: ['digital-transformation', 'operations'],
  },
  {
    _id: '4',
    title: 'Market Expansion Strategy for Tech Startup',
    slug: 'market-expansion-tech',
    summary: 'Developing and executing a successful market entry strategy for an innovative SaaS platform.',
    client: {
      industry: 'technology',
    },
    featuredImage: 'https://source.unsplash.com/random?technology',
    metrics: [
      { name: 'New Markets', value: '5' },
      { name: 'Revenue Growth', value: '+120%' },
      { name: 'Customer Acquisition', value: '+200%' }
    ],
    serviceAreas: ['strategy', 'market-analysis'],
  },
  {
    _id: '5',
    title: 'Digital Learning Platform for Education Institution',
    slug: 'education-digital-learning',
    summary: 'Creating an engaging digital learning experience that improved student outcomes and teacher effectiveness.',
    client: {
      industry: 'education',
    },
    featuredImage: 'https://source.unsplash.com/random?education',
    metrics: [
      { name: 'Student Engagement', value: '+78%' },
      { name: 'Completion Rates', value: '+42%' },
      { name: 'Teacher Satisfaction', value: '+60%' }
    ],
    serviceAreas: ['digital-transformation', 'technology'],
  },
  {
    _id: '6',
    title: 'Manufacturing Process Optimization',
    slug: 'manufacturing-process-optimization',
    summary: 'Implementing lean manufacturing principles to reduce waste and increase production efficiency.',
    client: {
      industry: 'manufacturing',
    },
    featuredImage: 'https://source.unsplash.com/random?manufacturing',
    metrics: [
      { name: 'Production Output', value: '+25%' },
      { name: 'Waste Reduction', value: '-35%' },
      { name: 'Cost Savings', value: '$2.5M' }
    ],
    serviceAreas: ['operations', 'strategy'],
  },
];

export default function CaseStudiesPage() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseStudies, setCaseStudies] = useState(DEFAULT_CASE_STUDIES);
  const [filteredCaseStudies, setFilteredCaseStudies] = useState(DEFAULT_CASE_STUDIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  useEffect(() => {
    // Fetch case studies from API
    const fetchCaseStudies = async () => {
      try {
        setLoading(true);
        const response = await caseStudyAPI.getAllCaseStudies({
          status: 'published',
          limit: 50
        });
        if (response.data?.data?.caseStudies && response.data.data.caseStudies.length > 0) {
          setCaseStudies(response.data.data.caseStudies);
          setFilteredCaseStudies(response.data.data.caseStudies);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching case studies:', err);
        setError('Failed to load case studies. Please try again later.');
        // Keep default case studies as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchCaseStudies();
  }, []);

  // Filter case studies when filters change
  useEffect(() => {
    let results = [...caseStudies];

    // Apply search query filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      results = results.filter(study =>
        study.title.toLowerCase().includes(lowerQuery) ||
        study.summary.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply industry filter
    if (industryFilter) {
      results = results.filter(study =>
        study.client && study.client.industry === industryFilter
      );
    }

    // Apply service area filter
    if (serviceFilter) {
      results = results.filter(study =>
        study.serviceAreas && study.serviceAreas.includes(serviceFilter)
      );
    }

    setFilteredCaseStudies(results);
  }, [searchQuery, industryFilter, serviceFilter, caseStudies]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleIndustryFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setIndustryFilter(event.target.value as string);
  };

  const handleServiceFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setServiceFilter(event.target.value as string);
  };

  const getIndustryIcon = (industry: string) => {
    return INDUSTRY_ICONS[industry] || <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
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
            Case Studies
          </Typography>
          <Typography variant="h5" component="p" paragraph align="center" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            Explore how we've helped organizations across industries solve complex challenges and achieve remarkable results
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {/* Search and Filter Section */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {/* Search Box */}
          <Grid item xs={12} md={6}>
            <Paper
              component="form"
              sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search case studies..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <IconButton sx={{ p: '10px' }} aria-label="search">
                <SearchIcon />
              </IconButton>
            </Paper>
          </Grid>

          {/* Industry Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="industry-filter-label">Industry</InputLabel>
              <Select
                labelId="industry-filter-label"
                id="industry-filter"
                value={industryFilter}
                onChange={handleIndustryFilterChange}
                label="Industry"
              >
                {INDUSTRIES.map((industry) => (
                  <MenuItem key={industry.value} value={industry.value}>
                    {industry.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Service Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="service-filter-label">Service Area</InputLabel>
              <Select
                labelId="service-filter-label"
                id="service-filter"
                value={serviceFilter}
                onChange={handleServiceFilterChange}
                label="Service Area"
              >
                {SERVICE_AREAS.map((service) => (
                  <MenuItem key={service.value} value={service.value}>
                    {service.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

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

        {/* Case Studies Grid */}
        {!loading && (
          <>
            <Grid container spacing={4}>
              {filteredCaseStudies.map((caseStudy) => (
                <Grid item xs={12} md={6} key={caseStudy._id}>
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
                    <CardActionArea component={Link} href={`/case-studies/${caseStudy.slug}`}>
                      <CardMedia
                        component="img"
                        height="240"
                        image={caseStudy.featuredImage || `https://source.unsplash.com/random?business`}
                        alt={caseStudy.title}
                      />
                      <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
                        {caseStudy.client?.industry && (
                          <Chip
                            label={INDUSTRIES.find(i => i.value === caseStudy.client.industry)?.label || caseStudy.client.industry}
                            color="primary"
                            size="small"
                            sx={{
                              fontWeight: 'medium',
                              bgcolor: alpha(theme.palette.primary.main, 0.8),
                              '&:hover': { bgcolor: theme.palette.primary.main }
                            }}
                          />
                        )}
                      </Box>
                    </CardActionArea>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {caseStudy.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {caseStudy.summary}
                      </Typography>

                      {/* Key Metrics */}
                      {caseStudy.metrics && caseStudy.metrics.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Key Results:
                          </Typography>
                          <Grid container spacing={2}>
                            {caseStudy.metrics.slice(0, 3).map((metric, index) => (
                              <Grid item xs={4} key={index}>
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="h6" color="primary">
                                    {metric.value}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {metric.name}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      {/* Service Areas Tags */}
                      {caseStudy.serviceAreas && caseStudy.serviceAreas.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {caseStudy.serviceAreas.map((area, index) => (
                            <Chip
                              key={index}
                              label={SERVICE_AREAS.find(s => s.value === area)?.label || area}
                              size="small"
                              sx={{ bgcolor: 'background.default' }}
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
                      <Link href={`/case-studies/${caseStudy.slug}`} passHref legacyBehavior>
                        <Button
                          endIcon={<ArrowForwardIcon />}
                          color="primary"
                        >
                          Read Case Study
                        </Button>
                      </Link>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* No Results Message */}
            {filteredCaseStudies.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No case studies match your current filters.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setSearchQuery('');
                    setIndustryFilter('');
                    setServiceFilter('');
                  }}
                  sx={{ mt: 2 }}
                >
                  Clear Filters
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to Achieve Similar Results?
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Our team of expert consultants is ready to help you solve your business challenges.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Link href="/services" passHref legacyBehavior>
              <Button variant="outlined" color="primary" size="large">
                Explore Our Services
              </Button>
            </Link>
            <Link href="/contact" passHref legacyBehavior>
              <Button variant="contained" color="primary" size="large">
                Contact Us
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
