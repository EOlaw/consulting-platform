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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Pagination from '@mui/material/Pagination';
import { alpha, useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { blogAPI } from '@/lib/api';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import Avatar from '@mui/material/Avatar';

// Blog categories for filter
const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'business-strategy', label: 'Business Strategy' },
  { value: 'digital-transformation', label: 'Digital Transformation' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'technology', label: 'Technology' },
  { value: 'industry-insights', label: 'Industry Insights' },
  { value: 'case-studies', label: 'Case Studies' },
];

// Placeholder blog posts for initial render or fallback
const DEFAULT_BLOG_POSTS = [
  {
    _id: '1',
    title: '5 Digital Transformation Trends for 2025',
    slug: 'digital-transformation-trends-2025',
    excerpt: 'Discover the key digital transformation trends that will shape businesses in 2025 and beyond.',
    content: 'Lorem ipsum dolor sit amet...',
    author: {
      _id: 'author1',
      firstName: 'John',
      lastName: 'Smith',
      profileImage: 'https://source.unsplash.com/random?portrait1',
    },
    featuredImage: 'https://source.unsplash.com/random?digital',
    categories: ['digital-transformation', 'technology'],
    tags: ['trends', 'innovation', 'digital'],
    publishStatus: 'published',
    publishedAt: new Date('2025-01-15').toISOString(),
    readTime: 5,
    views: 1245,
    isHighlighted: true,
  },
  {
    _id: '2',
    title: 'How to Build a Resilient Business Strategy',
    slug: 'build-resilient-business-strategy',
    excerpt: 'Learn how to create a business strategy that can withstand market disruptions and competitive pressures.',
    content: 'Lorem ipsum dolor sit amet...',
    author: {
      _id: 'author2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      profileImage: 'https://source.unsplash.com/random?portrait2',
    },
    featuredImage: 'https://source.unsplash.com/random?business',
    categories: ['business-strategy', 'leadership'],
    tags: ['strategy', 'resilience', 'planning'],
    publishStatus: 'published',
    publishedAt: new Date('2025-01-10').toISOString(),
    readTime: 7,
    views: 982,
    isHighlighted: false,
  },
  {
    _id: '3',
    title: 'The Future of Work: Hybrid Models and Employee Engagement',
    slug: 'future-of-work-hybrid-models',
    excerpt: 'Explore how hybrid work models are reshaping employee engagement and company culture.',
    content: 'Lorem ipsum dolor sit amet...',
    author: {
      _id: 'author3',
      firstName: 'Michael',
      lastName: 'Chen',
      profileImage: 'https://source.unsplash.com/random?portrait3',
    },
    featuredImage: 'https://source.unsplash.com/random?work',
    categories: ['leadership', 'industry-insights'],
    tags: ['future of work', 'remote work', 'employee engagement'],
    publishStatus: 'published',
    publishedAt: new Date('2025-01-05').toISOString(),
    readTime: 6,
    views: 1056,
    isHighlighted: false,
  },
  {
    _id: '4',
    title: 'AI in Business: Beyond the Hype',
    slug: 'ai-in-business-beyond-hype',
    excerpt: 'Cut through the AI hype and understand the practical applications transforming businesses today.',
    content: 'Lorem ipsum dolor sit amet...',
    author: {
      _id: 'author4',
      firstName: 'Emily',
      lastName: 'Taylor',
      profileImage: 'https://source.unsplash.com/random?portrait4',
    },
    featuredImage: 'https://source.unsplash.com/random?ai',
    categories: ['technology', 'digital-transformation'],
    tags: ['AI', 'machine learning', 'automation'],
    publishStatus: 'published',
    publishedAt: new Date('2024-12-28').toISOString(),
    readTime: 8,
    views: 1578,
    isHighlighted: false,
  },
  {
    _id: '5',
    title: 'Supply Chain Resilience in a Volatile World',
    slug: 'supply-chain-resilience',
    excerpt: 'Strategies for building robust supply chains that can adapt to global disruptions and market volatility.',
    content: 'Lorem ipsum dolor sit amet...',
    author: {
      _id: 'author1',
      firstName: 'John',
      lastName: 'Smith',
      profileImage: 'https://source.unsplash.com/random?portrait1',
    },
    featuredImage: 'https://source.unsplash.com/random?supply-chain',
    categories: ['business-strategy', 'industry-insights'],
    tags: ['supply chain', 'logistics', 'risk management'],
    publishStatus: 'published',
    publishedAt: new Date('2024-12-20').toISOString(),
    readTime: 6,
    views: 874,
    isHighlighted: false,
  },
  {
    _id: '6',
    title: 'Sustainable Business Practices: A Competitive Advantage',
    slug: 'sustainable-business-practices',
    excerpt: 'How environmental and social responsibility can drive business growth and customer loyalty.',
    content: 'Lorem ipsum dolor sit amet...',
    author: {
      _id: 'author2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      profileImage: 'https://source.unsplash.com/random?portrait2',
    },
    featuredImage: 'https://source.unsplash.com/random?sustainability',
    categories: ['business-strategy', 'industry-insights'],
    tags: ['sustainability', 'ESG', 'corporate responsibility'],
    publishStatus: 'published',
    publishedAt: new Date('2024-12-15').toISOString(),
    readTime: 5,
    views: 763,
    isHighlighted: false,
  },
];

export default function BlogPage() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blogPosts, setBlogPosts] = useState(DEFAULT_BLOG_POSTS);
  const [filteredPosts, setFilteredPosts] = useState(DEFAULT_BLOG_POSTS);
  const [highlightedPosts, setHighlightedPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Get category from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  useEffect(() => {
    // Fetch blog posts from API
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getAllPosts({
          status: 'published',
          page,
          limit: 9,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery || undefined
        });

        if (response.data?.data?.posts) {
          setBlogPosts(response.data.data.posts);
          setFilteredPosts(response.data.data.posts);

          if (response.data.data.pagination) {
            setTotalPages(response.data.data.pagination.pages);
          }

          // Also fetch highlighted posts if on first page
          if (page === 1 && !searchQuery && selectedCategory === 'all') {
            try {
              const highlightedResponse = await blogAPI.getAllPosts({
                isHighlighted: true,
                status: 'published',
                limit: 3
              });

              if (highlightedResponse.data?.data?.posts) {
                setHighlightedPosts(highlightedResponse.data.data.posts);
              }
            } catch (highlightErr) {
              console.error('Error fetching highlighted posts:', highlightErr);
              // Use the first post from defaults as fallback
              setHighlightedPosts([DEFAULT_BLOG_POSTS[0]]);
            }
          }
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
        // Keep default posts as fallback
        setBlogPosts(DEFAULT_BLOG_POSTS);
        setFilteredPosts(DEFAULT_BLOG_POSTS);
        setHighlightedPosts([DEFAULT_BLOG_POSTS[0]]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [page, selectedCategory, searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
    setPage(1); // Reset to first page on category change

    // Update URL with category param
    if (newValue === 'all') {
      router.push('/blog');
    } else {
      router.push(`/blog?category=${newValue}`);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            Blog & Insights
          </Typography>
          <Typography variant="h5" component="p" paragraph align="center" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            Expert perspectives on business strategy, technology, leadership, and industry trends
          </Typography>

          {/* Search Box */}
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Paper
              component="form"
              sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
              onSubmit={handleSearchSubmit}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search articles..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
                <SearchIcon />
              </IconButton>
            </Paper>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Category Tabs */}
        <Box sx={{ mb: 6 }}>
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
            {CATEGORIES.map((category) => (
              <Tab
                key={category.value}
                label={category.label}
                value={category.value}
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

        {/* Featured Posts - Only on first page with no filters */}
        {page === 1 && !searchQuery && selectedCategory === 'all' && highlightedPosts.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Featured Articles
            </Typography>
            <Grid container spacing={4}>
              {highlightedPosts.slice(0, 1).map((post) => (
                <Grid item xs={12} md={8} key={post._id}>
                  <Card
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      height: '100%',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 20px -10px rgba(0,0,0,0.2)',
                      }
                    }}
                  >
                    <CardActionArea
                      component={Link}
                      href={`/blog/${post.slug}`}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        height: '100%',
                        alignItems: 'stretch'
                      }}
                    >
                      <CardMedia
                        component="img"
                        sx={{
                          width: { xs: '100%', md: '50%' },
                          height: { xs: 240, md: 'auto' }
                        }}
                        image={post.featuredImage || `https://source.unsplash.com/random?${post.title}`}
                        alt={post.title}
                      />
                      <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                        {post.categories && post.categories.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Chip
                              label={post.categories[0].charAt(0).toUpperCase() + post.categories[0].slice(1).replace('-', ' ')}
                              color="primary"
                              size="small"
                            />
                          </Box>
                        )}
                        <Typography component="h3" variant="h5" gutterBottom>
                          {post.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                          {post.excerpt}
                        </Typography>
                        <Box sx={{ mt: 'auto' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar
                              src={post.author?.profileImage}
                              alt={`${post.author?.firstName} ${post.author?.lastName}`}
                              sx={{ width: 32, height: 32, mr: 1 }}
                            />
                            <Typography variant="subtitle2">
                              {post.author?.firstName} {post.author?.lastName}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
                            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2" component="span" sx={{ mr: 2 }}>
                              {post.readTime} min read
                            </Typography>
                            <VisibilityIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2" component="span">
                              {post.views.toLocaleString()} views
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}

              {highlightedPosts.slice(1, 3).map((post) => (
                <Grid item xs={12} md={4} key={post._id}>
                  <Card
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 20px -10px rgba(0,0,0,0.2)',
                      }
                    }}
                  >
                    <CardActionArea
                      component={Link}
                      href={`/blog/${post.slug}`}
                      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                      <CardMedia
                        component="img"
                        height={180}
                        image={post.featuredImage || `https://source.unsplash.com/random?${post.title}`}
                        alt={post.title}
                      />
                      <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                        {post.categories && post.categories.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Chip
                              label={post.categories[0].charAt(0).toUpperCase() + post.categories[0].slice(1).replace('-', ' ')}
                              color="primary"
                              size="small"
                            />
                          </Box>
                        )}
                        <Typography component="h3" variant="h6" gutterBottom>
                          {post.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {post.excerpt.substring(0, 100)}...
                        </Typography>
                        <Box sx={{ mt: 'auto' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
                            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2" component="span" sx={{ mr: 2 }}>
                              {post.readTime} min read
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

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

        {/* Latest Articles Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h2">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : selectedCategory !== 'all'
                ? `${CATEGORIES.find(c => c.value === selectedCategory)?.label || 'Articles'}`
                : 'Latest Articles'
            }
          </Typography>
        </Box>

        {/* Blog Posts Grid */}
        {!loading && (
          <>
            <Grid container spacing={4}>
              {filteredPosts.map((post) => (
                <Grid item xs={12} sm={6} md={4} key={post._id}>
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
                    <CardActionArea
                      component={Link}
                      href={`/blog/${post.slug}`}
                      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                      <CardMedia
                        component="img"
                        height={200}
                        image={post.featuredImage || `https://source.unsplash.com/random?${post.title}`}
                        alt={post.title}
                      />
                      <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          {post.categories && post.categories.length > 0 && (
                            <Chip
                              label={post.categories[0].charAt(0).toUpperCase() + post.categories[0].slice(1).replace('-', ' ')}
                              color="primary"
                              size="small"
                            />
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(post.publishedAt)}
                          </Typography>
                        </Box>
                        <Typography component="h3" variant="h6" gutterBottom>
                          {post.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                          {post.excerpt.substring(0, 120)}...
                        </Typography>
                        <Box sx={{ mt: 'auto' }}>
                          <Divider sx={{ my: 1.5 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                src={post.author?.profileImage}
                                alt={`${post.author?.firstName} ${post.author?.lastName}`}
                                sx={{ width: 24, height: 24, mr: 1 }}
                              />
                              <Typography variant="caption">
                                {post.author?.firstName} {post.author?.lastName}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                              <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                              <Typography variant="caption">
                                {post.readTime} min
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* No Results Message */}
            {filteredPosts.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No articles found matching your criteria.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    router.push('/blog');
                  }}
                  sx={{ mt: 2 }}
                >
                  View All Articles
                </Button>
              </Box>
            )}

            {/* Pagination */}
            {filteredPosts.length > 0 && totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Newsletter Signup */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <BookmarkIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h2" gutterBottom>
            Stay Updated with Our Newsletter
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Subscribe to receive the latest insights, thought leadership, and industry trends directly in your inbox.
          </Typography>
          <Link href="/newsletter" passHref legacyBehavior>
            <Button variant="contained" color="primary" size="large">
              Subscribe Now
            </Button>
          </Link>
        </Container>
      </Box>
    </Box>
  );
}
