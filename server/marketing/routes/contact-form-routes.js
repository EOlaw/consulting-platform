/**
 * Contact Form Routes
 */
const express = require('express');
const contactFormController = require('../controllers/contact-form-controller');
const { authenticate } = require('../../middleware/auth-middleware');
const roleMiddleware = require('../../middleware/role-middleware');

const router = express.Router();

// Public route for form submission
router.post('/', contactFormController.createSubmission);

// Protected routes for management
router.use(authenticate);

// Routes for authenticated users with appropriate roles
router.get(
  '/',
  roleMiddleware.restrictTo('admin', 'manager', 'consultant'),
  contactFormController.getAllSubmissions
);

router.get(
  '/:id',
  roleMiddleware.restrictTo('admin', 'manager', 'consultant'),
  contactFormController.getSubmissionById
);

router.patch(
  '/:id',
  roleMiddleware.restrictTo('admin', 'manager', 'consultant'),
  contactFormController.updateSubmission
);

router.delete(
  '/:id',
  roleMiddleware.restrictTo('admin', 'manager'),
  contactFormController.deleteSubmission
);

router.post(
  '/:id/assign',
  roleMiddleware.restrictTo('admin', 'manager'),
  contactFormController.assignSubmission
);

module.exports = router;
