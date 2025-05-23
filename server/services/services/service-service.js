/**
 * Service Service Class
 */
const Service = require('../models/service-model');
const AppError = require('../../utils/app-error');
const mongoose = require('mongoose');

class ServiceService {
  /**
   * Create a new service
   * @param {Object} serviceData - The service data
   * @returns {Promise<Object>} - The created service
   */
  async createService(serviceData) {
    try {
      const service = await Service.create(serviceData);
      return service;
    } catch (error) {
      throw new AppError(`Failed to create service: ${error.message}`, 400);
    }
  }

  /**
   * Get all services with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (sorting, pagination)
   * @returns {Promise<Array>} - List of services
   */
  async getAllServices(filter = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        category,
        status,
        organization,
        search
      } = options;

      const skip = (page - 1) * limit;

      // Build query filters
      const queryFilter = { ...filter };

      if (category) queryFilter.category = category;
      if (status) queryFilter.status = status;
      if (organization) queryFilter.organization = organization;

      // Search in title and description
      if (search) {
        queryFilter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { shortDescription: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort option
      const sortOption = {};
      sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query with pagination
      const services = await Service.find(queryFilter)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('organization', 'name logo')
        .populate('createdBy', 'firstName lastName email profileImage')
        .populate('relatedCaseStudies', 'title slug featuredImage')
        .populate('relatedServices', 'title slug icon');

      // Get total count for pagination
      const total = await Service.countDocuments(queryFilter);

      return {
        services,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new AppError(`Failed to fetch services: ${error.message}`, 500);
    }
  }

  /**
   * Get service by ID
   * @param {string} serviceId - The service ID
   * @returns {Promise<Object>} - The service
   */
  async getServiceById(serviceId) {
    try {
      const service = await Service.findById(serviceId)
        .populate('organization', 'name logo')
        .populate('createdBy', 'firstName lastName email profileImage')
        .populate('relatedCaseStudies', 'title slug featuredImage summary')
        .populate('relatedServices', 'title slug icon shortDescription');

      if (!service) {
        throw new AppError('Service not found', 404);
      }

      return service;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === 'CastError') throw new AppError('Invalid service ID', 400);
      throw new AppError(`Failed to fetch service: ${error.message}`, 500);
    }
  }

  /**
   * Get service by slug
   * @param {string} slug - The service slug
   * @returns {Promise<Object>} - The service
   */
  async getServiceBySlug(slug) {
    try {
      const service = await Service.findOne({ slug })
        .populate('organization', 'name logo')
        .populate('createdBy', 'firstName lastName email profileImage')
        .populate('relatedCaseStudies', 'title slug featuredImage summary')
        .populate('relatedServices', 'title slug icon shortDescription');

      if (!service) {
        throw new AppError('Service not found', 404);
      }

      return service;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to fetch service: ${error.message}`, 500);
    }
  }

  /**
   * Update service
   * @param {string} serviceId - The service ID
   * @param {Object} updateData - The update data
   * @returns {Promise<Object>} - The updated service
   */
  async updateService(serviceId, updateData) {
    try {
      const service = await Service.findByIdAndUpdate(
        serviceId,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('organization', 'name logo')
        .populate('createdBy', 'firstName lastName email profileImage');

      if (!service) {
        throw new AppError('Service not found', 404);
      }

      return service;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === 'CastError') throw new AppError('Invalid service ID', 400);
      throw new AppError(`Failed to update service: ${error.message}`, 500);
    }
  }

  /**
   * Delete service
   * @param {string} serviceId - The service ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteService(serviceId) {
    try {
      const service = await Service.findByIdAndDelete(serviceId);

      if (!service) {
        throw new AppError('Service not found', 404);
      }

      return { message: 'Service deleted successfully' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === 'CastError') throw new AppError('Invalid service ID', 400);
      throw new AppError(`Failed to delete service: ${error.message}`, 500);
    }
  }

  /**
   * Get featured services
   * @param {number} limit - Number of services to return
   * @returns {Promise<Array>} - List of featured services
   */
  async getFeaturedServices(limit = 6) {
    try {
      const services = await Service.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('organization', 'name logo')
        .select('title slug shortDescription icon featuredImage');

      return services;
    } catch (error) {
      throw new AppError(`Failed to fetch featured services: ${error.message}`, 500);
    }
  }

  /**
   * Get services by category
   * @param {string} category - The category
   * @param {number} limit - Number of services to return
   * @returns {Promise<Array>} - List of services in the category
   */
  async getServicesByCategory(category, limit = 10) {
    try {
      const services = await Service.find({
        category,
        status: 'published'
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('organization', 'name logo')
        .select('title slug shortDescription icon featuredImage');

      return services;
    } catch (error) {
      throw new AppError(`Failed to fetch services by category: ${error.message}`, 500);
    }
  }

  /**
   * Add related case study to service
   * @param {string} serviceId - The service ID
   * @param {string} caseStudyId - The case study ID
   * @returns {Promise<Object>} - The updated service
   */
  async addRelatedCaseStudy(serviceId, caseStudyId) {
    try {
      const service = await Service.findByIdAndUpdate(
        serviceId,
        { $addToSet: { relatedCaseStudies: caseStudyId } },
        { new: true, runValidators: true }
      );

      if (!service) {
        throw new AppError('Service not found', 404);
      }

      return service;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === 'CastError') throw new AppError('Invalid ID', 400);
      throw new AppError(`Failed to add related case study: ${error.message}`, 500);
    }
  }

  /**
   * Remove related case study from service
   * @param {string} serviceId - The service ID
   * @param {string} caseStudyId - The case study ID
   * @returns {Promise<Object>} - The updated service
   */
  async removeRelatedCaseStudy(serviceId, caseStudyId) {
    try {
      const service = await Service.findByIdAndUpdate(
        serviceId,
        { $pull: { relatedCaseStudies: caseStudyId } },
        { new: true, runValidators: true }
      );

      if (!service) {
        throw new AppError('Service not found', 404);
      }

      return service;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === 'CastError') throw new AppError('Invalid ID', 400);
      throw new AppError(`Failed to remove related case study: ${error.message}`, 500);
    }
  }
}

module.exports = new ServiceService();
