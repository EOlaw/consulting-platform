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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { alpha, useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { caseStudyAPI, serviceAPI } from '@/lib/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import QuoteIcon from '@mui/icons-material/FormatQuote';
import SocialShare from '@/components/SocialShare';
import BusinessIcon from '@mui/icons-material/Business';
import DevicesIcon from '@mui/icons-material/Devices';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

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

// Service icons mapping
const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'business-consulting': <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'market-analysis': <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'talent-management': <GroupIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'project-management': <WorkIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'digital-transformation': <DevicesIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'security-consulting': <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'leadership-coaching': <PsychologyIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'strategy': <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'operations': <WorkIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  'technology': <DevicesIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
};

export default function CaseStudyDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseStudy, setCaseStudy] = useState<any>(null);
  const [relatedServices, setRelatedServices] = useState<any[]>([]);

  useEffect(() => {
    // Fetch case study details
    const fetchCaseStudyDetails = async () => {
      try {
        setLoading(true);
        // Fetch case study by slug
        const response = await caseStudyAPI.getCaseStudyBySlug(slug);
        if (response.data?.data?.caseStudy) {
          setCaseStudy(response.data.data.caseStudy);

          // Fetch related services based on service areas
          if (response.data.data.caseStudy.serviceAreas && response.data.data.caseStudy.serviceAreas.length > 0) {
            try {
              const servicesResponse = await serviceAPI.getAllServices({
                limit: 3,
                status: 'published',
                category: response.data.data.caseStudy.serviceAreas[0]
              });

              if (servicesResponse.data?.data?.services) {
                setRelatedServices(servicesResponse.data.data.services);
              }
            } catch (serviceErr) {
              console.error('Error fetching related services:', serviceErr);
            }
          }
        } else {
          setError('Case study not found.');
        }
      } catch (err) {
        console.error('Error fetching case study details:', err);
        setError('Failed to load case study details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCaseStudyDetails();
    }
  }, [slug]);

  // Placeholder case study for development/preview
  const placeholderCaseStudy = {
    title: 'Digital Transformation for Global Financial Institution',
    slug: 'digital-transformation-finance',
    summary: 'How we helped a leading bank modernize their legacy systems and improve customer experience.',
    challenge: `
      Our client, a major financial institution with operations in 15 countries, was facing significant
      challenges with their legacy systems. Customer satisfaction scores were declining, and the organization
      was struggling to keep pace with fintech competitors who offered more streamlined digital experiences.

      Key challenges included:

      - Fragmented customer data across multiple systems
      - Slow processing times for transactions and applications
      - Limited mobile functionality compared to competitors
      - High maintenance costs for legacy infrastructure
      - Regulatory compliance concerns with aging systems
    `,
    solution: `
      We developed a comprehensive digital transformation strategy focused on modernizing the core banking
      platform while enhancing the customer experience across all channels.

      Our approach included:

      1. Comprehensive assessment of the current technology landscape and customer journey mapping
      2. Development of a phased implementation roadmap to minimize disruption
      3. Implementation of a new API-based architecture to enable faster integration
      4. Rebuilding the mobile and web platforms with a user-centered design approach
      5. Migration to cloud infrastructure for improved scalability and cost efficiency
      6. Implementation of advanced analytics capabilities to drive personalized customer experiences
    `,
    results: `
      The digital transformation initiative delivered significant quantifiable benefits:

      - 32% reduction in IT operational costs through cloud migration and system consolidation
      - 45% improvement in customer satisfaction scores within 12 months
      - 60% faster processing times for key customer transactions
      - 28% increase in mobile banking adoption
      - 15% increase in cross-selling opportunities through improved data analytics

      The bank has now positioned itself as a digital leader in the financial services industry and
      continues to leverage the new technology foundation to drive innovation and growth.
    `,
    client: {
      name: 'Global Financial Services, Inc.',
      industry: 'finance',
      logo: 'https://source.unsplash.com/random?bank',
      isAnonymous: false
    },
    featuredImage: 'https://source.unsplash.com/random?finance',
    metrics: [
      { name: 'Cost Reduction', value: '32%', icon: 'savings' },
      { name: 'Customer Satisfaction', value: '+45%', icon: 'thumb_up' },
      { name: 'Process Efficiency', value: '+60%', icon: 'speed' }
    ],
    testimonial: {
      quote: "The consulting team delivered beyond our expectations. Their methodical approach to our digital transformation not only addressed our immediate technical challenges but created a foundation for continued innovation.",
      author: "Sarah Johnson",
      position: "Chief Information Officer",
      company: "Global Financial Services, Inc.",
      image: "https://source.unsplash.com/random?executive"
    },
    serviceAreas: ['digital-transformation', 'technology'],
    technologies: ['Cloud Computing', 'API Architecture', 'Mobile Development', 'Data Analytics'],
    team: [
      { role: 'Project Lead' },
      { role: 'Digital Strategy Consultant' },
      { role: 'Solution Architect' },
      { role: 'UX/UI Designer' },
      { role: 'Data Scientist' }
    ],
    images: [
      { url: 'https://source.unsplash.com/random?banking', caption: 'Customer dashboard redesign', order: 1 },
      { url: 'https://source.unsplash.com/random?mobile-banking', caption: 'Mobile app experience', order: 2 },
      { url: 'https://source.unsplash.com/random?analytics', caption: 'Data analytics dashboard', order: 3 }
    ]
  };

  // Use placeholder case study during development and when data is loading
  const displayCaseStudy = caseStudy || placeholderCaseStudy;

  // Function to get industry icon
  const getIndustryIcon = (industry: string) => {
    return INDUSTRY_ICONS[industry] || <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
  };

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
          <Link href="/case-studies" passHref legacyBehavior>
            <Button variant="contained" color="primary">
              Return to Case Studies
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
          background: `linear-gradient(rgba(33, 150, 243, 0.85), rgba(33, 150, 243, 0.9)), url(${displayCaseStudy.featuredImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          py: 8,
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
            <Link href="/case-studies" color="inherit">Case Studies</Link>
            <Typography color="white">{displayCaseStudy.title}</Typography>
          </Breadcrumbs>

          {/* Client Industry Badge */}
          {displayCaseStudy.client?.industry && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {getIndustryIcon(displayCaseStudy.client.industry)}
              <Typography variant="h6" component="span" sx={{ ml: 1, opacity: 0.9 }}>
                {displayCaseStudy.client.industry.charAt(0).toUpperCase() + displayCaseStudy.client.industry.slice(1)} Industry
              </Typography>
            </Box>
          )}

          <Typography variant="h3" component="h1" gutterBottom>
            {displayCaseStudy.title}
          </Typography>
          <Typography variant="h6" component="p" sx={{ mb: 4, opacity: 0.9, maxWidth: 800 }}>
            {displayCaseStudy.summary}
          </Typography>

          {/* Client Information */}
          {!displayCaseStudy.client?.isAnonymous && displayCaseStudy.client?.name && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
              <Typography variant="subtitle1" component="span" sx={{ mr: 1 }}>
                Client:
              </Typography>
              <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
                {displayCaseStudy.client.name}
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Key Results Section */}
            {displayCaseStudy.metrics && displayCaseStudy.metrics.length > 0 && (
              <Paper elevation={0} sx={{
                p: 4,
                mb: 4,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Key Results
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  {displayCaseStudy.metrics.map((metric: any, index: number) => (
                    <Grid item xs={12} sm={4} key={index}>
                      <Box sx={{
                        textAlign: 'center',
                        p: 2,
                        height: '100%',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        borderRadius: 2,
                        backgroundColor: 'white'
                      }}>
                        <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {metric.value}
                        </Typography>
                        <Typography variant="body1">
                          {metric.name}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}

            {/* Challenge Section */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom color="error.main">
                Challenge
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {displayCaseStudy.challenge}
              </Typography>
            </Paper>

            {/* Solution Section */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom color="primary.main">
                Our Solution
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {displayCaseStudy.solution}
              </Typography>

              {/* Solution Images */}
              {displayCaseStudy.images && displayCaseStudy.images.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 3 }}>
                  {displayCaseStudy.images
                    .sort((a: any, b: any) => a.order - b.order)
                    .map((image: any, index: number) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Box sx={{ position: 'relative' }}>
                        <img
                          src={image.url}
                          alt={image.caption}
                          style={{
                            width: '100%',
                            borderRadius: '8px',
                            height: '180px',
                            objectFit: 'cover'
                          }}
                        />
                        {image.caption && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 1,
                              textAlign: 'center',
                              color: 'text.secondary'
                            }}
                          >
                            {image.caption}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>

            {/* Results Section */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom color="success.main">
                Results
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {displayCaseStudy.results}
              </Typography>

              {/* Social Sharing */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                mt: 4,
                pt: 3,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`
              }}>
                <Typography variant="subtitle1" component="span" sx={{ mr: 2, fontWeight: 'medium' }}>
                  Share this case study:
                </Typography>
                <SocialShare
                  title={displayCaseStudy.title}
                  url={typeof window !== 'undefined' ? window.location.href : ''}
                  size="small"
                />
              </Box>
            </Paper>

            {/* Testimonial Section */}
            {displayCaseStudy.testimonial && displayCaseStudy.testimonial.quote && (
              <Paper elevation={0} sx={{
                p: 4,
                mb: 4,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05)
              }}>
                <Box sx={{ display: 'flex', mb: 3 }}>
                  <QuoteIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h5" component="h2">
                    Client Testimonial
                  </Typography>
                </Box>
                <Typography variant="h6" component="p" sx={{
                  fontStyle: 'italic',
                  mb: 3,
                  position: 'relative',
                  pl: 2,
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                }}>
                  "{displayCaseStudy.testimonial.quote}"
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {displayCaseStudy.testimonial.image && (
                    <Avatar
                      src={displayCaseStudy.testimonial.image}
                      alt={displayCaseStudy.testimonial.author}
                      sx={{ width: 56, height: 56, mr: 2 }}
                    />
                  )}
                  <Box>
                    <Typography variant="subtitle1" component="p" sx={{ fontWeight: 'bold' }}>
                      {displayCaseStudy.testimonial.author}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {displayCaseStudy.testimonial.position}, {displayCaseStudy.testimonial.company}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Back to Case Studies */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 4 }}>
              <Link href="/case-studies" passHref legacyBehavior>
                <Button startIcon={<ArrowBackIcon />} color="primary">
                  Back to Case Studies
                </Button>
              </Link>
            </Box>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Service Areas */}
            {displayCaseStudy.serviceAreas && displayCaseStudy.serviceAreas.length > 0 && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  Service Areas
                </Typography>
                <List disablePadding>
                  {displayCaseStudy.serviceAreas.map((area: string, index: number) => {
                    const formattedArea = area.split('-').map(word =>
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ');

                    return (
                      <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                        <ListItemText
                          primary={formattedArea}
                          primaryTypographyProps={{
                            color: 'primary',
                            component: Link,
                            href: `/services#${area}`
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            )}

            {/* Technologies Used */}
            {displayCaseStudy.technologies && displayCaseStudy.technologies.length > 0 && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  Technologies Used
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {displayCaseStudy.technologies.map((technology: string, index: number) => (
                    <Chip
                      key={index}
                      label={technology}
                      size="small"
                      sx={{ bgcolor: 'background.default' }}
                    />
                  ))}
                </Box>
              </Paper>
            )}

            {/* Project Team */}
            {displayCaseStudy.team && displayCaseStudy.team.length > 0 && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  Project Team
                </Typography>
                <List disablePadding dense>
                  {displayCaseStudy.team.map((member: any, index: number) => (
                    <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemText
                        primary={member.role}
                        primaryTypographyProps={{ color: 'text.primary' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {/* Related Services */}
            {relatedServices && relatedServices.length > 0 && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  Related Services
                </Typography>
                <List disablePadding>
                  {relatedServices.map((service: any) => (
                    <ListItem key={service._id} disablePadding sx={{ mb: 2 }}>
                      <Box sx={{ width: '100%' }}>
                        <Link href={`/services/${service.slug}`} passHref legacyBehavior>
                          <Button
                            fullWidth
                            color="primary"
                            variant="outlined"
                            sx={{
                              justifyContent: 'flex-start',
                              textAlign: 'left',
                              p: 1.5,
                              height: 'auto'
                            }}
                            endIcon={<ArrowRightIcon />}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {service.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {service.shortDescription?.substring(0, 60)}...
                              </Typography>
                            </Box>
                          </Button>
                        </Link>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {/* CTA */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="h6" component="h3" gutterBottom>
                Need Similar Results?
              </Typography>
              <Typography variant="body2" paragraph>
                Our team of experts can help you achieve similar success with your business challenges.
              </Typography>
              <Link href="/contact" passHref legacyBehavior>
                <Button fullWidth variant="contained" color="primary" size="large" sx={{ mt: 1 }}>
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
