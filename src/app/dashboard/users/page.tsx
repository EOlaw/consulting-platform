'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  Avatar,
  Checkbox,
  Menu,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  GetApp as ExportIcon,
  DeleteSweep as BulkDeleteIcon,
  PersonAdd as InviteIcon,
  AdminPanelSettings as RoleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/Layout';
import { userAPI } from '@/lib/api';

// CSV export function
const exportToCSV = (users) => {
  // Define headers
  const headers = ['First Name', 'Last Name', 'Email', 'Role', 'Title', 'Status'];

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...users.map(user => [
      user.firstName,
      user.lastName,
      user.email,
      user.role,
      user.title || '',
      user.active === false ? 'Inactive' : 'Active'
    ].join(','))
  ].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'users.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function UserManagement() {
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false);
  const [openBulkRoleDialog, setOpenBulkRoleDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    phoneNumber: '',
    title: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkRole, setBulkRole] = useState('user');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    consultants: 0,
    unverified: 0
  });

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (filterRole) {
        params.role = filterRole;
      }

      if (filterStatus) {
        params.status = filterStatus;
      }

      const response = await userAPI.getAllUsers(params);
      setUsers(response.data.data);
      setTotalUsers(response.data.pagination.total);

      // Calculate user stats
      if (response.data.stats) {
        setUserStats(response.data.stats);
      } else {
        // If server doesn't provide stats, calculate from data
        const allUsersResponse = await userAPI.getAllUsers({ limit: 1000 });
        const allUsers = allUsersResponse.data.data;
        setUserStats({
          total: allUsers.length,
          active: allUsers.filter(u => u.active !== false).length,
          admins: allUsers.filter(u => u.role === 'admin' || u.role === 'super-admin').length,
          consultants: allUsers.filter(u => u.role === 'consultant').length,
          unverified: allUsers.filter(u => !u.isEmailVerified).length
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchQuery, filterRole, filterStatus, refreshKey]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open create/edit dialog
  const handleOpenDialog = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber || '',
        title: user.title || '',
        password: '' // Don't populate password for security reasons
      });
    } else {
      setCurrentUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'user',
        phoneNumber: '',
        title: ''
      });
    }
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUser(null);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      if (currentUser) {
        // Update existing user
        const updateData = { ...formData };
        // Don't send password if it's empty
        if (!updateData.password) {
          delete updateData.password;
        }
        await userAPI.updateUser(currentUser._id, updateData);
      } else {
        // Create new user
        await userAPI.createUser(formData);
      }
      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Failed to save user. Please try again.');
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (user) => {
    setCurrentUser(user);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentUser(null);
  };

  // Delete user
  const handleDeleteUser = async () => {
    try {
      await userAPI.deleteUser(currentUser._id);
      handleCloseDeleteDialog();
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again.');
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  // Handle role filter
  const handleRoleFilter = (e) => {
    setFilterRole(e.target.value);
    setPage(0);
  };

  // Handle status filter
  const handleStatusFilter = (e) => {
    setFilterStatus(e.target.value);
    setPage(0);
  };

  // Handle row selection
  const handleSelectRow = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedUsers.map(userId => userAPI.deleteUser(userId)));
      setOpenBulkDeleteDialog(false);
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      setError('Failed to delete users. Please try again.');
    }
  };

  // Handle bulk role change
  const handleBulkRoleChange = async () => {
    try {
      await Promise.all(
        selectedUsers.map(userId =>
          userAPI.updateUser(userId, { role: bulkRole })
        )
      );
      setOpenBulkRoleDialog(false);
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      console.error('Error changing user roles:', error);
      setError('Failed to update user roles. Please try again.');
    }
  };

  // Handle menu open
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle export users
  const handleExport = () => {
    exportToCSV(users);
    handleMenuClose();
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    handleMenuClose();
  };

  return (
    <DashboardLayout title="User Management">
      <Box sx={{ mt: 2 }}>
        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4">{userStats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Users
                </Typography>
                <Typography variant="h4">{userStats.active}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Admins
                </Typography>
                <Typography variant="h4">{userStats.admins}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Consultants
                </Typography>
                <Typography variant="h4">{userStats.consultants}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Unverified
                </Typography>
                <Typography variant="h4">{userStats.unverified}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Users
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedUsers.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<RoleIcon />}
                    onClick={() => setOpenBulkRoleDialog(true)}
                  >
                    Change Role
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<BulkDeleteIcon />}
                    onClick={() => setOpenBulkDeleteDialog(true)}
                  >
                    Delete Selected
                  </Button>
                </Box>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add User
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<InviteIcon />}
                onClick={() => alert('Invite feature coming soon!')}
              >
                Invite
              </Button>
              <IconButton onClick={handleMenuOpen}>
                <MoreIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleExport}>
                  <ListItemIcon>
                    <ExportIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Export Users</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleRefresh}>
                  <ListItemIcon>
                    <RefreshIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Refresh</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Search and filters */}
          <Box sx={{ display: 'flex', mb: 2, gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearch}
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              select
              label="Role"
              variant="outlined"
              size="small"
              value={filterRole}
              onChange={handleRoleFilter}
              sx={{ minWidth: 150 }}
              InputProps={{
                startAdornment: <FilterIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="consultant">Consultant</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="super-admin">Super Admin</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              variant="outlined"
              size="small"
              value={filterStatus}
              onChange={handleStatusFilter}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="unverified">Unverified</MenuItem>
            </TextField>
          </Box>

          {loading ? (
            <LinearProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                          checked={users.length > 0 && selectedUsers.length === users.length}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user._id}
                        hover
                        selected={selectedUsers.includes(user._id)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleSelectRow(user._id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              src={user.profileImage}
                              alt={`${user.firstName} ${user.lastName}`}
                              sx={{ mr: 2, width: 40, height: 40 }}
                            >
                              {user.firstName[0]}{user.lastName[0]}
                            </Avatar>
                            <Typography>
                              {user.firstName} {user.lastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            color={
                              user.role === 'admin' || user.role === 'super-admin'
                                ? 'primary'
                                : user.role === 'consultant'
                                ? 'secondary'
                                : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{user.title || '-'}</TableCell>
                        <TableCell>
                          {user.active === false ? (
                            <Chip
                              icon={<InactiveIcon fontSize="small" />}
                              label="Inactive"
                              color="error"
                              size="small"
                            />
                          ) : !user.isEmailVerified ? (
                            <Chip
                              label="Unverified"
                              color="warning"
                              size="small"
                            />
                          ) : (
                            <Chip
                              icon={<ActiveIcon fontSize="small" />}
                              label="Active"
                              color="success"
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleOpenDialog(user)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton onClick={() => handleOpenDeleteDialog(user)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={totalUsers}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </Paper>
      </Box>

      {/* Create/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{currentUser ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Box>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              fullWidth
              required={!currentUser}
              helperText={currentUser ? 'Leave blank to keep current password' : ''}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                fullWidth
                required
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="consultant">Consultant</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super-admin">Super Admin</MenuItem>
              </TextField>
              <TextField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                fullWidth
              />
            </Box>
            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {currentUser?.firstName} {currentUser?.lastName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={openBulkDeleteDialog}
        onClose={() => setOpenBulkDeleteDialog(false)}
      >
        <DialogTitle>Delete Multiple Users</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedUsers.length} selected users? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkDelete} color="error">
            Delete {selectedUsers.length} Users
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Role Change Dialog */}
      <Dialog
        open={openBulkRoleDialog}
        onClose={() => setOpenBulkRoleDialog(false)}
      >
        <DialogTitle>Change Role for Multiple Users</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Change role for {selectedUsers.length} selected users.
          </DialogContentText>
          <TextField
            select
            label="New Role"
            value={bulkRole}
            onChange={(e) => setBulkRole(e.target.value)}
            fullWidth
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="consultant">Consultant</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="super-admin">Super Admin</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkRoleDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkRoleChange} color="primary" variant="contained">
            Update Roles
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
