/**
 * Service Routes
 */
const express = require('express');
const serviceController = require('../controllers/service-controller');
const { authenticate } = require('../../middleware/auth-middleware');
const roleMiddleware = require('../../middleware/role-middleware');

const router = express.Router();

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/featured', serviceController.getFeaturedServices);
router.get('/category/:category', serviceController.getServicesByCategory);
router.get('/slug/:slug', serviceController.getServiceBySlug);

// Protected routes
// router.use(authenticate);

// Routes for authenticated users
router.get('/:id', serviceController.getServiceById);

// Routes requiring specific roles
router.post(
  '/',
  // roleMiddleware.restrictTo('admin', 'manager', 'consultant'),
  serviceController.createService
);

router.patch(
  '/:id',
  // roleMiddleware.restrictTo('admin', 'manager', 'consultant'),
  serviceController.updateService
);

router.delete(
  '/:id',
  // roleMiddleware.restrictTo('admin', 'manager'),
  serviceController.deleteService
);

// Case study relation routes
router.post(
  '/:id/case-studies',
  // roleMiddleware.restrictTo('admin', 'manager'),
  serviceController.addRelatedCaseStudy
);

router.delete(
  '/:id/case-studies/:caseStudyId',
  // roleMiddleware.restrictTo('admin', 'manager'),
  serviceController.removeRelatedCaseStudy
);

module.exports = router;
