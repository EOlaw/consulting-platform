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
import IconButton from '@mui/material/IconButton';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { alpha, useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { blogAPI } from '@/lib/api';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import SocialShare from '@/components/SocialShare';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    // Fetch blog post details
    const fetchBlogPostDetails = async () => {
      try {
        setLoading(true);
        // Fetch post by slug
        const response = await blogAPI.getPostBySlug(slug);
        if (response.data?.data?.post) {
          setPost(response.data.data.post);

          // Fetch related posts based on categories
          if (response.data.data.post.categories && response.data.data.post.categories.length > 0) {
            try {
              const relatedResponse = await blogAPI.getAllPosts({
                limit: 3,
                status: 'published',
                category: response.data.data.post.categories[0],
                excludeId: response.data.data.post._id // Exclude current post
              });

              if (relatedResponse.data?.data?.posts) {
                setRelatedPosts(relatedResponse.data.data.posts);
              }
            } catch (relatedErr) {
              console.error('Error fetching related posts:', relatedErr);
            }
          }
        } else {
          setError('Blog post not found.');
        }
      } catch (err) {
        console.error('Error fetching blog post details:', err);
        setError('Failed to load blog post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlogPostDetails();
    }
  }, [slug]);

  const handleLikeClick = async () => {
    if (!post) return;

    try {
      if (!liked) {
        await blogAPI.likePost(post._id);
        setLiked(true);
        // Increase like count in UI
        setPost((prevPost: any) => ({
          ...prevPost,
          likes: [...prevPost.likes, '1'] // Just add a temporary ID
        }));
      } else {
        await blogAPI.unlikePost(post._id);
        setLiked(false);
        // Decrease like count in UI
        setPost((prevPost: any) => ({
          ...prevPost,
          likes: prevPost.likes.slice(0, -1) // Remove the last like
        }));
      }
    } catch (err) {
      console.error('Error updating like status:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Placeholder blog post for development/preview
  const placeholderPost = {
    title: '5 Digital Transformation Trends for 2025',
    slug: 'digital-transformation-trends-2025',
    excerpt: 'Discover the key digital transformation trends that will shape businesses in 2025 and beyond.',
    content: `
      <h2>Introduction</h2>
      <p>Digital transformation continues to reshape industries at an unprecedented pace. As we look toward 2025, several key trends are emerging that will define how businesses leverage technology to gain competitive advantages.</p>

      <p>Organizations that stay ahead of these trends will be better positioned to thrive in an increasingly digital economy, while those that fail to adapt risk falling behind more agile competitors.</p>

      <h2>1. Hyper-Automation Across Business Processes</h2>

      <p>Hyper-automation—the application of advanced technologies like AI, machine learning, and robotic process automation (RPA) to automate as many business processes as possible—will accelerate dramatically.</p>

      <p>By 2025, we expect to see:</p>
      <ul>
        <li>60% of enterprises implementing automation strategies that span multiple departments</li>
        <li>Process mining becoming a standard practice to identify automation opportunities</li>
        <li>Digital workers and human employees collaborating seamlessly in hybrid workflows</li>
      </ul>

      <p>Organizations implementing hyper-automation are seeing 30-40% efficiency improvements in automated processes, with corresponding cost reductions and improved accuracy.</p>

      <h2>2. AI-Powered Decision Intelligence</h2>

      <p>Decision intelligence—the application of AI to enhance human decision-making—will become embedded in enterprise systems across all industries.</p>

      <p>Key developments include:</p>
      <ul>
        <li>Democratization of predictive and prescriptive analytics</li>
        <li>Natural language interfaces for business intelligence tools</li>
        <li>Automated data preparation and feature engineering</li>
        <li>Explainable AI to build trust in automated recommendations</li>
      </ul>

      <p>Leading organizations are already using decision intelligence to improve operational decisions by 25% while reducing decision latency by up to 70%.</p>

      <h2>3. Composable Enterprise Architecture</h2>

      <p>The composable enterprise—built from interchangeable building blocks—will become the dominant architectural approach for digital businesses.</p>

      <p>This architectural shift will be characterized by:</p>
      <ul>
        <li>Modular business capabilities delivered through APIs</li>
        <li>Low-code/no-code development platforms for business-led innovation</li>
        <li>Packaged business capabilities (PBCs) from cloud providers</li>
        <li>Dynamic reconfiguration of business applications</li>
      </ul>

      <p>Organizations adopting composable architecture report 80% faster time-to-market for new initiatives and 60% higher developer productivity.</p>

      <h2>4. Total Experience (TX) Strategy</h2>

      <p>Total Experience combines customer experience (CX), employee experience (EX), user experience (UX), and multi-experience (MX) into a holistic approach that transforms business outcomes.</p>

      <p>Key elements of TX in 2025 will include:</p>
      <ul>
        <li>Unified experience platforms that break down traditional silos</li>
        <li>AI-powered personalization across all touchpoints</li>
        <li>Seamless transitions between physical and digital experiences</li>
        <li>Employee technology experiences that mirror consumer-grade experiences</li>
      </ul>

      <p>Companies implementing comprehensive TX strategies are achieving 25% higher customer satisfaction, 40% higher employee engagement, and 20-30% increases in digital revenue.</p>

      <h2>5. Cybersecurity Mesh Architecture</h2>

      <p>As digital assets become increasingly distributed, the traditional security perimeter continues to dissolve. Cybersecurity mesh architecture provides an integrated security structure for distributed assets.</p>

      <p>This approach will be defined by:</p>
      <ul>
        <li>Identity-first security becoming the foundation of access controls</li>
        <li>Consolidated security analytics across tools and platforms</li>
        <li>AI-powered security operations centers (SOCs) for automated threat detection and response</li>
        <li>Zero-trust implementation at scale</li>
      </ul>

      <p>Organizations implementing cybersecurity mesh architecture are reducing the financial impact of security incidents by an average of 90% and improving their security posture against emerging threats.</p>

      <h2>Conclusion</h2>

      <p>Digital transformation in 2025 will be characterized by more intelligent, integrated, and automated systems that blend seamlessly into business operations. Organizations that embrace these trends will be able to respond more quickly to market changes, deliver exceptional experiences to customers and employees, and build more resilient operations.</p>

      <p>The key to success will be taking a strategic approach to digital transformation—focusing on business outcomes rather than technology implementation, building modular and flexible architectures, and developing the skills and culture needed to thrive in an increasingly digital world.</p>
    `,
    author: {
      _id: 'author1',
      firstName: 'John',
      lastName: 'Smith',
      profileImage: 'https://source.unsplash.com/random?portrait1',
    },
    featuredImage: 'https://source.unsplash.com/random?digital',
    categories: ['digital-transformation', 'technology'],
    tags: ['trends', 'innovation', 'digital', 'AI', 'automation', 'cybersecurity'],
    publishStatus: 'published',
    publishedAt: new Date('2025-01-15').toISOString(),
    readTime: 8,
    views: 1245,
    likes: ['user1', 'user2', 'user3'],
    isHighlighted: true,
  };

  // Use placeholder post during development and when data is loading
  const displayPost = post || placeholderPost;

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
          <Link href="/blog" passHref legacyBehavior>
            <Button variant="contained" color="primary">
              Return to Blog
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
          background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${displayPost.featuredImage})`,
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
            <Link href="/blog" color="inherit">Blog</Link>
            {displayPost.categories && displayPost.categories.length > 0 && (
              <Link
                href={`/blog?category=${displayPost.categories[0]}`}
                color="inherit"
              >
                {displayPost.categories[0].charAt(0).toUpperCase() + displayPost.categories[0].slice(1).replace('-', ' ')}
              </Link>
            )}
            <Typography color="white">{displayPost.title}</Typography>
          </Breadcrumbs>

          <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
            {displayPost.categories && displayPost.categories.length > 0 && (
              <Box sx={{ mb: 3 }}>
                {displayPost.categories.map((category: string, index: number) => (
                  <Chip
                    key={index}
                    label={category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                ))}
              </Box>
            )}

            <Typography variant="h3" component="h1" gutterBottom>
              {displayPost.title}
            </Typography>

            <Typography variant="subtitle1" component="p" sx={{ mb: 4, opacity: 0.9 }}>
              {displayPost.excerpt}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={displayPost.author?.profileImage}
                alt={`${displayPost.author?.firstName} ${displayPost.author?.lastName}`}
                sx={{ width: 48, height: 48, mr: 2 }}
              />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle1" component="p" sx={{ fontWeight: 'medium' }}>
                  {displayPost.author?.firstName} {displayPost.author?.lastName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                  <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2" component="span" sx={{ mr: 2 }}>
                    {formatDate(displayPost.publishedAt)}
                  </Typography>
                  <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2" component="span">
                    {displayPost.readTime} min read
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
              {/* Article Content */}
              <Box
                sx={{
                  '& h2': {
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    mt: 4,
                    mb: 2,
                    color: 'text.primary',
                  },
                  '& h3': {
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    mt: 3,
                    mb: 2,
                    color: 'text.primary',
                  },
                  '& p': {
                    mb: 2,
                    lineHeight: 1.7,
                    fontSize: '1.05rem',
                  },
                  '& ul, & ol': {
                    mb: 2,
                    pl: 3,
                  },
                  '& li': {
                    mb: 1,
                    lineHeight: 1.6,
                  },
                  '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 1,
                    my: 2,
                  },
                  '& blockquote': {
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                    pl: 2,
                    py: 1,
                    my: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    fontStyle: 'italic',
                  },
                  '& a': {
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  },
                }}
                dangerouslySetInnerHTML={{ __html: displayPost.content }}
              />

              {/* Tags */}
              {displayPost.tags && displayPost.tags.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle2" component="span" sx={{ mr: 2 }}>
                    Tags:
                  </Typography>
                  {displayPost.tags.map((tag: string, index: number) => (
                    <Chip
                      key={index}
                      label={tag.charAt(0).toUpperCase() + tag.slice(1)}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 4 }} />

              {/* Like and Share */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    color={liked ? 'primary' : 'default'}
                    onClick={handleLikeClick}
                    sx={{ mr: 1 }}
                  >
                    {liked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                  </IconButton>
                  <Typography variant="body2" color="text.secondary">
                    {displayPost.likes?.length || 0} likes
                  </Typography>
                </Box>
                <SocialShare
                  title={displayPost.title}
                  url={typeof window !== 'undefined' ? window.location.href : ''}
                  size="small"
                />
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Author Bio */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar
                  src={displayPost.author?.profileImage}
                  alt={`${displayPost.author?.firstName} ${displayPost.author?.lastName}`}
                  sx={{ width: 64, height: 64, mr: 2 }}
                />
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {displayPost.author?.firstName} {displayPost.author?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Business Strategy Consultant with over 15 years of experience helping organizations navigate digital transformation. Specializes in technology strategy, change management, and operational excellence.
                  </Typography>
                  <Link href={`/blog?author=${displayPost.author?._id}`} passHref legacyBehavior>
                    <Button variant="outlined" size="small">
                      View All Articles
                    </Button>
                  </Link>
                </Box>
              </Box>
            </Paper>

            {/* Back to Blog */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Link href="/blog" passHref legacyBehavior>
                <Button variant="contained" color="primary">
                  Back to All Articles
                </Button>
              </Link>
            </Box>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Related Posts */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                Related Articles
              </Typography>
              <List disablePadding>
                {(relatedPosts.length > 0 ? relatedPosts : displayPost.relatedPosts || []).map((relatedPost: any, index: number) => (
                  <ListItem
                    key={relatedPost._id || index}
                    disablePadding
                    sx={{
                      mb: 2,
                      display: 'block',
                      '&:not(:last-child)': {
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        pb: 2
                      }
                    }}
                  >
                    <Link href={`/blog/${relatedPost.slug}`} passHref style={{ textDecoration: 'none' }}>
                      <Box sx={{ display: 'flex' }}>
                        <Box
                          sx={{
                            width: 80,
                            height: 60,
                            borderRadius: 1,
                            overflow: 'hidden',
                            flexShrink: 0,
                            mr: 2
                          }}
                        >
                          <img
                            src={relatedPost.featuredImage || `https://source.unsplash.com/random?${relatedPost.title}`}
                            alt={relatedPost.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.primary"
                            sx={{
                              fontWeight: 'medium',
                              display: '-webkit-box',
                              overflow: 'hidden',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: 2,
                            }}
                          >
                            {relatedPost.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 12, mr: 0.5 }} />
                            {relatedPost.readTime} min read
                          </Typography>
                        </Box>
                      </Box>
                    </Link>
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Popular Tags */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                Popular Topics
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['Digital Transformation', 'Leadership', 'Strategy', 'Technology', 'Innovation', 'AI', 'Business Growth', 'Project Management', 'Customer Experience'].map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    component={Link}
                    href={`/blog?search=${tag}`}
                    clickable
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Paper>

            {/* Newsletter Signup */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                textAlign: 'center'
              }}
            >
              <BookmarkIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" component="h3" gutterBottom>
                Subscribe to Our Newsletter
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Get the latest insights delivered directly to your inbox.
              </Typography>
              <Link href="/newsletter" passHref legacyBehavior>
                <Button fullWidth variant="contained" color="primary">
                  Subscribe
                </Button>
              </Link>
            </Paper>

            {/* Article Stats */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                Article Stats
              </Typography>
              <List dense>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Published On</Typography>
                        <Typography variant="body2">{formatDate(displayPost.publishedAt)}</Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Read Time</Typography>
                        <Typography variant="body2">{displayPost.readTime} minutes</Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Views</Typography>
                        <Typography variant="body2">{displayPost.views?.toLocaleString() || 0}</Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Likes</Typography>
                        <Typography variant="body2">{displayPost.likes?.length || 0}</Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
