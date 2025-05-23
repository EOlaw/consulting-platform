/**
 * Blog Routes
 */
const express = require('express');
const blogController = require('../controllers/blog-controller');
const { authenticate } = require('../../middleware/auth-middleware');
const { restrictTo } = require('../../middleware/role-middleware');

const router = express.Router();

// Public routes
router.get('/', blogController.getAllPosts);
router.get('/published', blogController.getPublishedPosts);
router.get('/featured', blogController.getFeaturedPosts);
router.get('/category/:category', blogController.getPostsByCategory);
router.get('/tag/:tag', blogController.getPostsByTag);
router.get('/author/:authorId', blogController.getPostsByAuthor);
router.get('/view/:idOrSlug', blogController.getPostByIdOrSlug);
router.get('/:id/related', blogController.getRelatedPosts);

// Protected routes - require authentication
router.use(authenticate);

// Routes for post creation, editing, and deletion
router.route('/')
  .post(restrictTo('admin', 'super-admin', 'consultant'), blogController.createPost);

router.route('/:id')
  .patch(restrictTo('admin', 'super-admin', 'consultant'), blogController.updatePost)
  .delete(restrictTo('admin', 'super-admin'), blogController.deletePost);

// Like and unlike routes
router.post('/:id/like', blogController.likePost);
router.delete('/:id/like', blogController.unlikePost);

// Comment routes
router.route('/:id/comments')
  .post(blogController.addComment);

router.route('/:id/comments/:commentId')
  .patch(blogController.updateComment)
  .delete(blogController.deleteComment);

module.exports = router;
