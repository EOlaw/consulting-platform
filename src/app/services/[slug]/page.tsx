'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { alpha, useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { serviceAPI, caseStudyAPI } from '@/lib/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// Placeholder for service icons
import BusinessIcon from '@mui/icons-material/Business';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import GroupIcon from '@mui/icons-material/Group';
import WorkIcon from '@mui/icons-material/Work';
import DevicesIcon from '@mui/icons-material/Devices';
import SecurityIcon from '@mui/icons-material/Security';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

// Service icons mapping
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

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [service, setService] = useState<any>(null);
  const [relatedCaseStudies, setRelatedCaseStudies] = useState<any[]>([]);

  useEffect(() => {
    // Fetch service details
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        // Fetch service by slug
        const response = await serviceAPI.getServiceBySlug(slug);
        if (response.data?.data?.service) {
          setService(response.data.data.service);

          // If service has related case studies
          if (response.data.data.service.relatedCaseStudies && response.data.data.service.relatedCaseStudies.length > 0) {
            setRelatedCaseStudies(response.data.data.service.relatedCaseStudies);
          } else {
            // Alternatively, fetch related case studies by category as a fallback
            try {
              const caseStudyResponse = await caseStudyAPI.getAllCaseStudies({
                limit: 3,
                status: 'published',
                // Use service category if available, otherwise filter by a common tag
                category: response.data.data.service.category || undefined
              });

              if (caseStudyResponse.data?.data?.caseStudies) {
                setRelatedCaseStudies(caseStudyResponse.data.data.caseStudies);
              }
            } catch (caseStudyErr) {
              console.error('Error fetching related case studies:', caseStudyErr);
              // Don't set an error, it's just a supplementary feature
            }
          }
        } else {
          setError('Service not found.');
        }
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Failed to load service details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchServiceDetails();
    }
  }, [slug]);

  const getServiceIcon = (iconName: string = '') => {
    return SERVICE_ICONS[iconName] || <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
  };

  // Placeholder service for development/preview
  const placeholderService = {
    title: 'Business Strategy Consulting',
    slug: 'business-strategy-consulting',
    shortDescription: 'Develop robust business strategies that drive sustainable growth and competitive advantage.',
    description: `
      Our Business Strategy Consulting service helps organizations define and execute strategies
      that create sustainable competitive advantages. We work with your leadership team to analyze
      market conditions, identify opportunities, and develop actionable plans that align with your
      organizational goals and capabilities.

      Through a combination of industry expertise, data-driven insights, and proven methodologies,
      we help you navigate complex business challenges and position your organization for long-term success.
    `,
    icon: 'strategy',
    category: 'business-consulting',
    featuredImage: 'https://source.unsplash.com/random?strategy',
    benefits: [
      {
        title: 'Improved Market Positioning',
        description: 'Identify and capitalize on market opportunities to strengthen your competitive position'
      },
      {
        title: 'Enhanced Decision Making',
        description: 'Gain data-driven insights to make informed strategic decisions'
      },
      {
        title: 'Accelerated Growth',
        description: 'Implement proven strategies to drive sustainable business growth'
      },
      {
        title: 'Organizational Alignment',
        description: 'Ensure all departments and teams are aligned with your strategic objectives'
      }
    ],
    processSteps: [
      {
        title: 'Discovery & Assessment',
        description: 'We conduct a comprehensive analysis of your current business model, market position, and organizational capabilities',
        order: 1
      },
      {
        title: 'Strategy Development',
        description: 'Based on our findings, we work with your team to develop a tailored strategy that addresses your unique challenges and opportunities',
        order: 2
      },
      {
        title: 'Implementation Planning',
        description: 'We create a detailed implementation roadmap with clear milestones, resource requirements, and success metrics',
        order: 3
      },
      {
        title: 'Execution Support',
        description: 'Our consultants provide ongoing guidance and support to help you execute the strategy effectively',
        order: 4
      },
      {
        title: 'Monitoring & Refinement',
        description: 'We help you track progress, measure results, and make necessary adjustments to optimize outcomes',
        order: 5
      }
    ],
    pricingTiers: [
      {
        name: 'Essential',
        price: 5000,
        currency: 'USD',
        billingCycle: 'one-time',
        description: 'Basic strategy consulting for small businesses',
        features: [
          'Initial business assessment',
          'Core strategy development',
          'Implementation roadmap',
          '30 days of support'
        ]
      },
      {
        name: 'Professional',
        price: 10000,
        currency: 'USD',
        billingCycle: 'one-time',
        description: 'Comprehensive strategy consulting for growing businesses',
        features: [
          'Detailed business assessment',
          'Comprehensive strategy development',
          'Detailed implementation plan',
          'Market analysis report',
          '90 days of support'
        ],
        isPopular: true
      },
      {
        name: 'Enterprise',
        price: 25000,
        currency: 'USD',
        billingCycle: 'one-time',
        description: 'Advanced strategy consulting for large organizations',
        features: [
          'Enterprise-wide assessment',
          'Multi-year strategy development',
          'Detailed implementation plan with resource allocation',
          'Comprehensive market analysis',
          'Competitive positioning report',
          '12 months of support',
          'Quarterly strategy reviews'
        ]
      }
    ]
  };

  // Use placeholder service during development and when data is loading
  const displayService = service || placeholderService;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Link href="/services" passHref legacyBehavior>
            <Button variant="contained" color="primary">
              Return to Services
            </Button>
          </Link>
        </Box>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ mb: 2, color: 'white', '& a': { color: 'white', textDecoration: 'none' } }}
          >
            <Link href="/" color="inherit">Home</Link>
            <Link href="/services" color="inherit">Services</Link>
            <Typography color="white">{displayService.title}</Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {getServiceIcon(displayService.icon)}
            <Typography variant="h3" component="h1" sx={{ ml: 2 }}>
              {displayService.title}
            </Typography>
          </Box>
          <Typography variant="h6" component="p" sx={{ mb: 4, opacity: 0.9, maxWidth: 800 }}>
            {displayService.shortDescription}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Service Description */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Overview
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {displayService.description}
              </Typography>
            </Paper>

            {/* Process Steps */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Our Process
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                How we deliver exceptional results
              </Typography>

              <Stepper orientation="vertical" sx={{ mt: 4 }}>
                {displayService.processSteps && displayService.processSteps
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((step: any, index: number) => (
                    <Step key={index} active={true}>
                      <StepLabel>
                        <Typography variant="h6">{step.title}</Typography>
                      </StepLabel>
                      <StepContent>
                        <Typography>{step.description}</Typography>
                      </StepContent>
                    </Step>
                  ))}
              </Stepper>
            </Paper>

            {/* Related Case Studies */}
            {relatedCaseStudies && relatedCaseStudies.length > 0 && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Success Stories
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  See how we've helped other clients achieve success
                </Typography>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                  {relatedCaseStudies.map((caseStudy: any) => (
                    <Grid item xs={12} md={4} key={caseStudy._id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardMedia
                          component="img"
                          height="160"
                          image={caseStudy.featuredImage || `https://source.unsplash.com/random?case-study`}
                          alt={caseStudy.title}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="h6" component="h3">
                            {caseStudy.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {caseStudy.summary?.substring(0, 120)}...
                          </Typography>
                        </CardContent>
                        <Box sx={{ p: 2, pt: 0 }}>
                          <Link href={`/case-studies/${caseStudy.slug}`} passHref legacyBehavior>
                            <Button size="small" color="primary" endIcon={<ArrowRightIcon />}>
                              Read Case Study
                            </Button>
                          </Link>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Benefits */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Benefits
              </Typography>

              <List>
                {displayService.benefits && displayService.benefits.map((benefit: any, index: number) => (
                  <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={benefit.title}
                      secondary={benefit.description}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Pricing */}
            {displayService.pricingTiers && displayService.pricingTiers.length > 0 && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Pricing Options
                </Typography>

                {displayService.pricingTiers.map((tier: any, index: number) => (
                  <Card
                    key={index}
                    sx={{
                      mb: 2,
                      border: tier.isPopular ? `2px solid ${theme.palette.primary.main}` : undefined,
                      position: 'relative',
                      overflow: 'visible'
                    }}
                  >
                    {tier.isPopular && (
                      <Chip
                        label="Popular Choice"
                        color="primary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -12,
                          right: 16,
                          fontWeight: 'bold',
                        }}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {tier.name}
                      </Typography>
                      <Typography variant="h4" component="p" color="primary" gutterBottom>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: tier.currency || 'USD',
                          maximumFractionDigits: 0
                        }).format(tier.price)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {tier.billingCycle === 'one-time' ? 'One-time payment' : `Billed ${tier.billingCycle}`}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {tier.description}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <List dense disablePadding>
                        {tier.features.map((feature: string, featureIndex: number) => (
                          <ListItem key={featureIndex} disablePadding sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                              <CheckCircleIcon fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                ))}
              </Paper>
            )}

            {/* CTA */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Ready to Get Started?
              </Typography>
              <Typography variant="body2" paragraph>
                Contact us today to discuss how we can help you achieve your business goals with our {displayService.title} service.
              </Typography>
              <Link href="/contact" passHref legacyBehavior>
                <Button fullWidth variant="contained" color="primary" size="large" sx={{ mt: 2 }}>
                  Contact Us
                </Button>
              </Link>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
