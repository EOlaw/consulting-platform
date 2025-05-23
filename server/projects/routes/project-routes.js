/**
 * Project Routes
 */
const express = require('express');
const projectController = require('../controllers/project-controller');
const { authenticate } = require('../../middleware/auth-middleware');
const { restrictTo, belongsToOrganization } = require('../../middleware/role-middleware');
const { validateProjectCreate } = require('../../middleware/validation-middleware');

const router = express.Router();

// All project routes require authentication
router.use(authenticate);

// Get current user's projects
router.get('/me', projectController.getMyProjects);

// Get projects by organization
router.get('/organization/:organizationId', belongsToOrganization('organizationId'), projectController.getProjectsByOrganization);

// Routes for all authenticated users
router.route('/')
  .get(projectController.getAllProjects)
  .post(validateProjectCreate, projectController.createProject);

// Routes requiring project ID
router.route('/:id')
  .get(projectController.getProjectById)
  .patch(projectController.updateProject)
  .delete(restrictTo('admin', 'super-admin', 'consultant'), projectController.deleteProject);

// Project status update
router.patch('/:id/status', projectController.updateProjectStatus);

// Team management routes
router.route('/:id/team')
  .get(projectController.getProjectTeam)
  .post(projectController.addProjectTeamMember);

router.route('/:id/team/:userId')
  .patch(projectController.updateProjectTeamMember)
  .delete(projectController.removeProjectTeamMember);

// Milestone management routes
router.route('/:id/milestones')
  .post(projectController.addProjectMilestone);

router.route('/:id/milestones/:milestoneId')
  .patch(projectController.updateProjectMilestone);

module.exports = router;
