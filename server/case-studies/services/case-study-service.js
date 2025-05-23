/**
 * Case Study Service
 * Handles business logic for case study operations
 */
const CaseStudy = require('../models/case-study-model');
const Organization = require('../../organizations/models/organization-model');
const Project = require('../../projects/models/project-model');
const { AppError } = require('../../utils/app-error');

class CaseStudyService {
  /**
   * Get all case studies with pagination and filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{caseStudies: Array, total: Number, page: Number, limit: Number}>}
   */
  async getAllCaseStudies(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt', populate = '' } = options;
    const skip = (page - 1) * limit;

    // Default to only published case studies for public access
    if (!filter.publishStatus) {
      filter.publishStatus = 'published';
    }

    // Count total before applying pagination
    const total = await CaseStudy.countDocuments(filter);

    // Get case studies with pagination
    let query = CaseStudy.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Apply population if specified
    if (populate) {
      query = query.populate(populate);
    }

    const caseStudies = await query;

    return {
      caseStudies,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get case studies by organization ID
   * @param {String} organizationId - Organization ID
   * @param {Object} options - Pagination and sorting options
   * @param {Boolean} includeNonPublished - Whether to include non-published case studies
   * @returns {Promise<{caseStudies: Array, total: Number, page: Number, limit: Number}>}
   */
  async getCaseStudiesByOrganization(organizationId, options = {}, includeNonPublished = false) {
    const filter = { organization: organizationId };

    if (!includeNonPublished) {
      filter.publishStatus = 'published';
    }

    return this.getAllCaseStudies(filter, options);
  }

  /**
   * Get a case study by ID or slug
   * @param {String} idOrSlug - The case study ID or slug
   * @param {String} populate - Fields to populate
   * @returns {Promise<CaseStudy>}
   */
  async getCaseStudyByIdOrSlug(idOrSlug, populate = '') {
    const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);

    let query;
    if (isObjectId) {
      query = CaseStudy.findById(idOrSlug);
    } else {
      query = CaseStudy.findOne({ slug: idOrSlug });
    }

    if (populate) {
      query = query.populate(populate);
    }

    const caseStudy = await query;

    if (!caseStudy) {
      throw new AppError('Case study not found', 404);
    }

    return caseStudy;
  }

  /**
   * Create a new case study
   * @param {Object} caseStudyData - Case study data
   * @param {String} userId - User ID of the creator
   * @returns {Promise<CaseStudy>}
   */
  async createCaseStudy(caseStudyData, userId) {
    // Check if organization exists
    const organization = await Organization.findById(caseStudyData.organization);

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    // Check if project exists if provided
    if (caseStudyData.project) {
      const project = await Project.findById(caseStudyData.project);

      if (!project) {
        throw new AppError('Project not found', 404);
      }
    }

    // Create case study
    const caseStudyToCreate = {
      ...caseStudyData,
      createdBy: userId
    };

    const caseStudy = await CaseStudy.create(caseStudyToCreate);

    // Populate referenced fields for response
    return await CaseStudy.findById(caseStudy._id)
      .populate('organization', 'name')
      .populate('createdBy', 'firstName lastName email')
      .populate('project', 'name');
  }

  /**
   * Update a case study
   * @param {String} caseStudyId - Case study ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<CaseStudy>}
   */
  async updateCaseStudy(caseStudyId, updateData) {
    // Check if project exists if being updated
    if (updateData.project) {
      const project = await Project.findById(updateData.project);

      if (!project) {
        throw new AppError('Project not found', 404);
      }
    }

    // If publishing, add published date
    if (updateData.publishStatus === 'published' && !updateData.publishedAt) {
      updateData.publishedAt = Date.now();
    }

    const caseStudy = await CaseStudy.findByIdAndUpdate(
      caseStudyId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!caseStudy) {
      throw new AppError('Case study not found', 404);
    }

    // Populate referenced fields for response
    return await CaseStudy.findById(caseStudy._id)
      .populate('organization', 'name')
      .populate('createdBy', 'firstName lastName email')
      .populate('project', 'name');
  }

  /**
   * Delete a case study
   * @param {String} caseStudyId - Case study ID
   * @returns {Promise<Object>}
   */
  async deleteCaseStudy(caseStudyId) {
    const caseStudy = await CaseStudy.findByIdAndDelete(caseStudyId);

    if (!caseStudy) {
      throw new AppError('Case study not found', 404);
    }

    return { message: 'Case study deleted successfully' };
  }

  /**
   * Get related case studies
   * @param {String} caseStudyId - Case study ID
   * @param {Number} limit - Number of related case studies to get
   * @returns {Promise<Array>}
   */
  async getRelatedCaseStudies(caseStudyId, limit = 3) {
    const caseStudy = await CaseStudy.findById(caseStudyId);

    if (!caseStudy) {
      throw new AppError('Case study not found', 404);
    }

    // Find case studies with the same categories or tags, but not the same ID
    const relatedCaseStudies = await CaseStudy.find({
      _id: { $ne: caseStudyId },
      publishStatus: 'published',
      $or: [
        { categories: { $in: caseStudy.categories } },
        { tags: { $in: caseStudy.tags } }
      ]
    })
    .limit(limit)
    .populate('organization', 'name')
    .populate('client.organization', 'name logo');

    return relatedCaseStudies;
  }

  /**
   * Update case study testimonial
   * @param {String} caseStudyId - Case study ID
   * @param {Object} testimonialData - Testimonial data
   * @returns {Promise<CaseStudy>}
   */
  async updateCaseStudyTestimonial(caseStudyId, testimonialData) {
    const caseStudy = await CaseStudy.findById(caseStudyId);

    if (!caseStudy) {
      throw new AppError('Case study not found', 404);
    }

    caseStudy.testimonial = testimonialData;

    await caseStudy.save();

    return caseStudy;
  }

  /**
   * Add an image to a case study
   * @param {String} caseStudyId - Case study ID
   * @param {Object} imageData - Image data (url, caption, order)
   * @returns {Promise<CaseStudy>}
   */
  async addCaseStudyImage(caseStudyId, imageData) {
    const caseStudy = await CaseStudy.findById(caseStudyId);

    if (!caseStudy) {
      throw new AppError('Case study not found', 404);
    }

    caseStudy.images.push(imageData);

    await caseStudy.save();

    return caseStudy;
  }

  /**
   * Remove an image from a case study
   * @param {String} caseStudyId - Case study ID
   * @param {String} imageId - Image ID to remove
   * @returns {Promise<CaseStudy>}
   */
  async removeCaseStudyImage(caseStudyId, imageId) {
    const caseStudy = await CaseStudy.findById(caseStudyId);

    if (!caseStudy) {
      throw new AppError('Case study not found', 404);
    }

    const imageIndex = caseStudy.images.findIndex(img => img._id.toString() === imageId);

    if (imageIndex === -1) {
      throw new AppError('Image not found', 404);
    }

    caseStudy.images.splice(imageIndex, 1);

    await caseStudy.save();

    return caseStudy;
  }

  /**
   * Update case study SEO information
   * @param {String} caseStudyId - Case study ID
   * @param {Object} seoData - SEO data
   * @returns {Promise<CaseStudy>}
   */
  async updateCaseStudySEO(caseStudyId, seoData) {
    const caseStudy = await CaseStudy.findById(caseStudyId);

    if (!caseStudy) {
      throw new AppError('Case study not found', 404);
    }

    caseStudy.seo = { ...caseStudy.seo, ...seoData };

    await caseStudy.save();

    return caseStudy;
  }
}

module.exports = new CaseStudyService();
