'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import { alpha, useTheme } from '@mui/material/styles';
import Link from 'next/link';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import HistoryIcon from '@mui/icons-material/History';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import FlagIcon from '@mui/icons-material/Flag';

// Company timeline milestones
const COMPANY_MILESTONES = [
  {
    year: '2010',
    title: 'Foundation',
    description: 'Consulting Platform was founded with a vision to transform how businesses approach strategic challenges.'
  },
  {
    year: '2013',
    title: 'International Expansion',
    description: 'Opened our first international office in London, beginning our global growth journey.'
  },
  {
    year: '2015',
    title: 'Digital Transformation Practice',
    description: 'Launched our Digital Transformation practice to help clients navigate the rapidly evolving technology landscape.'
  },
  {
    year: '2018',
    title: 'Strategic Acquisition',
    description: 'Acquired TechStrategy Partners, enhancing our technology implementation capabilities.'
  },
  {
    year: '2020',
    title: 'Remote Consulting Model',
    description: 'Pioneered a hybrid consulting model combining remote and on-site engagements for global accessibility.'
  },
  {
    year: '2023',
    title: 'AI & Innovation Center',
    description: 'Established our AI & Innovation Center to develop cutting-edge solutions for complex business challenges.'
  },
  {
    year: '2025',
    title: 'Global Recognition',
    description: 'Named among the top 10 consulting firms globally for client satisfaction and business impact.'
  }
];

// Company values
const COMPANY_VALUES = [
  {
    title: 'Client-Centricity',
    description: 'We place our clients at the center of everything we do, prioritizing their success above all else.'
  },
  {
    title: 'Innovation',
    description: 'We continuously seek new and better ways to solve problems and create value for our clients.'
  },
  {
    title: 'Integrity',
    description: 'We uphold the highest ethical standards and are committed to transparency in all our interactions.'
  },
  {
    title: 'Excellence',
    description: 'We strive for excellence in our work, continuously improving our knowledge and capabilities.'
  },
  {
    title: 'Collaboration',
    description: 'We believe in the power of diverse perspectives and collaborative problem-solving.'
  },
  {
    title: 'Impact',
    description: 'We measure our success by the tangible business outcomes we deliver for our clients.'
  }
];

// Leadership team
const LEADERSHIP_TEAM = [
  {
    name: 'Sarah Johnson',
    title: 'Chief Executive Officer',
    bio: 'Sarah brings over 20 years of experience in strategic consulting and has led the company through significant growth since becoming CEO in 2015.',
    image: 'https://source.unsplash.com/random?businesswoman1',
    linkedin: '#'
  },
  {
    name: 'Michael Chen',
    title: 'Chief Operating Officer',
    bio: 'Michael oversees our global operations and has been instrumental in scaling our delivery model across markets while maintaining exceptional quality.',
    image: 'https://source.unsplash.com/random?businessman1',
    linkedin: '#'
  },
  {
    name: 'Elena Rodriguez',
    title: 'Chief Strategy Officer',
    bio: 'Elena leads our strategy practice and brings deep expertise in helping organizations navigate complex transformations and market disruptions.',
    image: 'https://source.unsplash.com/random?businesswoman2',
    linkedin: '#'
  },
  {
    name: 'David Williams',
    title: 'Chief Technology Officer',
    bio: 'David guides our technology vision and has extensive experience implementing large-scale digital transformations across industries.',
    image: 'https://source.unsplash.com/random?businessman2',
    linkedin: '#'
  },
  {
    name: 'Priya Patel',
    title: 'Global Client Director',
    bio: 'Priya oversees our client relationships and ensures we consistently deliver exceptional value and experiences for organizations worldwide.',
    image: 'https://source.unsplash.com/random?businesswoman3',
    linkedin: '#'
  },
  {
    name: 'James Thompson',
    title: 'Head of Innovation',
    bio: 'James leads our innovation initiatives, identifying emerging trends and developing new service offerings that address evolving client needs.',
    image: 'https://source.unsplash.com/random?businessman3',
    linkedin: '#'
  }
];

export default function AboutPage() {
  const theme = useTheme();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom align="center">
            About Us
          </Typography>
          <Typography variant="h5" component="p" paragraph align="center" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            Dedicated to transforming organizations through strategic insight and actionable solutions
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Mission & Vision Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={6}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FlagIcon sx={{ color: 'primary.main', mr: 2, fontSize: 36 }} />
                <Typography variant="h4" component="h2">
                  Our Mission
                </Typography>
              </Box>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                To empower organizations to achieve exceptional performance through strategic insight,
                innovative thinking, and practical implementation that drives measurable business outcomes.
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                We partner with leaders across industries to navigate complex challenges,
                identify opportunities, and implement solutions that create sustainable competitive advantages.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmojiObjectsIcon sx={{ color: 'primary.main', mr: 2, fontSize: 36 }} />
                <Typography variant="h4" component="h2">
                  Our Vision
                </Typography>
              </Box>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                To be the most trusted partner for organizations seeking transformative growth
                and operational excellence in an increasingly complex global business environment.
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                We envision a world where businesses leverage cutting-edge strategies, technologies,
                and organizational approaches to create value for all stakeholders while adapting
                successfully to changing market dynamics.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Company Values */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Our Values
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 700, mx: 'auto' }}>
              These core principles guide how we work with our clients, partners, and each other.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {COMPANY_VALUES.map((value, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, index % 2 === 0 ? 0.05 : 0),
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                    }
                  }}
                >
                  <Typography variant="h6" component="h3" gutterBottom color="primary">
                    {value.title}
                  </Typography>
                  <Typography variant="body1">
                    {value.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Company History Timeline */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <HistoryIcon sx={{ color: 'primary.main', mr: 2, fontSize: 36 }} />
            <Typography variant="h4" component="h2">
              Our Journey
            </Typography>
          </Box>

          <Timeline position="alternate">
            {COMPANY_MILESTONES.map((milestone, index) => (
              <TimelineItem key={index}>
                <TimelineOppositeContent color="text.secondary">
                  <Typography variant="h6" component="span">
                    {milestone.year}
                  </Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={index % 2 === 0 ? "primary" : "secondary"} />
                  {index < COMPANY_MILESTONES.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    }}
                  >
                    <Typography variant="h6" component="h3" color="primary">
                      {milestone.title}
                    </Typography>
                    <Typography variant="body2">
                      {milestone.description}
                    </Typography>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Box>

        {/* Leadership Team */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <GroupsIcon sx={{ color: 'primary.main', mr: 2, fontSize: 36 }} />
            <Typography variant="h4" component="h2">
              Our Leadership
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {LEADERSHIP_TEAM.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 20px -10px rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height={240}
                    image={member.image}
                    alt={member.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h3">
                      {member.name}
                    </Typography>
                    <Typography gutterBottom variant="subtitle1" color="primary" component="p">
                      {member.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {member.bio}
                    </Typography>
                    <Box sx={{ display: 'flex', mt: 'auto' }}>
                      <Link href={member.linkedin} passHref legacyBehavior>
                        <Button startIcon={<LinkedInIcon />} size="small">
                          LinkedIn
                        </Button>
                      </Link>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Global Presence */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Our Global Presence
          </Typography>
          <Typography variant="body1" paragraph align="center" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
            With offices in key business centers around the world, we serve clients across industries and markets.
          </Typography>

          <Box sx={{ position: 'relative', height: 400, borderRadius: 4, overflow: 'hidden' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.2462147571856!2d-122.40052264956522!3d37.78752771908662!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808580632cb33983%3A0x39e39c8440701a26!2sTransamerica%20Pyramid!5e0!3m2!1sen!2sus!4v1661179898977!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Global Locations Map"
            ></iframe>
          </Box>
        </Box>

        {/* Join Our Team CTA */}
        <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), py: 6, px: 4, borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Join Our Team
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
            We're always looking for talented individuals who are passionate about helping organizations
            transform and achieve their full potential. Explore career opportunities with us.
          </Typography>
          <Link href="/careers" passHref legacyBehavior>
            <Button variant="contained" color="primary" size="large">
              View Career Opportunities
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
