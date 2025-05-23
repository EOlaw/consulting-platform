/**
 * Case Study Routes
 */
const express = require('express');
const caseStudyController = require('../controllers/case-study-controller');
const { authenticate } = require('../../middleware/auth-middleware');
const { restrictTo, belongsToOrganization } = require('../../middleware/role-middleware');

const router = express.Router();

// Public routes
router.get('/', caseStudyController.getAllCaseStudies);
router.get('/organization/:organizationId', caseStudyController.getCaseStudiesByOrganization);
router.get('/view/:idOrSlug', caseStudyController.getCaseStudyByIdOrSlug);
router.get('/:id/related', caseStudyController.getRelatedCaseStudies);

// Protected routes - require authentication
router.use(authenticate);

// Create and manage case studies
router.post('/', caseStudyController.createCaseStudy);

router.route('/:id')
  .patch(caseStudyController.updateCaseStudy)
  .delete(restrictTo('admin', 'super-admin', 'consultant'), caseStudyController.deleteCaseStudy);

// Testimonial management
router.patch('/:id/testimonial', caseStudyController.updateCaseStudyTestimonial);

// Image management
router.route('/:id/images')
  .post(caseStudyController.addCaseStudyImage);

router.route('/:id/images/:imageId')
  .delete(caseStudyController.removeCaseStudyImage);

// SEO management
router.patch('/:id/seo', caseStudyController.updateCaseStudySEO);

module.exports = router;
