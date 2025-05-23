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
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { contactFormAPI } from '@/lib/api';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Office locations
const OFFICE_LOCATIONS = [
  {
    name: 'Headquarters',
    address: '123 Business Avenue, Suite 500',
    city: 'New York, NY 10001',
    country: 'United States',
    phone: '+1 (212) 555-7890',
    email: 'info@consultingplatform.com',
    hours: 'Monday - Friday: 9:00 AM - 6:00 PM',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.982952908796!2d-73.98825082373116!3d40.7486832713883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9aeb1c6b5%3A0x35b1cfbc89a6097f!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1629375619339!5m2!1sen!2sus'
  },
  {
    name: 'West Coast Office',
    address: '555 Tech Boulevard',
    city: 'San Francisco, CA 94105',
    country: 'United States',
    phone: '+1 (415) 555-1234',
    email: 'westcoast@consultingplatform.com',
    hours: 'Monday - Friday: 8:30 AM - 5:30 PM',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0981346814388!2d-122.40058238469213!3d37.78602997975724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085807abad77a61%3A0x1c9a3599f37c6905!2sSalesforce%20Tower!5e0!3m2!1sen!2sus!4v1629375727339!5m2!1sen!2sus'
  },
  {
    name: 'European Office',
    address: '10 Financial Square',
    city: 'London, EC2N 1AD',
    country: 'United Kingdom',
    phone: '+44 20 7946 0958',
    email: 'europe@consultingplatform.com',
    hours: 'Monday - Friday: 9:00 AM - 5:30 PM',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.22599631215!2d-0.08441042385505414!3d51.513498579536716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4876035159bb13c5%3A0xde0d55a0b8721867!2sThe%20Gherkin!5e0!3m2!1sen!2sus!4v1629375942339!5m2!1sen!2sus'
  }
];

// Service interest options
const SERVICE_INTERESTS = [
  { value: '', label: 'Select a service' },
  { value: 'business-strategy', label: 'Business Strategy' },
  { value: 'digital-transformation', label: 'Digital Transformation' },
  { value: 'operations-excellence', label: 'Operations Excellence' },
  { value: 'technology-implementation', label: 'Technology Implementation' },
  { value: 'market-analysis', label: 'Market Analysis' },
  { value: 'leadership-development', label: 'Leadership Development' },
  { value: 'other', label: 'Other (please specify)' },
];

// Initial form state
const initialFormState = {
  name: '',
  email: '',
  phone: '',
  company: '',
  serviceInterest: '',
  subject: '',
  message: '',
};

export default function ContactPage() {
  const theme = useTheme();
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await contactFormAPI.submitContactForm({
        ...formData,
        source: 'website-contact-form'
      });

      setSnackbar({
        open: true,
        message: 'Thank you for your message! We will get back to you soon.',
        severity: 'success'
      });

      setFormSubmitted(true);
      setFormData(initialFormState);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSnackbar({
        open: true,
        message: 'There was an error submitting your message. Please try again later.',
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
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom align="center">
            Contact Us
          </Typography>
          <Typography variant="h5" component="p" paragraph align="center" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            Reach out to our team of experts to discuss how we can help your business grow and succeed
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={4}>
          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
              {formSubmitted ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                  <Typography variant="h4" component="h2" gutterBottom>
                    Thank You!
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Your message has been sent successfully. One of our team members will get back to you shortly.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setFormSubmitted(false)}
                    sx={{ mt: 2 }}
                  >
                    Send Another Message
                  </Button>
                </Box>
              ) : (
                <>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Send Us a Message
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Fill out the form below and our team will respond as soon as possible.
                  </Typography>

                  <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
                    <Grid container spacing={3}>
                      {/* Name */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          id="name"
                          name="name"
                          label="Your Name"
                          value={formData.name}
                          onChange={handleChange}
                          error={!!errors.name}
                          helperText={errors.name}
                        />
                      </Grid>

                      {/* Email */}
                      <Grid item xs={12} sm={6}>
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

                      {/* Phone */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="phone"
                          name="phone"
                          label="Phone Number"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </Grid>

                      {/* Company */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="company"
                          name="company"
                          label="Company Name"
                          value={formData.company}
                          onChange={handleChange}
                        />
                      </Grid>

                      {/* Service Interest */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="serviceInterest"
                          name="serviceInterest"
                          select
                          label="Service Interest"
                          value={formData.serviceInterest}
                          onChange={handleChange}
                        >
                          {SERVICE_INTERESTS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      {/* Subject */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          id="subject"
                          name="subject"
                          label="Subject"
                          value={formData.subject}
                          onChange={handleChange}
                          error={!!errors.subject}
                          helperText={errors.subject}
                        />
                      </Grid>

                      {/* Message */}
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          id="message"
                          name="message"
                          label="Your Message"
                          multiline
                          rows={6}
                          value={formData.message}
                          onChange={handleChange}
                          error={!!errors.message}
                          helperText={errors.message}
                        />
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
                          sx={{ mt: 2 }}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Send Message'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Get in Touch
              </Typography>
              <Typography variant="body1" paragraph>
                Have questions or need more information? Our team is here to help you with any inquiries.
              </Typography>

              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', mb: 3 }}>
                  <PhoneIcon sx={{ color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Phone
                    </Typography>
                    <Typography variant="body2">
                      <Link href="tel:+12125557890" style={{ textDecoration: 'none', color: 'inherit' }}>
                        +1 (212) 555-7890
                      </Link>
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', mb: 3 }}>
                  <EmailIcon sx={{ color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Email
                    </Typography>
                    <Typography variant="body2">
                      <Link href="mailto:info@consultingplatform.com" style={{ textDecoration: 'none', color: 'inherit' }}>
                        info@consultingplatform.com
                      </Link>
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex' }}>
                  <AccessTimeIcon sx={{ color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Business Hours
                    </Typography>
                    <Typography variant="body2">
                      Monday - Friday: 9:00 AM - 6:00 PM EST
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Follow Us */}
            <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2, mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Follow Us
              </Typography>
              <Typography variant="body2" paragraph>
                Stay connected with us on our social media channels for the latest updates, insights, and news.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Link href="#" passHref legacyBehavior>
                  <Button variant="outlined" color="primary">LinkedIn</Button>
                </Link>
                <Link href="#" passHref legacyBehavior>
                  <Button variant="outlined" color="primary">Twitter</Button>
                </Link>
                <Link href="#" passHref legacyBehavior>
                  <Button variant="outlined" color="primary">Facebook</Button>
                </Link>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Office Locations */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Our Offices
          </Typography>
          <Typography variant="body1" paragraph align="center" sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}>
            With locations around the world, our global team of consultants is ready to serve you, wherever you are.
          </Typography>

          <Grid container spacing={4}>
            {OFFICE_LOCATIONS.map((office, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ height: 200 }}>
                    <iframe
                      src={office.mapUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Map of ${office.name}`}
                    ></iframe>
                  </Box>
                  <Box sx={{ p: 3, flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {office.name}
                    </Typography>

                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <LocationOnIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        {office.address}<br />
                        {office.city}<br />
                        {office.country}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <PhoneIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        <Link href={`tel:${office.phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {office.phone}
                        </Link>
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <EmailIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        <Link href={`mailto:${office.email}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {office.email}
                        </Link>
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex' }}>
                      <AccessTimeIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        {office.hours}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* FAQ and Support */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Need More Help?
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
            Check out our frequently asked questions or visit our support center for additional resources.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
            <Link href="/faq" passHref legacyBehavior>
              <Button variant="outlined" color="primary" size="large">
                View FAQ
              </Button>
            </Link>
            <Link href="/support" passHref legacyBehavior>
              <Button variant="contained" color="primary" size="large">
                Support Center
              </Button>
            </Link>
          </Box>
        </Box>
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
