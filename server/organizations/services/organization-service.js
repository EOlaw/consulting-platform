/**
 * Organization Service
 * Handles business logic for organization operations
 */
const Organization = require('../models/organization-model');
const User = require('../../users/models/user-model');
const { AppError } = require('../../utils/app-error');

class OrganizationService {
  /**
   * Get all organizations with pagination and filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{organizations: Array, total: Number, page: Number, limit: Number}>}
   */
  async getAllOrganizations(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt', populate = '' } = options;
    const skip = (page - 1) * limit;

    // Handle active filter (exclude inactive organizations by default)
    const queryFilter = { ...filter };
    if (!queryFilter.active) queryFilter.active = { $ne: false };

    // Count total before applying pagination
    const total = await Organization.countDocuments(queryFilter);

    // Get organizations with pagination
    let query = Organization.find(queryFilter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Apply population if specified
    if (populate) {
      query = query.populate(populate);
    }

    const organizations = await query;

    return {
      organizations,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get an organization by ID
   * @param {String} organizationId - The organization ID
   * @param {String} populate - Fields to populate
   * @returns {Promise<Organization>}
   */
  async getOrganizationById(organizationId, populate = '') {
    let query = Organization.findById(organizationId);

    if (populate) {
      query = query.populate(populate);
    }

    const organization = await query;

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    return organization;
  }

  /**
   * Create a new organization
   * @param {Object} organizationData - Organization data
   * @param {String} userId - User ID of the creator
   * @returns {Promise<Organization>}
   */
  async createOrganization(organizationData, userId) {
    // Check if user exists
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Create organization with owner
    const organizationToCreate = {
      ...organizationData,
      owner: userId,
      members: [{
        user: userId,
        role: 'owner',
        addedAt: Date.now()
      }]
    };

    const organization = await Organization.create(organizationToCreate);

    // Update user's organization reference
    await User.findByIdAndUpdate(userId, { organization: organization._id });

    return organization;
  }

  /**
   * Update an organization
   * @param {String} organizationId - Organization ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Organization>}
   */
  async updateOrganization(organizationId, updateData) {
    const organization = await Organization.findByIdAndUpdate(
      organizationId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    return organization;
  }

  /**
   * Delete an organization (soft delete)
   * @param {String} organizationId - Organization ID
   * @returns {Promise<Object>}
   */
  async deleteOrganization(organizationId) {
    const organization = await Organization.findByIdAndUpdate(
      organizationId,
      { active: false },
      { new: true }
    );

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    return { message: 'Organization deleted successfully' };
  }

  /**
   * Hard delete an organization (for testing or admin purposes)
   * @param {String} organizationId - Organization ID
   * @returns {Promise<Object>}
   */
  async hardDeleteOrganization(organizationId) {
    const organization = await Organization.findByIdAndDelete(organizationId);

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    // Remove organization reference from member users
    await User.updateMany(
      { organization: organizationId },
      { $unset: { organization: "" } }
    );

    return { message: 'Organization permanently deleted' };
  }

  /**
   * Get organization members
   * @param {String} organizationId - Organization ID
   * @returns {Promise<Array>}
   */
  async getOrganizationMembers(organizationId) {
    const organization = await Organization.findById(organizationId)
      .populate('members.user', 'firstName lastName email role profileImage');

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    return organization.members;
  }

  /**
   * Add a member to an organization
   * @param {String} organizationId - Organization ID
   * @param {String} userId - User ID to add as member
   * @param {String} role - Member role
   * @returns {Promise<Organization>}
   */
  async addOrganizationMember(organizationId, userId, role = 'member') {
    // Check if user exists
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if organization exists
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    // Check if user is already a member
    const isMember = organization.members.some(
      member => member.user.toString() === userId
    );

    if (isMember) {
      throw new AppError('User is already a member of this organization', 400);
    }

    // Add user to organization
    organization.members.push({
      user: userId,
      role,
      addedAt: Date.now()
    });

    await organization.save();

    // Update user's organization reference
    await User.findByIdAndUpdate(userId, { organization: organizationId });

    return organization;
  }

  /**
   * Update a member's role in an organization
   * @param {String} organizationId - Organization ID
   * @param {String} userId - User ID to update
   * @param {String} role - New role
   * @returns {Promise<Organization>}
   */
  async updateOrganizationMember(organizationId, userId, role) {
    // Check if organization exists
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    // Find member index
    const memberIndex = organization.members.findIndex(
      member => member.user.toString() === userId
    );

    if (memberIndex === -1) {
      throw new AppError('User is not a member of this organization', 404);
    }

    // Don't allow changing the role of the owner
    if (organization.members[memberIndex].role === 'owner' && role !== 'owner') {
      throw new AppError('Cannot change the role of the organization owner', 400);
    }

    // Update member role
    organization.members[memberIndex].role = role;

    await organization.save();

    return organization;
  }

  /**
   * Remove a member from an organization
   * @param {String} organizationId - Organization ID
   * @param {String} userId - User ID to remove
   * @returns {Promise<Organization>}
   */
  async removeOrganizationMember(organizationId, userId) {
    // Check if organization exists
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    // Cannot remove the owner
    const isOwner = organization.members.some(
      member => member.user.toString() === userId && member.role === 'owner'
    );

    if (isOwner) {
      throw new AppError('Cannot remove the organization owner', 400);
    }

    // Find member index
    const memberIndex = organization.members.findIndex(
      member => member.user.toString() === userId
    );

    if (memberIndex === -1) {
      throw new AppError('User is not a member of this organization', 404);
    }

    // Remove member
    organization.members.splice(memberIndex, 1);

    await organization.save();

    // Remove organization reference from user
    await User.findByIdAndUpdate(userId, { $unset: { organization: "" } });

    return organization;
  }
}

module.exports = new OrganizationService();
