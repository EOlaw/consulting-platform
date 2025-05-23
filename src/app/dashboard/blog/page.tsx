'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { alpha } from '@mui/material/styles';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { blogAPI } from '@/lib/api';

// Import icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

// Blog post status options
const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'archived', label: 'Archived' }
];

// Category options
const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'business-strategy', label: 'Business Strategy' },
  { value: 'digital-transformation', label: 'Digital Transformation' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'technology', label: 'Technology' },
  { value: 'industry-insights', label: 'Industry Insights' },
  { value: 'case-studies', label: 'Case Studies' },
];

// Column definition for the table
const COLUMNS = [
  { id: 'title', label: 'Title', minWidth: 200, sortable: true },
  { id: 'author', label: 'Author', minWidth: 150, sortable: true },
  { id: 'category', label: 'Category', minWidth: 150, sortable: true },
  { id: 'status', label: 'Status', minWidth: 120, sortable: true },
  { id: 'publishedAt', label: 'Date', minWidth: 120, sortable: true },
  { id: 'stats', label: 'Stats', minWidth: 150, sortable: false },
  { id: 'actions', label: 'Actions', minWidth: 100, sortable: false },
];

export default function BlogManagementPage() {
  const router = useRouter();

  // State for blog posts
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('publishedAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<string[]>([]);

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // State for actions
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postsToDelete, setPostsToDelete] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // State for action menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPost, setMenuPost] = useState<string | null>(null);

  // Fetch blog posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        // Prepare API request params
        const params: any = {
          sortBy: orderBy,
          sortOrder: order,
          page: page + 1,
          limit: rowsPerPage,
        };

        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }

        if (categoryFilter !== 'all') {
          params.category = categoryFilter;
        }

        if (searchQuery) {
          params.search = searchQuery;
        }

        const response = await blogAPI.getAllPosts(params);

        if (response.data?.data?.posts) {
          setPosts(response.data.data.posts);
        } else {
          setPosts([]);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, rowsPerPage, orderBy, order, statusFilter, categoryFilter, searchQuery]);

  // Handle sort request
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle select all click
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = posts.map((post) => post._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  // Handle single row selection
  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Check if a row is selected
  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatusFilter(event.target.value as string);
    setPage(0);
  };

  // Handle category filter change
  const handleCategoryFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setCategoryFilter(event.target.value as string);
    setPage(0);
  };

  // Open action menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, postId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuPost(postId);
  };

  // Close action menu
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuPost(null);
  };

  // Handle post edit
  const handleEditPost = (postId: string) => {
    router.push(`/dashboard/blog/${postId}`);
    handleMenuClose();
  };

  // Handle post view (in new tab)
  const handleViewPost = (post: any) => {
    if (post.slug) {
      window.open(`/blog/${post.slug}`, '_blank');
    }
    handleMenuClose();
  };

  // Handle post highlight toggle
  const handleToggleHighlight = async (postId: string, currentValue: boolean) => {
    try {
      setActionLoading(true);
      await blogAPI.updatePost(postId, { isHighlighted: !currentValue });

      // Update local state
      setPosts(posts.map(post =>
        post._id === postId ? { ...post, isHighlighted: !currentValue } : post
      ));

      setSnackbar({
        open: true,
        message: `Post ${!currentValue ? 'highlighted' : 'unhighlighted'} successfully`,
        severity: 'success',
      });
    } catch (err) {
      console.error('Error updating post highlight status:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update post highlight status',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
      handleMenuClose();
    }
  };

  // Handle post duplication
  const handleDuplicatePost = async (postId: string) => {
    try {
      setActionLoading(true);
      const post = posts.find(p => p._id === postId);

      if (!post) {
        throw new Error('Post not found');
      }

      // Prepare duplicate data (omit unique identifiers and stats)
      const duplicateData = {
        title: `${post.title} (Copy)`,
        content: post.content,
        excerpt: post.excerpt,
        categories: post.categories,
        tags: post.tags,
        publishStatus: 'draft',
        featuredImage: post.featuredImage,
        seo: post.seo,
      };

      const response = await blogAPI.createPost(duplicateData);

      if (response.data?.data?.post) {
        setSnackbar({
          open: true,
          message: 'Post duplicated successfully',
          severity: 'success',
        });

        // Refresh posts list
        const refreshResponse = await blogAPI.getAllPosts({
          page: page + 1,
          limit: rowsPerPage,
          sortBy: orderBy,
          sortOrder: order,
        });

        if (refreshResponse.data?.data?.posts) {
          setPosts(refreshResponse.data.data.posts);
        }
      }
    } catch (err) {
      console.error('Error duplicating post:', err);
      setSnackbar({
        open: true,
        message: 'Failed to duplicate post',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
      handleMenuClose();
    }
  };

  // Open delete dialog
  const handleDeleteDialogOpen = (postIds: string[]) => {
    setPostsToDelete(postIds);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Close delete dialog
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setPostsToDelete([]);
  };

  // Delete posts
  const handleDeletePosts = async () => {
    try {
      setActionLoading(true);

      // Delete each post
      await Promise.all(
        postsToDelete.map(postId => blogAPI.deletePost(postId))
      );

      setSnackbar({
        open: true,
        message: `${postsToDelete.length} post(s) deleted successfully`,
        severity: 'success',
      });

      // Refresh posts list
      const response = await blogAPI.getAllPosts({
        page: page + 1,
        limit: rowsPerPage,
        sortBy: orderBy,
        sortOrder: order,
      });

      if (response.data?.data?.posts) {
        setPosts(response.data.data.posts);
      } else {
        setPosts([]);
      }

      // Clear selected posts
      setSelected([]);
    } catch (err) {
      console.error('Error deleting posts:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete posts',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
      handleDeleteDialogClose();
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format category for display
  const formatCategory = (category: string) => {
    if (!category) return '';
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'default';
      case 'scheduled':
        return 'primary';
      case 'archived':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
        {/* Toolbar with filters and actions */}
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(selected.length > 0 && {
              bgcolor: (theme) =>
                alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
            }),
          }}
        >
          {selected.length > 0 ? (
            <Typography
              sx={{ flex: '1 1 100%' }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {selected.length} selected
            </Typography>
          ) : (
            <Typography
              sx={{ flex: '1 1 100%' }}
              variant="h6"
              id="tableTitle"
              component="div"
            >
              Blog Posts
            </Typography>
          )}

          {selected.length > 0 ? (
            <Tooltip title="Delete">
              <IconButton onClick={() => handleDeleteDialogOpen(selected)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Box display="flex" alignItems="center">
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ mr: 2, width: 250 }}
              />

              <FormControl variant="outlined" size="small" sx={{ mr: 2, minWidth: 150 }}>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="outlined" size="small" sx={{ mr: 2, minWidth: 180 }}>
                <InputLabel id="category-filter-label">Category</InputLabel>
                <Select
                  labelId="category-filter-label"
                  id="category-filter"
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                  label="Category"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => router.push('/dashboard/blog/new')}
                sx={{ ml: 'auto' }}
              >
                New Post
              </Button>
            </Box>
          )}
        </Toolbar>

        {/* Blog posts table */}
        <TableContainer>
          <Table
            aria-labelledby="tableTitle"
            size="medium"
          >
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < posts.length}
                    checked={posts.length > 0 && selected.length === posts.length}
                    onChange={handleSelectAllClick}
                    inputProps={{
                      'aria-label': 'select all posts',
                    }}
                  />
                </TableCell>
                {COLUMNS.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.id === 'actions' ? 'right' : 'left'}
                    style={{ minWidth: column.minWidth }}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    {column.sortable ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={() => handleRequestSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length + 1} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length + 1} align="center" sx={{ py: 3 }}>
                    <Typography color="error">{error}</Typography>
                  </TableCell>
                </TableRow>
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length + 1} align="center" sx={{ py: 3 }}>
                    <Typography>No blog posts found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post, index) => {
                  const isItemSelected = isSelected(post._id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={post._id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onClick={(event) => handleClick(event, post._id)}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell id={labelId} component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          {post.isHighlighted && (
                            <Tooltip title="Highlighted Post">
                              <StarIcon sx={{ color: 'warning.main', mr: 1, fontSize: 20 }} />
                            </Tooltip>
                          )}
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {post.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {post.excerpt.substring(0, 60)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {post.author ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              src={post.author.profileImage}
                              alt={`${post.author.firstName} ${post.author.lastName}`}
                              sx={{ width: 30, height: 30, mr: 1 }}
                            />
                            <Typography variant="body2">
                              {post.author.firstName} {post.author.lastName}
                            </Typography>
                          </Box>
                        ) : (
                          'Unknown'
                        )}
                      </TableCell>
                      <TableCell>
                        {post.categories && post.categories.length > 0 ? (
                          post.categories.slice(0, 2).map((category: string, idx: number) => (
                            <Chip
                              key={idx}
                              size="small"
                              label={formatCategory(category)}
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">Not categorized</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={post.publishStatus.charAt(0).toUpperCase() + post.publishStatus.slice(1)}
                          color={getStatusColor(post.publishStatus) as any}
                        />
                      </TableCell>
                      <TableCell>
                        {post.publishStatus === 'published' ? (
                          formatDate(post.publishedAt)
                        ) : post.publishStatus === 'scheduled' ? (
                          <>
                            <Typography variant="body2">Scheduled for:</Typography>
                            <Typography variant="body2" color="primary.main">{formatDate(post.scheduledFor)}</Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(post.createdAt)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Tooltip title="Views">
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                              <VisibilityIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2">{post.views || 0}</Typography>
                            </Box>
                          </Tooltip>
                          <Tooltip title="Likes">
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                              <ThumbUpIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2">{post.likes?.length || 0}</Typography>
                            </Box>
                          </Tooltip>
                          <Tooltip title="Comments">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CommentIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2">{post.comments?.length || 0}</Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleEditPost(post._id)} size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More Actions">
                            <IconButton
                              onClick={(event) => handleMenuOpen(event, post._id)}
                              size="small"
                              aria-label="more"
                              aria-controls="long-menu"
                              aria-haspopup="true"
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={posts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 1,
          sx: {
            minWidth: 180,
            boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
          },
        }}
      >
        <MenuItem onClick={() => menuPost && handleViewPost(posts.find(p => p._id === menuPost))}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1.5 }} />
          View Post
        </MenuItem>
        <MenuItem onClick={() => menuPost && handleEditPost(menuPost)}>
          <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
          Edit Post
        </MenuItem>
        <MenuItem onClick={() => menuPost && handleDuplicatePost(menuPost)}>
          <ContentCopyIcon fontSize="small" sx={{ mr: 1.5 }} />
          Duplicate
        </MenuItem>
        {menuPost && (
          <MenuItem onClick={() => menuPost && handleToggleHighlight(
            menuPost,
            posts.find(p => p._id === menuPost)?.isHighlighted || false
          )}>
            {posts.find(p => p._id === menuPost)?.isHighlighted ? (
              <>
                <StarBorderIcon fontSize="small" sx={{ mr: 1.5 }} />
                Remove Highlight
              </>
            ) : (
              <>
                <StarIcon fontSize="small" sx={{ mr: 1.5 }} />
                Highlight Post
              </>
            )}
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={() => menuPost && handleDeleteDialogOpen([menuPost])}>
          <DeleteIcon fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
          <Typography color="error">Delete Post</Typography>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {`Delete ${postsToDelete.length > 1 ? 'Selected Posts' : 'Post'}`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {postsToDelete.length > 1
              ? `Are you sure you want to delete these ${postsToDelete.length} posts? This action cannot be undone.`
              : `Are you sure you want to delete this post? This action cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeletePosts}
            color="error"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
