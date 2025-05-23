'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useRouter } from 'next/navigation';
import { AppBar, Card, CardActions, CardContent, CardMedia, Divider, Toolbar } from '@mui/material';
import Link from 'next/link';
import BusinessIcon from '@mui/icons-material/Business';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import GroupIcon from '@mui/icons-material/Group';
import WorkIcon from '@mui/icons-material/Work';

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      title: 'Business Consulting',
      description: 'Strategic advisory services to optimize business performance and drive growth',
      icon: <BusinessIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    },
    {
      title: 'Market Analysis',
      description: 'Comprehensive market research and competitive analysis to identify opportunities',
      icon: <AnalyticsIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    },
    {
      title: 'Talent Management',
      description: 'Workforce planning and development strategies to build high-performing teams',
      icon: <GroupIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    },
    {
      title: 'Project Management',
      description: 'End-to-end project oversight ensuring timely delivery and quality outcomes',
      icon: <WorkIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    },
  ];

  const services = [
    {
      title: 'Strategy Consulting',
      description: 'Develop robust business strategies that drive sustainable growth and competitive advantage.',
      image: 'https://source.unsplash.com/random?strategy',
    },
    {
      title: 'Digital Transformation',
      description: 'Leverage technology to reimagine business processes, culture, and customer experiences.',
      image: 'https://source.unsplash.com/random?digital',
    },
    {
      title: 'Operations Excellence',
      description: 'Optimize operational processes to enhance efficiency, quality, and customer satisfaction.',
      image: 'https://source.unsplash.com/random?operations',
    },
  ];

  return (
    <Box>
      {/* Navigation */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Consulting Platform
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit">About</Button>
            <Link href="/services" passHref legacyBehavior>
              <Button color="inherit">Services</Button>
            </Link>
            <Link href="/case-studies" passHref legacyBehavior>
              <Button color="inherit">Case Studies</Button>
            </Link>
            <Link href="/blog" passHref legacyBehavior>
              <Button color="inherit">Blog</Button>
            </Link>
            <Link href="/contact" passHref legacyBehavior>
              <Button color="inherit">Contact</Button>
            </Link>
            <Link href="/login" passHref legacyBehavior>
              <Button variant="outlined" color="primary">Sign In</Button>
            </Link>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          py: 10,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom>
            Empower Your Business Growth
          </Typography>
          <Typography variant="h5" component="p" paragraph sx={{ mb: 4 }}>
            Strategic consulting services to transform your organization and drive sustainable success
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Link href="/register" passHref legacyBehavior>
              <Button variant="contained" color="secondary" size="large">
                Get Started
              </Button>
            </Link>
            <Button variant="outlined" sx={{ color: 'white', borderColor: 'white' }} size="large">
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Our Expertise
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          Comprehensive consulting services tailored to your unique business needs
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 2,
                  transition: '0.3s',
                  '&:hover': {
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                {feature.icon}
                <Typography variant="h6" component="h3" sx={{ mt: 2, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider />

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Our Services
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          Tailored solutions to address your most complex business challenges
        </Typography>

        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={service.image}
                  alt={service.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h3">
                    {service.title}
                  </Typography>
                  <Typography>
                    {service.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link href={`/services#${service.title.toLowerCase().replace(/\s+/g, '-')}`} passHref legacyBehavior>
                    <Button size="small">Learn More</Button>
                  </Link>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to Transform Your Business?
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Our team of expert consultants is ready to help you achieve your business goals.
          </Typography>
          <Link href="/register" passHref legacyBehavior>
            <Button variant="contained" color="primary" size="large">
              Get Started Today
            </Button>
          </Link>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Consulting Platform
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transforming businesses through strategic consulting and innovative solutions.
              </Typography>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="subtitle1" color="text.primary" gutterBottom>
                Company
              </Typography>
              <Link href="#" passHref legacyBehavior>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', mb: 0.5 }}>
                  About
                </Typography>
              </Link>
              <Link href="#" passHref legacyBehavior>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', mb: 0.5 }}>
                  Team
                </Typography>
              </Link>
              <Link href="#" passHref legacyBehavior>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', mb: 0.5 }}>
                  Careers
                </Typography>
              </Link>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="subtitle1" color="text.primary" gutterBottom>
                Resources
              </Typography>
              <Link href="/blog" passHref legacyBehavior>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', mb: 0.5 }}>
                  Blog
                </Typography>
              </Link>
              <Link href="/case-studies" passHref legacyBehavior>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', mb: 0.5 }}>
                  Case Studies
                </Typography>
              </Link>
              <Link href="#" passHref legacyBehavior>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', mb: 0.5 }}>
                  Guides
                </Typography>
              </Link>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="subtitle1" color="text.primary" gutterBottom>
                Legal
              </Typography>
              <Link href="#" passHref legacyBehavior>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', mb: 0.5 }}>
                  Privacy
                </Typography>
              </Link>
              <Link href="#" passHref legacyBehavior>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', mb: 0.5 }}>
                  Terms
                </Typography>
              </Link>
            </Grid>
          </Grid>
          <Box mt={5}>
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Consulting Platform. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
