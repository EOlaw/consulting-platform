/**
 * Organization Routes
 */
const express = require('express');
const organizationController = require('../controllers/organization-controller');
const { authenticate } = require('../../middleware/auth-middleware');
const { restrictTo, isOrganizationAdmin, belongsToOrganization } = require('../../middleware/role-middleware');
const { validateOrganizationCreate } = require('../../middleware/validation-middleware');

const router = express.Router();

// All organization routes require authentication
router.use(authenticate);

// Get current user's organization
router.get('/me', organizationController.getCurrentUserOrganization);

// Routes for all authenticated users
router.route('/')
  .get(restrictTo('admin', 'super-admin'), organizationController.getAllOrganizations)
  .post(validateOrganizationCreate, organizationController.createOrganization);

// Routes requiring organization ID
router.route('/:id')
  .get(belongsToOrganization('id'), organizationController.getOrganizationById)
  .patch(isOrganizationAdmin('id'), organizationController.updateOrganization)
  .delete(isOrganizationAdmin('id'), organizationController.deleteOrganization);

// Member management routes
router.route('/:id/members')
  .get(belongsToOrganization('id'), organizationController.getOrganizationMembers)
  .post(isOrganizationAdmin('id'), organizationController.addOrganizationMember);

router.route('/:id/members/:userId')
  .patch(isOrganizationAdmin('id'), organizationController.updateOrganizationMember)
  .delete(isOrganizationAdmin('id'), organizationController.removeOrganizationMember);

module.exports = router;
