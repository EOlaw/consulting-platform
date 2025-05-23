/**
 * Authentication Routes
 */
const express = require('express');
const authController = require('../controllers/auth-controller');
const { validateUserCreate } = require('../../middleware/validation-middleware');

const router = express.Router();

// Public routes
router.post('/register', validateUserCreate, authController.register);
router.post('/login', authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
