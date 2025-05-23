/**
 * Blog Service
 * Handles business logic for blog operations
 */
const BlogPost = require('../models/blog-post-model');
const User = require('../../users/models/user-model');
const { AppError } = require('../../utils/app-error');

class BlogService {
  /**
   * Get all blog posts with pagination and filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{posts: Array, total: Number, page: Number, limit: Number}>}
   */
  async getAllPosts(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = '-publishedAt', populate = '' } = options;
    const skip = (page - 1) * limit;

    // Count total before applying pagination
    const total = await BlogPost.countDocuments(filter);

    // Get posts with pagination
    let query = BlogPost.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Apply population if specified
    if (populate) {
      query = query.populate(populate);
    }

    const posts = await query;

    return {
      posts,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get published blog posts
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{posts: Array, total: Number, page: Number, limit: Number}>}
   */
  async getPublishedPosts(options = {}) {
    const filter = { publishStatus: 'published' };
    return this.getAllPosts(filter, options);
  }

  /**
   * Get blog posts by author
   * @param {String} authorId - Author's user ID
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{posts: Array, total: Number, page: Number, limit: Number}>}
   */
  async getPostsByAuthor(authorId, options = {}) {
    const filter = { author: authorId };
    return this.getAllPosts(filter, options);
  }

  /**
   * Get blog posts by category
   * @param {String} category - Category name
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{posts: Array, total: Number, page: Number, limit: Number}>}
   */
  async getPostsByCategory(category, options = {}) {
    const filter = {
      categories: category,
      publishStatus: 'published'
    };
    return this.getAllPosts(filter, options);
  }

  /**
   * Get blog posts by tag
   * @param {String} tag - Tag name
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{posts: Array, total: Number, page: Number, limit: Number}>}
   */
  async getPostsByTag(tag, options = {}) {
    const filter = {
      tags: tag,
      publishStatus: 'published'
    };
    return this.getAllPosts(filter, options);
  }

  /**
   * Get a blog post by ID or slug
   * @param {String} idOrSlug - Blog post ID or slug
   * @param {String} populate - Fields to populate
   * @returns {Promise<BlogPost>}
   */
  async getPostByIdOrSlug(idOrSlug, populate = '') {
    // Check if idOrSlug is a valid MongoDB ID
    const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);

    let query;
    if (isObjectId) {
      query = BlogPost.findById(idOrSlug);
    } else {
      query = BlogPost.findOne({ slug: idOrSlug });
    }

    if (populate) {
      query = query.populate(populate);
    }

    const post = await query;

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    return post;
  }

  /**
   * Create a new blog post
   * @param {Object} postData - Blog post data
   * @param {String} userId - User ID of the author
   * @returns {Promise<BlogPost>}
   */
  async createPost(postData, userId) {
    // Check if author exists
    const author = await User.findById(userId);

    if (!author) {
      throw new AppError('Author not found', 404);
    }

    // Create post
    const post = await BlogPost.create({
      ...postData,
      author: userId
    });

    // Populate author details for response
    return await BlogPost.findById(post._id).populate('author', 'firstName lastName email profileImage');
  }

  /**
   * Update a blog post
   * @param {String} postId - Blog post ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<BlogPost>}
   */
  async updatePost(postId, updateData) {
    // If publishStatus is changing to 'published', set publishedAt date
    if (updateData.publishStatus === 'published') {
      const post = await BlogPost.findById(postId);

      if (post && post.publishStatus !== 'published') {
        updateData.publishedAt = Date.now();
      }
    }

    const post = await BlogPost.findByIdAndUpdate(
      postId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    // Populate author details for response
    return await BlogPost.findById(post._id).populate('author', 'firstName lastName email profileImage');
  }

  /**
   * Delete a blog post
   * @param {String} postId - Blog post ID
   * @returns {Promise<{message: String}>}
   */
  async deletePost(postId) {
    const post = await BlogPost.findByIdAndDelete(postId);

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    return { message: 'Blog post deleted successfully' };
  }

  /**
   * Like a blog post
   * @param {String} postId - Blog post ID
   * @param {String} userId - User ID
   * @returns {Promise<BlogPost>}
   */
  async likePost(postId, userId) {
    const post = await BlogPost.findById(postId);

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    // Check if user has already liked the post
    if (post.likes.includes(userId)) {
      throw new AppError('You have already liked this post', 400);
    }

    post.likes.push(userId);
    await post.save();

    return post;
  }

  /**
   * Unlike a blog post
   * @param {String} postId - Blog post ID
   * @param {String} userId - User ID
   * @returns {Promise<BlogPost>}
   */
  async unlikePost(postId, userId) {
    const post = await BlogPost.findById(postId);

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    // Check if user has liked the post
    if (!post.likes.includes(userId)) {
      throw new AppError('You have not liked this post', 400);
    }

    post.likes = post.likes.filter(id => id.toString() !== userId);
    await post.save();

    return post;
  }

  /**
   * Add a comment to a blog post
   * @param {String} postId - Blog post ID
   * @param {String} userId - User ID
   * @param {String} content - Comment content
   * @returns {Promise<Object>} - The new comment
   */
  async addComment(postId, userId, content) {
    const post = await BlogPost.findById(postId);

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    const newComment = {
      user: userId,
      content,
      createdAt: Date.now()
    };

    post.comments.push(newComment);
    await post.save();

    // Populate user details in the comment
    const populatedPost = await BlogPost.findById(postId).populate('comments.user', 'firstName lastName email profileImage');

    return populatedPost.comments[populatedPost.comments.length - 1];
  }

  /**
   * Delete a comment from a blog post
   * @param {String} postId - Blog post ID
   * @param {String} commentId - Comment ID
   * @param {String} userId - User ID (for authorization)
   * @returns {Promise<{message: String}>}
   */
  async deleteComment(postId, commentId, userId) {
    const post = await BlogPost.findById(postId);

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    // Find the comment
    const comment = post.comments.id(commentId);

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Check if the user is the comment author or post author or admin
    if (comment.user.toString() !== userId && post.author.toString() !== userId) {
      throw new AppError('You are not authorized to delete this comment', 403);
    }

    comment.remove();
    await post.save();

    return { message: 'Comment deleted successfully' };
  }

  /**
   * Update a comment on a blog post
   * @param {String} postId - Blog post ID
   * @param {String} commentId - Comment ID
   * @param {String} userId - User ID (for authorization)
   * @param {String} content - Updated comment content
   * @returns {Promise<Object>} - The updated comment
   */
  async updateComment(postId, commentId, userId, content) {
    const post = await BlogPost.findById(postId);

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    // Find the comment
    const comment = post.comments.id(commentId);

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Check if the user is the comment author
    if (comment.user.toString() !== userId) {
      throw new AppError('You are not authorized to update this comment', 403);
    }

    comment.content = content;
    await post.save();

    // Populate user details in the comment
    const populatedPost = await BlogPost.findById(postId).populate('comments.user', 'firstName lastName email profileImage');
    const updatedComment = populatedPost.comments.id(commentId);

    return updatedComment;
  }

  /**
   * Get featured posts
   * @param {Number} limit - Number of posts to return
   * @returns {Promise<Array>}
   */
  async getFeaturedPosts(limit = 3) {
    const posts = await BlogPost.find({
      publishStatus: 'published',
      isHighlighted: true
    })
    .sort('-publishedAt')
    .limit(limit)
    .populate('author', 'firstName lastName profileImage');

    return posts;
  }

  /**
   * Get related posts
   * @param {String} postId - Post ID to find related posts for
   * @param {Number} limit - Number of related posts to return
   * @returns {Promise<Array>}
   */
  async getRelatedPosts(postId, limit = 3) {
    const post = await this.getPostByIdOrSlug(postId);

    // Find posts with similar categories or tags
    const relatedPosts = await BlogPost.find({
      _id: { $ne: postId },
      publishStatus: 'published',
      $or: [
        { categories: { $in: post.categories } },
        { tags: { $in: post.tags } }
      ]
    })
    .sort('-publishedAt')
    .limit(limit)
    .populate('author', 'firstName lastName profileImage');

    return relatedPosts;
  }

  /**
   * Increment post views
   * @param {String} postId - Post ID
   * @returns {Promise<{views: Number}>}
   */
  async incrementViews(postId) {
    const post = await BlogPost.findByIdAndUpdate(
      postId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    return { views: post.views };
  }
}

module.exports = new BlogService();
