import * as React from 'react';
import { useState } from 'react';
import {
  Paper, Typography, Box, TextField, Button, Grid, MenuItem,
  Checkbox, FormControlLabel, Alert, Snackbar, CircularProgress,
  FormGroup, FormControl, InputLabel, Select, Chip, useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SubjectIcon from '@mui/icons-material/Subject';
import MessageIcon from '@mui/icons-material/Message';
import notificationService from '@/lib/notificationService';

// Define possible service interests
const SERVICE_INTERESTS = [
  'Business Strategy',
  'Digital Transformation',
  'Financial Advisory',
  'IT Consulting',
  'Market Research',
  'Operations Excellence',
  'Technology Implementation',
  'Other'
];

// Define budget ranges
const BUDGET_RANGES = [
  { value: 'under-10k', label: 'Under $10,000' },
  { value: '10k-50k', label: '$10,000 - $50,000' },
  { value: '50k-100k', label: '$50,000 - $100,000' },
  { value: '100k-250k', label: '$100,000 - $250,000' },
  { value: 'over-250k', label: 'Over $250,000' },
  { value: 'not-sure', label: 'Not sure yet' }
];

// Define how the user heard about us options
const HEARD_ABOUT_OPTIONS = [
  'Search Engine',
  'Social Media',
  'Referral',
  'Industry Event',
  'Advertisement',
  'News/Publication',
  'Other'
];

interface ContactFormHandlerProps {
  title?: string;
  subtitle?: string;
  includeServices?: boolean;
  includeBudget?: boolean;
  includeTimeline?: boolean;
  includeHeardAbout?: boolean;
  fullWidth?: boolean;
  variant?: 'standard' | 'detailed';
  showCompanyName?: boolean;
  redirectUrl?: string;
  onSubmitSuccess?: (data: any) => void;
  onSubmitError?: (error: any) => void;
  buttonText?: string;
}

export default function ContactFormHandler({
  title = "Contact Us",
  subtitle = "Fill out the form below and we'll get back to you as soon as possible.",
  includeServices = true,
  includeBudget = true,
  includeTimeline = true,
  includeHeardAbout = true,
  fullWidth = true,
  variant = 'standard',
  showCompanyName = true,
  redirectUrl,
  onSubmitSuccess,
  onSubmitError,
  buttonText = "Send Message"
}: ContactFormHandlerProps) {
  const theme = useTheme();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    interests: [] as string[],
    budget: '',
    timeline: '',
    heardAbout: '',
    newsletter: false,
    terms: false
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Field change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Mark field as touched on change
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  // Checkbox change handler
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  // Select change handler for multi-select
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  // Interest selection handler
  const handleInterestsChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string[];
    setFormData({ ...formData, interests: value });
    if (!touched.interests) {
      setTouched({ ...touched, interests: true });
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill out all required fields.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Terms agreement check (if it's a detailed form with newsletter option)
    if (variant === 'detailed' && !formData.terms) {
      setError('You must agree to the terms and conditions.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send the form data using notificationService
      const result = await notificationService.sendContactFormNotification(formData);

      if (result) {
        // Show success message
        setShowSuccess(true);

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          subject: '',
          message: '',
          interests: [],
          budget: '',
          timeline: '',
          heardAbout: '',
          newsletter: false,
          terms: false
        });

        // Reset touched state
        setTouched({});

        // Call success callback if provided
        if (onSubmitSuccess) {
          onSubmitSuccess(formData);
        }

        // Redirect if URL provided
        if (redirectUrl) {
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 2000);
        }
      } else {
        throw new Error('Failed to submit the form. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError('Failed to submit the form. Please try again later.');

      // Call error callback if provided
      if (onSubmitError) {
        onSubmitError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if field has error
  const hasError = (field: string): boolean => {
    if (!touched[field]) return false;

    switch (field) {
      case 'name':
      case 'email':
      case 'message':
        return !formData[field as keyof typeof formData];
      case 'terms':
        return variant === 'detailed' && !formData.terms;
      case 'email-format':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return touched.email && !emailRegex.test(formData.email);
      default:
        return false;
    }
  };

  return (
    <Paper
      elevation={variant === 'detailed' ? 3 : 1}
      sx={{
        p: variant === 'detailed' ? 4 : 3,
        maxWidth: fullWidth ? '100%' : 600,
        mx: fullWidth ? 0 : 'auto',
        bgcolor: theme.palette.background.paper
      }}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>

        {subtitle && (
          <Typography variant="body1" color="text.secondary" paragraph>
            {subtitle}
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="name"
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              error={hasError('name')}
              helperText={hasError('name') ? 'Name is required' : ''}
              InputProps={{
                startAdornment: variant === 'detailed' ? <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} /> : undefined
              }}
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
              error={hasError('email') || hasError('email-format')}
              helperText={
                hasError('email')
                  ? 'Email is required'
                  : hasError('email-format')
                    ? 'Please enter a valid email address'
                    : ''
              }
              InputProps={{
                startAdornment: variant === 'detailed' ? <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} /> : undefined
              }}
            />
          </Grid>

          {/* Phone */}
          <Grid item xs={12} sm={showCompanyName ? 6 : 12}>
            <TextField
              fullWidth
              id="phone"
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              InputProps={{
                startAdornment: variant === 'detailed' ? <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} /> : undefined
              }}
            />
          </Grid>

          {/* Company */}
          {showCompanyName && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="company"
                name="company"
                label="Company Name"
                value={formData.company}
                onChange={handleChange}
                InputProps={{
                  startAdornment: variant === 'detailed' ? <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} /> : undefined
                }}
              />
            </Grid>
          )}

          {/* Subject */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="subject"
              name="subject"
              label="Subject"
              value={formData.subject}
              onChange={handleChange}
              InputProps={{
                startAdornment: variant === 'detailed' ? <SubjectIcon sx={{ mr: 1, color: 'text.secondary' }} /> : undefined
              }}
            />
          </Grid>

          {/* Service Interests (if included) */}
          {includeServices && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="interests-label">Services of Interest</InputLabel>
                <Select
                  labelId="interests-label"
                  id="interests"
                  name="interests"
                  multiple
                  value={formData.interests}
                  onChange={handleInterestsChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {SERVICE_INTERESTS.map((service) => (
                    <MenuItem key={service} value={service}>
                      {service}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Budget (if included) */}
          {includeBudget && (
            <Grid item xs={12} sm={includeTimeline ? 6 : 12}>
              <FormControl fullWidth>
                <InputLabel id="budget-label">Budget Range</InputLabel>
                <Select
                  labelId="budget-label"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleSelectChange}
                  label="Budget Range"
                >
                  <MenuItem value="">
                    <em>Select a range</em>
                  </MenuItem>
                  {BUDGET_RANGES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Timeline (if included) */}
          {includeTimeline && (
            <Grid item xs={12} sm={includeBudget ? 6 : 12}>
              <FormControl fullWidth>
                <InputLabel id="timeline-label">Project Timeline</InputLabel>
                <Select
                  labelId="timeline-label"
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleSelectChange}
                  label="Project Timeline"
                >
                  <MenuItem value="">
                    <em>Select a timeline</em>
                  </MenuItem>
                  <MenuItem value="immediate">Immediate (ASAP)</MenuItem>
                  <MenuItem value="1-3-months">1-3 months</MenuItem>
                  <MenuItem value="3-6-months">3-6 months</MenuItem>
                  <MenuItem value="6-12-months">6-12 months</MenuItem>
                  <MenuItem value="12+months">12+ months</MenuItem>
                  <MenuItem value="not-sure">Not sure yet</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* How they heard about us (if included) */}
          {includeHeardAbout && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="heard-about-label">How did you hear about us?</InputLabel>
                <Select
                  labelId="heard-about-label"
                  id="heardAbout"
                  name="heardAbout"
                  value={formData.heardAbout}
                  onChange={handleSelectChange}
                  label="How did you hear about us?"
                >
                  <MenuItem value="">
                    <em>Select an option</em>
                  </MenuItem>
                  {HEARD_ABOUT_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Message */}
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="message"
              name="message"
              label="Message"
              multiline
              rows={5}
              value={formData.message}
              onChange={handleChange}
              error={hasError('message')}
              helperText={hasError('message') ? 'Message is required' : ''}
              InputProps={{
                startAdornment: variant === 'detailed' ? (
                  <MessageIcon sx={{ mr: 1, mt: 1, color: 'text.secondary', alignSelf: 'flex-start' }} />
                ) : undefined
              }}
            />
          </Grid>

          {/* Newsletter opt-in checkbox */}
          {variant === 'detailed' && (
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="newsletter"
                      checked={formData.newsletter}
                      onChange={handleCheckboxChange}
                      color="primary"
                    />
                  }
                  label="Subscribe to our newsletter for industry insights and updates"
                />
                <FormControlLabel
                  required
                  control={
                    <Checkbox
                      name="terms"
                      checked={formData.terms}
                      onChange={handleCheckboxChange}
                      color="primary"
                      required
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the{' '}
                      <Typography
                        component="a"
                        variant="body2"
                        color="primary"
                        href="/terms"
                        target="_blank"
                      >
                        terms and conditions
                      </Typography>{' '}
                      and{' '}
                      <Typography
                        component="a"
                        variant="body2"
                        color="primary"
                        href="/privacy"
                        target="_blank"
                      >
                        privacy policy
                      </Typography>
                    </Typography>
                  }
                />
              </FormGroup>
              {hasError('terms') && (
                <Typography color="error" variant="caption">
                  You must agree to the terms and conditions
                </Typography>
              )}
            </Grid>
          )}

          {/* Submit button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              fullWidth={variant === 'standard'}
              sx={{ mt: 2 }}
            >
              {loading ? 'Sending...' : buttonText}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Success snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Thank you! Your message has been sent successfully. We'll get back to you soon.
        </Alert>
      </Snackbar>
    </Paper>
  );
}
