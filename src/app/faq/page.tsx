'use client';

import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';
import Link from 'next/link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// FAQ categories
const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Questions' },
  { id: 'services', label: 'Our Services' },
  { id: 'process', label: 'Our Process' },
  { id: 'pricing', label: 'Pricing & Billing' },
  { id: 'projects', label: 'Projects & Delivery' },
  { id: 'company', label: 'About Our Company' },
];

// FAQ items
const FAQ_ITEMS = [
  {
    id: 1,
    question: 'What services does your consulting firm offer?',
    answer: `Our consulting firm offers a comprehensive range of services including:

    • Business Strategy Consulting
    • Digital Transformation
    • Operations Excellence
    • Technology Implementation
    • Leadership Development
    • Market Analysis and Research
    • Change Management
    • Project Management

    Each service is tailored to meet the specific needs of our clients, helping them overcome challenges and achieve their business objectives.`,
    category: 'services'
  },
  {
    id: 2,
    question: 'How do you typically work with clients?',
    answer: `Our engagement process typically follows these steps:

    1. Initial Consultation: We meet with you to understand your challenges, goals, and requirements.

    2. Assessment & Discovery: We conduct a thorough analysis of your current situation, including stakeholder interviews, data analysis, and market research.

    3. Strategy Development: We work with your team to develop a customized strategy and implementation plan.

    4. Implementation Support: We provide guidance and support throughout the implementation phase, ensuring the strategy is executed effectively.

    5. Monitoring & Optimization: We track results, measure outcomes, and make adjustments as needed to ensure success.

    Throughout the process, we maintain regular communication and collaboration with your team.`,
    category: 'process'
  },
  {
    id: 3,
    question: 'What industries do you specialize in?',
    answer: `We have extensive experience across multiple industries, with particular expertise in:

    • Financial Services
    • Healthcare
    • Technology
    • Manufacturing
    • Retail and Consumer Goods
    • Professional Services
    • Education

    Our team includes consultants with deep industry-specific knowledge, allowing us to provide relevant insights and solutions for each sector.`,
    category: 'company'
  },
  {
    id: 4,
    question: 'How do you price your consulting services?',
    answer: `We offer flexible pricing models to accommodate different project needs and client preferences:

    • Project-Based Pricing: A fixed fee for clearly defined projects with specific deliverables and timelines.

    • Retainer Model: Monthly or quarterly fees for ongoing strategic support and advisory services.

    • Value-Based Pricing: Fee structures tied to quantifiable business outcomes and results.

    • Time and Materials: Hourly or daily rates for projects where scope may evolve.

    During our initial consultation, we'll discuss which pricing model is most appropriate for your needs and provide transparent cost estimates.`,
    category: 'pricing'
  },
  {
    id: 5,
    question: 'What is your approach to digital transformation?',
    answer: `Our approach to digital transformation is holistic and focused on sustainable business value. We believe successful digital transformation requires alignment across four key dimensions:

    • Strategy: Defining a clear vision and roadmap for how digital capabilities will create business value.

    • People & Culture: Developing the necessary skills, mindsets, and organizational structures.

    • Processes: Redesigning workflows and operations to leverage digital capabilities.

    • Technology: Implementing the right platforms, tools, and systems to enable transformation.

    We work closely with clients to assess their digital maturity, identify high-impact opportunities, and develop realistic implementation plans that deliver measurable results.`,
    category: 'services'
  },
  {
    id: 6,
    question: 'How long does a typical consulting project take?',
    answer: `Project timelines vary significantly based on scope, complexity, and client needs. Typical timeframes include:

    • Strategic Assessments: 4-8 weeks
    • Strategy Development: 6-12 weeks
    • Implementation Support: 3-12 months
    • Organizational Transformation: 1-2+ years

    During our initial consultation, we'll discuss your specific requirements and provide a more precise timeline for your project. We're committed to working at a pace that allows for meaningful change while respecting your organization's capacity to absorb and implement new approaches.`,
    category: 'projects'
  },
  {
    id: 7,
    question: 'Do you offer implementation support or just strategy?',
    answer: `We offer both strategic guidance and implementation support. While some consulting firms focus only on delivering recommendations, we believe in partnering with our clients throughout the entire journey:

    • Strategy Development: We help define your vision, objectives, and roadmap.

    • Implementation Planning: We design detailed action plans, resource requirements, and timelines.

    • Execution Support: We provide hands-on guidance during implementation, helping navigate challenges and ensuring alignment with strategic objectives.

    • Capability Building: We transfer knowledge and skills to your team, ensuring sustainable results after our engagement ends.

    Our focus is on achieving tangible outcomes, not just delivering reports.`,
    category: 'services'
  },
  {
    id: 8,
    question: 'How do you measure the success of your consulting projects?',
    answer: `We measure success through a combination of quantitative metrics and qualitative assessments:

    • Business Outcomes: Measurable improvements in financial performance, operational efficiency, market share, or other key business metrics.

    • Project Deliverables: Successful completion of agreed-upon deliverables, milestones, and objectives.

    • Capability Development: Enhanced internal capabilities and knowledge transfer to client teams.

    • Client Satisfaction: Feedback from stakeholders on the quality of our work and the value delivered.

    Before beginning any engagement, we work with clients to define specific success criteria and establish mechanisms to track and report progress throughout the project.`,
    category: 'projects'
  },
  {
    id: 9,
    question: 'What sets your consulting firm apart from others?',
    answer: `Several factors distinguish our firm:

    • Results-Focused Approach: We measure our success by the tangible outcomes we deliver for clients, not by the deliverables we produce.

    • Collaborative Methodology: We work as partners with our clients, transferring knowledge and building internal capabilities.

    • Practical Solutions: We provide actionable recommendations that can be implemented in real-world contexts.

    • Industry Expertise: Our consultants bring deep industry-specific knowledge and experience.

    • Customized Approach: We tailor our methodologies to fit each client's unique situation rather than applying a one-size-fits-all framework.

    • Ongoing Support: We maintain relationships with clients beyond project completion to ensure lasting impact.

    Our high client retention rate and track record of long-term partnerships speak to the value we consistently deliver.`,
    category: 'company'
  },
  {
    id: 10,
    question: 'How do you ensure client confidentiality?',
    answer: `We take confidentiality extremely seriously. Our approach includes:

    • Comprehensive NDAs: We establish clear confidentiality agreements before any engagement begins.

    • Secure Data Management: We maintain strict protocols for handling, storing, and transferring client information.

    • Access Controls: We limit access to client data to only those team members directly involved in the project.

    • Employee Training: All consultants receive regular training on confidentiality best practices.

    • Reference Protocol: We never disclose client relationships or discuss specific work without explicit permission.

    • Secure Communication: We use encrypted channels for sharing sensitive information.

    We understand the sensitive nature of our work and are committed to protecting your information at all times.`,
    category: 'company'
  },
  {
    id: 11,
    question: 'Can you provide references from past clients?',
    answer: `Yes, we can provide references from past clients upon request, subject to confidentiality agreements. We have a portfolio of case studies and client testimonials across various industries and project types.

    During the proposal process, we can connect you with relevant past clients who have authorized us to discuss our work with them. These references can provide insights into our working relationship, approach, and the results we've helped them achieve.

    Additionally, we can share anonymized case studies that demonstrate our capabilities and impact in situations similar to yours.`,
    category: 'company'
  },
  {
    id: 12,
    question: 'What is your billing structure?',
    answer: `Our billing structure is designed to be transparent and aligned with the project type and client preferences:

    • Fixed-Fee Projects: For projects with a clearly defined scope, we typically bill in installments tied to project milestones (e.g., 30% upfront, 40% at midpoint, 30% upon completion).

    • Retainer Arrangements: For ongoing advisory services, we bill monthly or quarterly in advance.

    • Time and Materials: When billing on an hourly or daily basis, we provide detailed timesheets and invoice monthly.

    • Expenses: Project-related expenses (travel, accommodations, specialized software, etc.) are either included in the fixed fee or billed at cost without markup, depending on the agreement.

    We're committed to financial transparency and will provide clear documentation of all charges.`,
    category: 'pricing'
  },
  {
    id: 13,
    question: 'Do you offer any guarantees on your work?',
    answer: `While the nature of consulting work makes formal guarantees challenging due to the many factors outside our control, we demonstrate our commitment to quality in several ways:

    • Satisfaction Commitment: We're committed to client satisfaction and will work to address any concerns about our deliverables or approach.

    • Milestone-Based Billing: We typically structure payments around the achievement of specific milestones, ensuring you see value before making full payment.

    • Performance-Based Components: For certain projects, we can incorporate performance-based fee structures where a portion of our compensation is tied to achieving specific outcomes.

    • Ongoing Support: We provide support during the implementation phase to help ensure successful execution of our recommendations.

    Our reputation is built on delivering meaningful results, and we stand behind the quality of our work.`,
    category: 'pricing'
  },
  {
    id: 14,
    question: 'What happens after the consulting project ends?',
    answer: `Our relationship with clients often extends beyond the formal end of a project:

    • Knowledge Transfer: Throughout the engagement, we focus on transferring skills and knowledge to your team to ensure sustainability.

    • Implementation Support: We can provide ongoing implementation support, either as part of the original scope or through a follow-on engagement.

    • Check-In Cadence: We establish a cadence of check-ins following project completion to monitor progress and address any challenges.

    • Additional Resources: We provide documentation, tools, and frameworks that your team can continue to use.

    • Alumni Program: Many clients join our alumni program for ongoing access to research, events, and networking opportunities.

    • Relationship Management: A dedicated relationship manager remains available to discuss future needs or challenges.

    Our goal is to build long-term partnerships that deliver continuing value, not just complete isolated projects.`,
    category: 'projects'
  },
  {
    id: 15,
    question: 'How do you stay current with industry trends and best practices?',
    answer: `We maintain our expertise through multiple channels:

    • Continuous Learning: Our consultants dedicate time to ongoing professional development and skill building.

    • Research Program: We conduct original research into emerging trends and best practices across industries.

    • Innovation Lab: Our internal innovation lab experiments with new methodologies and technologies.

    • Academic Partnerships: We collaborate with leading business schools and research institutions.

    • Industry Involvement: Our team members actively participate in industry associations and conferences.

    • Practitioner Network: We maintain a network of industry practitioners who provide real-world insights.

    • Technology Partnerships: We partner with leading technology providers to stay current on emerging solutions.

    This multi-faceted approach ensures we bring the latest thinking and proven approaches to our client work.`,
    category: 'company'
  }
];

export default function FAQPage() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<number | false>(false);

  // Filter questions based on category and search query
  const filteredFAQs = FAQ_ITEMS.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
  };

  const handleAccordionChange = (panelId: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedId(isExpanded ? panelId : false);
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
            Frequently Asked Questions
          </Typography>
          <Typography variant="h5" component="p" paragraph align="center" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            Find answers to common questions about our services, process, and approach
          </Typography>

          {/* Search Box */}
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <TextField
              fullWidth
              placeholder="Search questions..."
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'white' }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  }
                }
              }}
              InputLabelProps={{
                style: { color: 'white' },
              }}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Category Tabs */}
        <Box sx={{ mb: 4 }}>
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
            {FAQ_CATEGORIES.map((category) => (
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

        {/* FAQ Accordions */}
        <Box sx={{ mb: 8 }}>
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <Accordion
                key={faq.id}
                expanded={expandedId === faq.id}
                onChange={handleAccordionChange(faq.id)}
                sx={{
                  mb: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px !important',
                  '&:before': {
                    display: 'none',
                  },
                  '&.Mui-expanded': {
                    margin: '0 0 16px 0',
                    boxShadow: '0 4px 20px -10px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      margin: '16px 0',
                    }
                  }}
                >
                  <Typography variant="h6" component="h3" sx={{ fontWeight: expandedId === faq.id ? 'bold' : 'medium' }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 3 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-line',
                      color: 'text.secondary',
                      lineHeight: 1.7
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 2,
                textAlign: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.05)
              }}
            >
              <HelpOutlineIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.7, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Questions Found
              </Typography>
              <Typography variant="body1" paragraph>
                We couldn't find any questions matching your criteria. Please try a different search term or category.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </Paper>
          )}
        </Box>

        {/* Still Have Questions */}
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Divider sx={{ mb: 6 }} />
          <Typography variant="h4" component="h2" gutterBottom>
            Still Have Questions?
          </Typography>
          <Typography variant="body1" paragraph sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
            If you couldn't find the answers you're looking for, our team is happy to help.
            Contact us directly and we'll get back to you as soon as possible.
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Link href="/contact" passHref legacyBehavior>
                <Button variant="contained" color="primary" size="large">
                  Contact Us
                </Button>
              </Link>
            </Grid>
            <Grid item>
              <Link href="/about" passHref legacyBehavior>
                <Button variant="outlined" color="primary" size="large">
                  Learn About Our Company
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
