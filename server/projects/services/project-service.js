/**
 * Project Service
 * Handles business logic for project operations
 */
const Project = require('../models/project-model');
const Organization = require('../../organizations/models/organization-model');
const User = require('../../users/models/user-model');
const { AppError } = require('../../utils/app-error');

class ProjectService {
  /**
   * Get all projects with pagination and filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{projects: Array, total: Number, page: Number, limit: Number}>}
   */
  async getAllProjects(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt', populate = '' } = options;
    const skip = (page - 1) * limit;

    // Count total before applying pagination
    const total = await Project.countDocuments(filter);

    // Get projects with pagination
    let query = Project.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Apply population if specified
    if (populate) {
      query = query.populate(populate);
    }

    const projects = await query;

    return {
      projects,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get projects by organization ID
   * @param {String} organizationId - Organization ID
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{projects: Array, total: Number, page: Number, limit: Number}>}
   */
  async getProjectsByOrganization(organizationId, options = {}) {
    const filter = { organization: organizationId };
    return this.getAllProjects(filter, options);
  }

  /**
   * Get projects assigned to a user
   * @param {String} userId - User ID
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{projects: Array, total: Number, page: Number, limit: Number}>}
   */
  async getProjectsByUser(userId, options = {}) {
    const filter = {
      $or: [
        { 'team.user': userId },
        { manager: userId },
        { createdBy: userId }
      ]
    };
    return this.getAllProjects(filter, options);
  }

  /**
   * Get a project by ID
   * @param {String} projectId - The project ID
   * @param {String} populate - Fields to populate
   * @returns {Promise<Project>}
   */
  async getProjectById(projectId, populate = '') {
    let query = Project.findById(projectId);

    if (populate) {
      query = query.populate(populate);
    }

    const project = await query;

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return project;
  }

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @param {String} userId - User ID of the creator
   * @returns {Promise<Project>}
   */
  async createProject(projectData, userId) {
    // Check if organization exists
    const organization = await Organization.findById(projectData.organization);

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    // Check if client organization exists
    const client = await Organization.findById(projectData.client);

    if (!client) {
      throw new AppError('Client organization not found', 404);
    }

    // Check if manager exists
    const manager = await User.findById(projectData.manager);

    if (!manager) {
      throw new AppError('Manager not found', 404);
    }

    // Create project
    const projectToCreate = {
      ...projectData,
      createdBy: userId,
      // Add creator to team if not already included
      team: projectData.team || [{
        user: userId,
        role: 'Project Manager',
        addedAt: Date.now()
      }]
    };

    const project = await Project.create(projectToCreate);

    // Populate referenced fields for response
    return await Project.findById(project._id)
      .populate('client', 'name logo')
      .populate('manager', 'firstName lastName email')
      .populate('organization', 'name')
      .populate('team.user', 'firstName lastName email');
  }

  /**
   * Update a project
   * @param {String} projectId - Project ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Project>}
   */
  async updateProject(projectId, updateData) {
    // If client is being updated, check if it exists
    if (updateData.client) {
      const client = await Organization.findById(updateData.client);

      if (!client) {
        throw new AppError('Client organization not found', 404);
      }
    }

    // If manager is being updated, check if they exist
    if (updateData.manager) {
      const manager = await User.findById(updateData.manager);

      if (!manager) {
        throw new AppError('Manager not found', 404);
      }
    }

    const project = await Project.findByIdAndUpdate(
      projectId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Populate referenced fields for response
    return await Project.findById(project._id)
      .populate('client', 'name logo')
      .populate('manager', 'firstName lastName email')
      .populate('organization', 'name')
      .populate('team.user', 'firstName lastName email');
  }

  /**
   * Delete a project
   * @param {String} projectId - Project ID
   * @returns {Promise<Object>}
   */
  async deleteProject(projectId) {
    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return { message: 'Project deleted successfully' };
  }

  /**
   * Get project team
   * @param {String} projectId - Project ID
   * @returns {Promise<Array>}
   */
  async getProjectTeam(projectId) {
    const project = await Project.findById(projectId)
      .populate('team.user', 'firstName lastName email role profileImage');

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return project.team;
  }

  /**
   * Add a team member to a project
   * @param {String} projectId - Project ID
   * @param {String} userId - User ID to add as team member
   * @param {Object} memberData - Member data (role, hoursAllocated)
   * @returns {Promise<Project>}
   */
  async addProjectTeamMember(projectId, userId, memberData) {
    // Check if user exists
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if project exists
    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if user is already a team member
    const isTeamMember = project.team.some(
      member => member.user.toString() === userId
    );

    if (isTeamMember) {
      throw new AppError('User is already a team member of this project', 400);
    }

    // Add user to project team
    project.team.push({
      user: userId,
      role: memberData.role || 'Team Member',
      hoursAllocated: memberData.hoursAllocated || 0,
      addedAt: Date.now()
    });

    await project.save();

    // Populate team member data for response
    return await Project.findById(project._id)
      .populate('team.user', 'firstName lastName email role profileImage');
  }

  /**
   * Update a team member in a project
   * @param {String} projectId - Project ID
   * @param {String} userId - User ID to update
   * @param {Object} updateData - Data to update (role, hoursAllocated)
   * @returns {Promise<Project>}
   */
  async updateProjectTeamMember(projectId, userId, updateData) {
    // Check if project exists
    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Find team member index
    const memberIndex = project.team.findIndex(
      member => member.user.toString() === userId
    );

    if (memberIndex === -1) {
      throw new AppError('User is not a team member of this project', 404);
    }

    // Update team member
    if (updateData.role) {
      project.team[memberIndex].role = updateData.role;
    }

    if (updateData.hoursAllocated !== undefined) {
      project.team[memberIndex].hoursAllocated = updateData.hoursAllocated;
    }

    await project.save();

    // Populate team member data for response
    return await Project.findById(project._id)
      .populate('team.user', 'firstName lastName email role profileImage');
  }

  /**
   * Remove a team member from a project
   * @param {String} projectId - Project ID
   * @param {String} userId - User ID to remove
   * @returns {Promise<Project>}
   */
  async removeProjectTeamMember(projectId, userId) {
    // Check if project exists
    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if user is the project manager
    if (project.manager.toString() === userId) {
      throw new AppError('Cannot remove the project manager', 400);
    }

    // Find team member index
    const memberIndex = project.team.findIndex(
      member => member.user.toString() === userId
    );

    if (memberIndex === -1) {
      throw new AppError('User is not a team member of this project', 404);
    }

    // Remove team member
    project.team.splice(memberIndex, 1);

    await project.save();

    // Populate team member data for response
    return await Project.findById(project._id)
      .populate('team.user', 'firstName lastName email role profileImage');
  }

  /**
   * Update project status
   * @param {String} projectId - Project ID
   * @param {String} status - New status
   * @returns {Promise<Project>}
   */
  async updateProjectStatus(projectId, status) {
    // Validate status
    const validStatuses = ['planning', 'in-progress', 'on-hold', 'completed', 'canceled'];

    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const project = await Project.findByIdAndUpdate(
      projectId,
      { status },
      { new: true, runValidators: true }
    );

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return project;
  }

  /**
   * Add a milestone to a project
   * @param {String} projectId - Project ID
   * @param {Object} milestoneData - Milestone data
   * @returns {Promise<Project>}
   */
  async addProjectMilestone(projectId, milestoneData) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    project.milestones.push(milestoneData);

    await project.save();

    return project;
  }

  /**
   * Update a project milestone
   * @param {String} projectId - Project ID
   * @param {String} milestoneId - Milestone ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Project>}
   */
  async updateProjectMilestone(projectId, milestoneId, updateData) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const milestone = project.milestones.id(milestoneId);

    if (!milestone) {
      throw new AppError('Milestone not found', 404);
    }

    // Update milestone fields
    Object.keys(updateData).forEach(key => {
      milestone[key] = updateData[key];
    });

    // If status is changed to completed, set completedAt
    if (updateData.status === 'completed' && !milestone.completedAt) {
      milestone.completedAt = Date.now();
    }

    await project.save();

    return project;
  }
}

module.exports = new ProjectService();
