'use client';

import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';
import { newsletterAPI } from '@/lib/api';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ArticleIcon from '@mui/icons-material/Article';
import BusinessIcon from '@mui/icons-material/Business';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HandshakeIcon from '@mui/icons-material/Handshake';
import DevicesIcon from '@mui/icons-material/Devices';

// Newsletter categories/topics
const NEWSLETTER_TOPICS = [
  {
    id: 'business-strategy',
    title: 'Business Strategy',
    description: 'Strategic insights for business growth and competitive advantage',
    icon: <BusinessIcon color="primary" fontSize="large" />
  },
  {
    id: 'market-trends',
    title: 'Market Trends',
    description: 'Analysis of industry trends, market dynamics, and economic insights',
    icon: <TrendingUpIcon color="primary" fontSize="large" />
  },
  {
    id: 'leadership',
    title: 'Leadership & Management',
    description: 'Best practices in leadership, team management, and organizational culture',
    icon: <HandshakeIcon color="primary" fontSize="large" />
  },
  {
    id: 'technology',
    title: 'Technology & Innovation',
    description: 'The latest in technology trends, digital transformation, and innovation strategies',
    icon: <DevicesIcon color="primary" fontSize="large" />
  }
];

// Newsletter benefits
const NEWSLETTER_BENEFITS = [
  'Exclusive industry insights and analysis not published elsewhere',
  'Early access to our research reports and white papers',
  'Invitations to webinars and events with industry experts',
  'Practical strategies and frameworks you can apply immediately',
  'Case studies showcasing successful transformations',
  'Curated content tailored to your interests and industry'
];

// Example newsletter previews
const NEWSLETTER_PREVIEWS = [
  {
    title: 'Digital Transformation Trends for 2025',
    date: 'May 2025',
    excerpt: 'Our analysis of the top digital transformation trends that will shape businesses in the coming year, including AI adoption, data strategies, and emerging technologies.',
    image: 'https://source.unsplash.com/random?digital'
  },
  {
    title: 'Building Resilient Supply Chains',
    date: 'April 2025',
    excerpt: 'A comprehensive look at strategies for creating resilient supply chains that can withstand disruptions and adapt to changing market conditions.',
    image: 'https://source.unsplash.com/random?supplychain'
  },
  {
    title: 'The Future of Work: Hybrid Models',
    date: 'March 2025',
    excerpt: 'Exploring how organizations are reimagining work models to balance remote flexibility with in-person collaboration for optimal productivity and engagement.',
    image: 'https://source.unsplash.com/random?work'
  }
];

export default function NewsletterPage() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    jobTitle: '',
    topics: [] as string[],
    consent: false
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    if (name === 'consent') {
      setFormData(prev => ({ ...prev, consent: checked }));

      // Clear consent error if checked
      if (checked && errors.consent) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.consent;
          return newErrors;
        });
      }
    } else {
      // For topic checkboxes
      const topicId = name.replace('topic-', '');
      setFormData(prev => {
        const updatedTopics = checked
          ? [...prev.topics, topicId]
          : prev.topics.filter(t => t !== topicId);

        return { ...prev, topics: updatedTopics };
      });

      // Clear topics error if any topic is selected
      if (checked && errors.topics) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.topics;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Topics validation
    if (formData.topics.length === 0) {
      newErrors.topics = 'Please select at least one topic';
    }

    // Consent validation
    if (!formData.consent) {
      newErrors.consent = 'You must agree to receive the newsletter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Format data for API
      const subscriberData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company || undefined,
        jobTitle: formData.jobTitle || undefined,
        interests: formData.topics,
        source: 'website-newsletter-page'
      };

      const response = await newsletterAPI.subscribe(subscriberData);

      setSnackbar({
        open: true,
        message: 'Thank you for subscribing to our newsletter!',
        severity: 'success'
      });

      setSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      setSnackbar({
        open: true,
        message: 'There was an error processing your subscription. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

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
            Newsletter
          </Typography>
          <Typography variant="h5" component="p" paragraph align="center" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            Stay updated with the latest insights, trends, and strategies for business success
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6}>
          {/* Left Column: Newsletter Information */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" component="h2" gutterBottom>
                Why Subscribe?
              </Typography>
              <Typography variant="body1" paragraph>
                Our newsletter delivers valuable insights and actionable strategies directly to your inbox,
                helping you stay ahead of industry trends and make informed business decisions.
              </Typography>

              <List>
                {NEWSLETTER_BENEFITS.map((benefit, index) => (
                  <ListItem key={index} sx={{ py: 1 }}>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={benefit} />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Newsletter Topics */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" component="h2" gutterBottom>
                Newsletter Topics
              </Typography>
              <Typography variant="body1" paragraph>
                Select the topics that interest you most to receive tailored content relevant to your needs.
              </Typography>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                {NEWSLETTER_TOPICS.map((topic) => (
                  <Grid item xs={12} sm={6} key={topic.id}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 2,
                        p: 2
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                          {topic.icon}
                          <Typography variant="h6" component="h3" sx={{ mt: 2, mb: 1 }}>
                            {topic.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {topic.description}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Newsletter Previews */}
            <Box>
              <Typography variant="h4" component="h2" gutterBottom>
                Recent Newsletters
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                Here's a preview of the valuable content our subscribers receive:
              </Typography>

              {NEWSLETTER_PREVIEWS.map((preview, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px -10px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      flexShrink: 0,
                      borderRadius: 2,
                      overflow: 'hidden',
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                    <img
                      src={preview.image}
                      alt={preview.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ArticleIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                      <Typography variant="caption" color="text.secondary">
                        {preview.date}
                      </Typography>
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {preview.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {preview.excerpt}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Grid>

          {/* Right Column: Subscription Form */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 2,
                position: 'sticky',
                top: 24,
                bgcolor: alpha(theme.palette.primary.main, 0.02)
              }}
            >
              {subscribed ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h4" component="h2" gutterBottom>
                    Thank You for Subscribing!
                  </Typography>
                  <Typography variant="body1" paragraph>
                    You've successfully subscribed to our newsletter. We've sent a confirmation
                    email to your inbox. Please check your email to confirm your subscription.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setSubscribed(false)}
                    sx={{ mt: 2 }}
                  >
                    Subscribe with a Different Email
                  </Button>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <MailOutlineIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                    <Typography variant="h4" component="h2">
                      Subscribe Now
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                    Complete the form below to receive our newsletter directly in your inbox.
                  </Typography>

                  <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      {/* First Name */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          id="firstName"
                          name="firstName"
                          label="First Name"
                          value={formData.firstName}
                          onChange={handleChange}
                          error={!!errors.firstName}
                          helperText={errors.firstName}
                        />
                      </Grid>

                      {/* Last Name */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          id="lastName"
                          name="lastName"
                          label="Last Name"
                          value={formData.lastName}
                          onChange={handleChange}
                          error={!!errors.lastName}
                          helperText={errors.lastName}
                        />
                      </Grid>

                      {/* Email */}
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          id="email"
                          name="email"
                          label="Email Address"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          error={!!errors.email}
                          helperText={errors.email}
                        />
                      </Grid>

                      {/* Company */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="company"
                          name="company"
                          label="Company (Optional)"
                          value={formData.company}
                          onChange={handleChange}
                        />
                      </Grid>

                      {/* Job Title */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="jobTitle"
                          name="jobTitle"
                          label="Job Title (Optional)"
                          value={formData.jobTitle}
                          onChange={handleChange}
                        />
                      </Grid>

                      {/* Topics */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Topics of Interest (select at least one):
                        </Typography>
                        {errors.topics && (
                          <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                            {errors.topics}
                          </Typography>
                        )}
                        <Grid container>
                          {NEWSLETTER_TOPICS.map((topic) => (
                            <Grid item xs={12} sm={6} key={topic.id}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name={`topic-${topic.id}`}
                                    checked={formData.topics.includes(topic.id)}
                                    onChange={handleCheckboxChange}
                                    color="primary"
                                  />
                                }
                                label={topic.title}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>

                      {/* Consent */}
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="consent"
                              checked={formData.consent}
                              onChange={handleCheckboxChange}
                              color="primary"
                              required
                            />
                          }
                          label="I agree to receive the newsletter and understand I can unsubscribe at any time."
                        />
                        {errors.consent && (
                          <Typography color="error" variant="body2">
                            {errors.consent}
                          </Typography>
                        )}
                      </Grid>

                      {/* Submit Button */}
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="large"
                          fullWidth
                          disabled={loading}
                          sx={{ mt: 2, py: 1.5 }}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Subscribe to Newsletter'}
                        </Button>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block' }}>
                          By subscribing, you agree to our Privacy Policy and consent to receive marketing communications.
                          We respect your privacy and will never share your information with third parties.
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
