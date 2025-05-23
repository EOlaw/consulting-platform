/**
 * Project Controller
 * Handles HTTP requests related to projects
 */
const projectService = require('../services/project-service');
const { catchAsync } = require('../../utils/catch-async');
const { AppError } = require('../../utils/app-error');

class ProjectController {
  /**
   * Get all projects with filtering and pagination
   */
  getAllProjects = catchAsync(async (req, res, next) => {
    const filter = { ...req.query };
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
      populate: req.query.populate
    };

    // Remove pagination and sorting options from filter
    ['page', 'limit', 'sort', 'populate'].forEach(el => delete filter[el]);

    // If not admin, only show projects from their organization
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      filter.organization = req.user.organization;
    }

    const result = await projectService.getAllProjects(filter, options);

    res.status(200).json({
      status: 'success',
      data: result.projects,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  });

  /**
   * Get projects by organization
   */
  getProjectsByOrganization = catchAsync(async (req, res, next) => {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
      populate: req.query.populate
    };

    const result = await projectService.getProjectsByOrganization(req.params.organizationId, options);

    res.status(200).json({
      status: 'success',
      data: result.projects,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  });

  /**
   * Get projects assigned to current user
   */
  getMyProjects = catchAsync(async (req, res, next) => {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
      populate: req.query.populate || 'client,manager'
    };

    const result = await projectService.getProjectsByUser(req.user.id, options);

    res.status(200).json({
      status: 'success',
      data: result.projects,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  });

  /**
   * Get project by ID
   */
  getProjectById = catchAsync(async (req, res, next) => {
    const project = await projectService.getProjectById(
      req.params.id,
      req.query.populate || 'client,manager,team.user,organization'
    );

    res.status(200).json({
      status: 'success',
      data: project
    });
  });

  /**
   * Create a new project
   */
  createProject = catchAsync(async (req, res, next) => {
    // Default to current user's organization if not specified
    if (!req.body.organization && req.user.organization) {
      req.body.organization = req.user.organization;
    }

    // Default to current user as manager if not specified
    if (!req.body.manager) {
      req.body.manager = req.user.id;
    }

    const project = await projectService.createProject(req.body, req.user.id);

    res.status(201).json({
      status: 'success',
      data: project
    });
  });

  /**
   * Update a project
   */
  updateProject = catchAsync(async (req, res, next) => {
    const project = await projectService.updateProject(req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      data: project
    });
  });

  /**
   * Delete a project
   */
  deleteProject = catchAsync(async (req, res, next) => {
    await projectService.deleteProject(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  /**
   * Get project team
   */
  getProjectTeam = catchAsync(async (req, res, next) => {
    const team = await projectService.getProjectTeam(req.params.id);

    res.status(200).json({
      status: 'success',
      data: team
    });
  });

  /**
   * Add a team member to a project
   */
  addProjectTeamMember = catchAsync(async (req, res, next) => {
    const { userId, role, hoursAllocated } = req.body;

    if (!userId) {
      return next(new AppError('User ID is required', 400));
    }

    const project = await projectService.addProjectTeamMember(
      req.params.id,
      userId,
      { role, hoursAllocated }
    );

    res.status(200).json({
      status: 'success',
      data: project.team
    });
  });

  /**
   * Update a team member in a project
   */
  updateProjectTeamMember = catchAsync(async (req, res, next) => {
    const { role, hoursAllocated } = req.body;

    const project = await projectService.updateProjectTeamMember(
      req.params.id,
      req.params.userId,
      { role, hoursAllocated }
    );

    res.status(200).json({
      status: 'success',
      data: project.team
    });
  });

  /**
   * Remove a team member from a project
   */
  removeProjectTeamMember = catchAsync(async (req, res, next) => {
    const project = await projectService.removeProjectTeamMember(
      req.params.id,
      req.params.userId
    );

    res.status(200).json({
      status: 'success',
      data: project.team
    });
  });

  /**
   * Update project status
   */
  updateProjectStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;

    if (!status) {
      return next(new AppError('Status is required', 400));
    }

    const project = await projectService.updateProjectStatus(req.params.id, status);

    res.status(200).json({
      status: 'success',
      data: project
    });
  });

  /**
   * Add a milestone to a project
   */
  addProjectMilestone = catchAsync(async (req, res, next) => {
    const { title, description, dueDate } = req.body;

    if (!title || !dueDate) {
      return next(new AppError('Title and due date are required', 400));
    }

    const project = await projectService.addProjectMilestone(
      req.params.id,
      { title, description, dueDate, status: 'pending' }
    );

    res.status(200).json({
      status: 'success',
      data: project.milestones
    });
  });

  /**
   * Update a project milestone
   */
  updateProjectMilestone = catchAsync(async (req, res, next) => {
    const project = await projectService.updateProjectMilestone(
      req.params.id,
      req.params.milestoneId,
      req.body
    );

    res.status(200).json({
      status: 'success',
      data: project.milestones
    });
  });
}

module.exports = new ProjectController();
