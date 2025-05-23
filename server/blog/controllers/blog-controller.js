/**
 * Blog Controller
 * Handles HTTP requests related to blog posts
 */
const blogService = require('../services/blog-service');
const { catchAsync } = require('../../utils/catch-async');
const { AppError } = require('../../utils/app-error');

class BlogController {
  /**
   * Get all blog posts with filtering and pagination
   */
  getAllPosts = catchAsync(async (req, res, next) => {
    const filter = { ...req.query };
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
      populate: req.query.populate || 'author'
    };

    // Remove pagination and sorting options from filter
    ['page', 'limit', 'sort', 'populate'].forEach(el => delete filter[el]);

    // If not admin or not authenticated, only show published posts
    if (!req.user || (req.user && req.user.role !== 'admin' && req.user.role !== 'super-admin')) {
      filter.publishStatus = 'published';
    }

    const result = await blogService.getAllPosts(filter, options);

    res.status(200).json({
      status: 'success',
      data: result.posts,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  });

  /**
   * Get published blog posts
   */
  getPublishedPosts = catchAsync(async (req, res, next) => {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort || '-publishedAt',
      populate: req.query.populate || 'author'
    };

    const result = await blogService.getPublishedPosts(options);

    res.status(200).json({
      status: 'success',
      data: result.posts,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  });

  /**
   * Get blog posts by author
   */
  getPostsByAuthor = catchAsync(async (req, res, next) => {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort || '-publishedAt',
      populate: req.query.populate || 'author'
    };

    const result = await blogService.getPostsByAuthor(req.params.authorId, options);

    res.status(200).json({
      status: 'success',
      data: result.posts,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  });

  /**
   * Get blog posts by category
   */
  getPostsByCategory = catchAsync(async (req, res, next) => {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort || '-publishedAt',
      populate: req.query.populate || 'author'
    };

    const result = await blogService.getPostsByCategory(req.params.category, options);

    res.status(200).json({
      status: 'success',
      data: result.posts,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  });

  /**
   * Get blog posts by tag
   */
  getPostsByTag = catchAsync(async (req, res, next) => {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort || '-publishedAt',
      populate: req.query.populate || 'author'
    };

    const result = await blogService.getPostsByTag(req.params.tag, options);

    res.status(200).json({
      status: 'success',
      data: result.posts,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  });

  /**
   * Get a blog post by ID or slug
   */
  getPostByIdOrSlug = catchAsync(async (req, res, next) => {
    const post = await blogService.getPostByIdOrSlug(
      req.params.idOrSlug,
      req.query.populate || 'author,comments.user'
    );

    // If post is not published and user is not admin or author, return 404
    if (post.publishStatus !== 'published') {
      if (!req.user) {
        return next(new AppError('Blog post not found', 404));
      }

      const isAuthor = req.user.id === post.author._id.toString();
      const isAdmin = req.user.role === 'admin' || req.user.role === 'super-admin';

      if (!isAuthor && !isAdmin) {
        return next(new AppError('Blog post not found', 404));
      }
    }

    // Increment views
    if (req.query.view === 'true') {
      await blogService.incrementViews(post._id);
    }

    res.status(200).json({
      status: 'success',
      data: post
    });
  });

  /**
   * Create a new blog post
   */
  createPost = catchAsync(async (req, res, next) => {
    const {
      title,
      content,
      excerpt,
      categories,
      tags,
      featuredImage,
      publishStatus,
      seo,
      organization
    } = req.body;

    // Validate required fields
    if (!title || !content) {
      return next(new AppError('Title and content are required', 400));
    }

    // Use user's organization if not specified
    const orgId = organization || (req.user.organization ? req.user.organization : undefined);

    if (!orgId) {
      return next(new AppError('Organization is required', 400));
    }

    const post = await blogService.createPost(
      {
        title,
        content,
        excerpt,
        categories,
        tags,
        featuredImage,
        publishStatus: publishStatus || 'draft',
        seo,
        organization: orgId
      },
      req.user.id
    );

    res.status(201).json({
      status: 'success',
      data: post
    });
  });

  /**
   * Update a blog post
   */
  updatePost = catchAsync(async (req, res, next) => {
    const {
      title,
      content,
      excerpt,
      categories,
      tags,
      featuredImage,
      publishStatus,
      seo,
      isHighlighted
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (categories !== undefined) updateData.categories = categories;
    if (tags !== undefined) updateData.tags = tags;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (publishStatus !== undefined) updateData.publishStatus = publishStatus;
    if (seo !== undefined) updateData.seo = seo;
    if (isHighlighted !== undefined) updateData.isHighlighted = isHighlighted;

    const post = await blogService.updatePost(req.params.id, updateData);

    res.status(200).json({
      status: 'success',
      data: post
    });
  });

  /**
   * Delete a blog post
   */
  deletePost = catchAsync(async (req, res, next) => {
    await blogService.deletePost(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  /**
   * Like a blog post
   */
  likePost = catchAsync(async (req, res, next) => {
    const post = await blogService.likePost(req.params.id, req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        likes: post.likes.length,
        liked: true
      }
    });
  });

  /**
   * Unlike a blog post
   */
  unlikePost = catchAsync(async (req, res, next) => {
    const post = await blogService.unlikePost(req.params.id, req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        likes: post.likes.length,
        liked: false
      }
    });
  });

  /**
   * Add a comment to a blog post
   */
  addComment = catchAsync(async (req, res, next) => {
    const { content } = req.body;

    if (!content) {
      return next(new AppError('Comment content is required', 400));
    }

    const comment = await blogService.addComment(req.params.id, req.user.id, content);

    res.status(201).json({
      status: 'success',
      data: comment
    });
  });

  /**
   * Delete a comment from a blog post
   */
  deleteComment = catchAsync(async (req, res, next) => {
    await blogService.deleteComment(req.params.id, req.params.commentId, req.user.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  /**
   * Update a comment on a blog post
   */
  updateComment = catchAsync(async (req, res, next) => {
    const { content } = req.body;

    if (!content) {
      return next(new AppError('Comment content is required', 400));
    }

    const comment = await blogService.updateComment(
      req.params.id,
      req.params.commentId,
      req.user.id,
      content
    );

    res.status(200).json({
      status: 'success',
      data: comment
    });
  });

  /**
   * Get featured posts
   */
  getFeaturedPosts = catchAsync(async (req, res, next) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 3;

    const posts = await blogService.getFeaturedPosts(limit);

    res.status(200).json({
      status: 'success',
      data: posts
    });
  });

  /**
   * Get related posts
   */
  getRelatedPosts = catchAsync(async (req, res, next) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 3;

    const posts = await blogService.getRelatedPosts(req.params.id, limit);

    res.status(200).json({
      status: 'success',
      data: posts
    });
  });
}

module.exports = new BlogController();
