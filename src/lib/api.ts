/**
 * API service for communicating with the backend
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Config
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle token expiration
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page if on client side
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (userData: any) =>
    api.post('/auth/register', userData),

  verifyEmail: (token: string) =>
    api.get(`/auth/verify-email/${token}`),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string, confirmPassword: string) =>
    api.post(`/auth/reset-password/${token}`, { password, confirmPassword }),
};

// User API
export const userAPI = {
  getCurrentUser: () =>
    api.get('/users/me'),

  updateProfile: (userData: any) =>
    api.patch('/users/update-profile', userData),

  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) =>
    api.patch('/users/change-password', { currentPassword, newPassword, confirmPassword }),

  getAllUsers: (params: any = {}) =>
    api.get('/users', { params }),

  getUserById: (userId: string) =>
    api.get(`/users/${userId}`),

  createUser: (userData: any) =>
    api.post('/users', userData),

  updateUser: (userId: string, userData: any) =>
    api.patch(`/users/${userId}`, userData),

  deleteUser: (userId: string) =>
    api.delete(`/users/${userId}`),
};

// Organization API
export const organizationAPI = {
  getAllOrganizations: (params: any = {}) =>
    api.get('/organizations', { params }),

  getOrganizationById: (organizationId: string) =>
    api.get(`/organizations/${organizationId}`),

  createOrganization: (organizationData: any) =>
    api.post('/organizations', organizationData),

  updateOrganization: (organizationId: string, organizationData: any) =>
    api.patch(`/organizations/${organizationId}`, organizationData),

  deleteOrganization: (organizationId: string) =>
    api.delete(`/organizations/${organizationId}`),

  getOrganizationMembers: (organizationId: string) =>
    api.get(`/organizations/${organizationId}/members`),

  addOrganizationMember: (organizationId: string, userData: any) =>
    api.post(`/organizations/${organizationId}/members`, userData),

  updateOrganizationMember: (organizationId: string, userId: string, userData: any) =>
    api.patch(`/organizations/${organizationId}/members/${userId}`, userData),

  removeOrganizationMember: (organizationId: string, userId: string) =>
    api.delete(`/organizations/${organizationId}/members/${userId}`),
};

// Project API
export const projectAPI = {
  getAllProjects: (params: any = {}) =>
    api.get('/projects', { params }),

  getProjectById: (projectId: string) =>
    api.get(`/projects/${projectId}`),

  createProject: (projectData: any) =>
    api.post('/projects', projectData),

  updateProject: (projectId: string, projectData: any) =>
    api.patch(`/projects/${projectId}`, projectData),

  deleteProject: (projectId: string) =>
    api.delete(`/projects/${projectId}`),

  getProjectTeam: (projectId: string) =>
    api.get(`/projects/${projectId}/team`),

  addProjectMember: (projectId: string, userData: any) =>
    api.post(`/projects/${projectId}/team`, userData),

  updateProjectMember: (projectId: string, userId: string, userData: any) =>
    api.patch(`/projects/${projectId}/team/${userId}`, userData),

  removeProjectMember: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/team/${userId}`),
};

// Case Study API
export const caseStudyAPI = {
  getAllCaseStudies: (params: any = {}) =>
    api.get('/case-studies', { params }),

  getCaseStudyById: (caseStudyId: string) =>
    api.get(`/case-studies/${caseStudyId}`),

  createCaseStudy: (caseStudyData: any) =>
    api.post('/case-studies', caseStudyData),

  updateCaseStudy: (caseStudyId: string, caseStudyData: any) =>
    api.patch(`/case-studies/${caseStudyId}`, caseStudyData),

  deleteCaseStudy: (caseStudyId: string) =>
    api.delete(`/case-studies/${caseStudyId}`),
};

// Blog API
export const blogAPI = {
  getAllPosts: (params: any = {}) =>
    api.get('/blog', { params }),

  getPostById: (postId: string) =>
    api.get(`/blog/${postId}`),

  createPost: (postData: any) =>
    api.post('/blog', postData),

  updatePost: (postId: string, postData: any) =>
    api.patch(`/blog/${postId}`, postData),

  deletePost: (postId: string) =>
    api.delete(`/blog/${postId}`),

  likePost: (postId: string) =>
    api.post(`/blog/${postId}/like`),

  unlikePost: (postId: string) =>
    api.delete(`/blog/${postId}/like`),

  commentOnPost: (postId: string, commentData: any) =>
    api.post(`/blog/${postId}/comments`, commentData),

  deleteComment: (postId: string, commentId: string) =>
    api.delete(`/blog/${postId}/comments/${commentId}`),
};

// Job API for Application Tracking System
export const jobAPI = {
  getAllJobs: (params: any = {}) =>
    api.get('/jobs', { params }),

  getJobById: (jobId: string) =>
    api.get(`/jobs/${jobId}`),

  createJob: (jobData: any) =>
    api.post('/jobs', jobData),

  updateJob: (jobId: string, jobData: any) =>
    api.patch(`/jobs/${jobId}`, jobData),

  deleteJob: (jobId: string) =>
    api.delete(`/jobs/${jobId}`),

  applyForJob: (jobId: string, applicationData: any) =>
    api.post(`/jobs/${jobId}/apply`, applicationData),

  getApplications: (jobId: string) =>
    api.get(`/jobs/${jobId}/applications`),

  updateApplicationStatus: (jobId: string, applicationId: string, statusData: any) =>
    api.patch(`/jobs/${jobId}/applications/${applicationId}`, statusData),
};

// Service API
export const serviceAPI = {
  getAllServices: (params: any = {}) =>
    api.get('/services', { params }),

  getServiceById: (serviceId: string) =>
    api.get(`/services/${serviceId}`),

  getServiceBySlug: (slug: string) =>
    api.get(`/services/slug/${slug}`),

  getFeaturedServices: (limit: number = 6) =>
    api.get('/services/featured', { params: { limit } }),

  getServicesByCategory: (category: string, limit: number = 10) =>
    api.get(`/services/category/${category}`, { params: { limit } }),

  createService: (serviceData: any) =>
    api.post('/services', serviceData),

  updateService: (serviceId: string, serviceData: any) =>
    api.patch(`/services/${serviceId}`, serviceData),

  deleteService: (serviceId: string) =>
    api.delete(`/services/${serviceId}`),

  addRelatedCaseStudy: (serviceId: string, caseStudyId: string) =>
    api.post(`/services/${serviceId}/case-studies`, { caseStudyId }),

  removeRelatedCaseStudy: (serviceId: string, caseStudyId: string) =>
    api.delete(`/services/${serviceId}/case-studies/${caseStudyId}`),
};

// Contact Form API
export const contactFormAPI = {
  submitContactForm: (formData: any) =>
    api.post('/contact', formData),

  getAllSubmissions: (params: any = {}) =>
    api.get('/contact', { params }),

  getSubmissionById: (submissionId: string) =>
    api.get(`/contact/${submissionId}`),

  updateSubmission: (submissionId: string, updateData: any) =>
    api.patch(`/contact/${submissionId}`, updateData),

  deleteSubmission: (submissionId: string) =>
    api.delete(`/contact/${submissionId}`),

  assignSubmission: (submissionId: string, userId: string) =>
    api.post(`/contact/${submissionId}/assign`, { userId }),
};

// Analytics API
export const analyticsAPI = {
  // Get dashboard analytics data
  getDashboardData: () =>
    api.get('/analytics/dashboard'),

  // Mock data for development and demonstration purposes
  getMockDashboardData: () => {
    // Simulated API response
    return Promise.resolve({
      data: {
        status: 'success',
        data: {
          stats: {
            totalRevenue: 1250000,
            totalClients: 45,
            totalCaseStudies: 28,
            totalServices: 12,
            totalTeamMembers: 18,
            projectsCompleted: 67,
            activeProjects: 15,
            clientSatisfaction: 92,
            conversionRate: 28,
            leadGeneration: 156,
            averageDealSize: 27800,
          },
          revenueData: [
            { month: 'Jan', revenue: 75000, target: 70000 },
            { month: 'Feb', revenue: 82000, target: 75000 },
            { month: 'Mar', revenue: 91000, target: 80000 },
            { month: 'Apr', revenue: 98000, target: 85000 },
            { month: 'May', revenue: 106000, target: 90000 },
            { month: 'Jun', revenue: 115000, target: 95000 },
            { month: 'Jul', revenue: 125000, target: 100000 },
            { month: 'Aug', revenue: 132000, target: 105000 },
            { month: 'Sep', revenue: 141000, target: 110000 },
            { month: 'Oct', revenue: 152000, target: 115000 },
            { month: 'Nov', revenue: 164000, target: 120000 },
            { month: 'Dec', revenue: 175000, target: 125000 },
          ],
          clientAcquisition: [
            { source: 'Referrals', clients: 18, percentage: 40 },
            { source: 'Website', clients: 12, percentage: 26.7 },
            { source: 'LinkedIn', clients: 8, percentage: 17.8 },
            { source: 'Events', clients: 4, percentage: 8.9 },
            { source: 'Other', clients: 3, percentage: 6.6 },
          ],
          servicePerformance: [
            { service: 'Digital Transformation', revenue: 320000, clients: 8, satisfaction: 92 },
            { service: 'Cloud Migration', revenue: 280000, clients: 7, satisfaction: 88 },
            { service: 'Software Development', revenue: 240000, clients: 12, satisfaction: 94 },
            { service: 'UX Design', revenue: 180000, clients: 9, satisfaction: 96 },
            { service: 'IT Consulting', revenue: 150000, clients: 5, satisfaction: 85 },
            { service: 'DevOps Implementation', revenue: 80000, clients: 4, satisfaction: 90 },
          ],
          projectStats: {
            onTrack: 11,
            atRisk: 3,
            delayed: 1,
            completed: 67,
            totalHours: 12450,
            billableHours: 10200,
            utilizationRate: 82,
          },
          regionalStats: [
            { region: 'North America', revenue: 650000, clients: 22, projects: 35 },
            { region: 'Europe', revenue: 350000, clients: 14, projects: 21 },
            { region: 'Asia Pacific', revenue: 180000, clients: 7, projects: 9 },
            { region: 'Other', revenue: 70000, clients: 2, projects: 2 },
          ],
          salesFunnel: [
            { stage: 'Leads', count: 156 },
            { stage: 'Qualified', count: 98 },
            { stage: 'Proposal', count: 64 },
            { stage: 'Negotiation', count: 38 },
            { stage: 'Closed Won', count: 28 },
            { stage: 'Closed Lost', count: 36 },
          ],
          teamPerformance: [
            { member: 'Alex Johnson', role: 'Solution Architect', utilization: 87, satisfaction: 95, projects: 7 },
            { member: 'Maria Garcia', role: 'Senior Developer', utilization: 92, satisfaction: 88, projects: 5 },
            { member: 'David Kim', role: 'UX Designer', utilization: 85, satisfaction: 92, projects: 8 },
            { member: 'Sarah Williams', role: 'Project Manager', utilization: 90, satisfaction: 94, projects: 6 },
            { member: 'James Chen', role: 'DevOps Engineer', utilization: 88, satisfaction: 90, projects: 4 },
          ],
          recentActivity: [
            {
              id: '1',
              type: 'project',
              title: 'Digital Transformation for ABC Corp',
              description: 'Project completed successfully and delivered 2 weeks ahead of schedule',
              timestamp: '2023-05-15T10:30:00Z',
              status: 'completed'
            },
            {
              id: '2',
              type: 'case-study',
              title: 'Cloud Migration Success Story',
              description: 'New case study published for XYZ Financial Services',
              timestamp: '2023-05-12T14:45:00Z',
              status: 'published'
            },
            {
              id: '3',
              type: 'service',
              title: 'DevSecOps as a Service',
              description: 'New service offering launched',
              timestamp: '2023-05-10T09:15:00Z',
              status: 'active'
            },
            {
              id: '4',
              type: 'client',
              title: 'Onboarded Global Retail Inc.',
              description: 'New enterprise client with initial project value of $180,000',
              timestamp: '2023-05-08T11:20:00Z',
              status: 'new'
            },
            {
              id: '5',
              type: 'team',
              title: 'New Team Member',
              description: 'Welcomed Jane Smith as Senior Data Scientist',
              timestamp: '2023-05-05T13:10:00Z',
              status: 'active'
            }
          ]
        }
      }
    });
  },

  // Get service-specific analytics
  getServiceAnalytics: (serviceId: string) =>
    api.get(`/analytics/services/${serviceId}`),

  // Get case study analytics
  getCaseStudyAnalytics: (caseStudyId: string) =>
    api.get(`/analytics/case-studies/${caseStudyId}`),

  // Get client analytics
  getClientAnalytics: (clientId: string) =>
    api.get(`/analytics/clients/${clientId}`),

  // Get team performance analytics
  getTeamAnalytics: () =>
    api.get('/analytics/team'),

  // Get financial analytics
  getFinancialAnalytics: (timeframe: string) =>
    api.get(`/analytics/financial?timeframe=${timeframe}`),
};

export default api;
