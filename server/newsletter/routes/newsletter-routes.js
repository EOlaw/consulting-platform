/**
 * Newsletter Routes
 */
const express = require('express');
const subscriberController = require('../controllers/subscriber-controller');
const campaignController = require('../controllers/campaign-controller');
const { authenticate } = require('../../middleware/auth-middleware');
const { restrictTo } = require('../../middleware/role-middleware');

const router = express.Router();

// Public subscriber routes
router.post('/subscribe', subscriberController.subscribe);
router.get('/verify/:token', subscriberController.verifySubscriber);
router.post('/unsubscribe', subscriberController.unsubscribe);

// Protected subscriber routes - require authentication and admin role
router.use('/subscribers', authenticate, restrictTo('admin', 'super-admin'));

router.route('/subscribers')
  .get(subscriberController.getAllSubscribers);

router.route('/subscribers/:id')
  .get(subscriberController.getSubscriberById)
  .patch(subscriberController.updatePreferences)
  .delete(subscriberController.deleteSubscriber);

router.post('/subscribers/unsubscribe-by-email', subscriberController.unsubscribeByEmail);

// Protected campaign routes - require authentication and admin role
router.use('/campaigns', authenticate, restrictTo('admin', 'super-admin'));

router.route('/campaigns')
  .get(campaignController.getAllCampaigns)
  .post(campaignController.createCampaign);

router.route('/campaigns/:id')
  .get(campaignController.getCampaignById)
  .patch(campaignController.updateCampaign)
  .delete(campaignController.deleteCampaign);

router.post('/campaigns/:id/schedule', campaignController.scheduleCampaign);
router.post('/campaigns/:id/send', campaignController.sendCampaign);
router.get('/campaigns/:id/stats', campaignController.getCampaignStats);
router.post('/campaigns/process-scheduled', campaignController.processScheduledCampaigns);

module.exports = router;
