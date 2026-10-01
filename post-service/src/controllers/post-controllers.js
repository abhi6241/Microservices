const Post = require("../models/Post");
const logger = require("../utils/logger");
const { validateCreatePost } = require("../utils//validation");
const { publishEvent } = require("../utils/rabbitmq");

async function invalidatePostCache(req, input) {
  const cachedKey = `post:${input}`;
  await req.redisClient.del(cachedKey);

  // Cache keys for the paginated feed are written as `posts:<page>:<limit>`,
  // so the invalidation pattern must match that exact (lowercase) prefix.
  const keys = await req.redisClient.keys("posts:*");

  if (keys.length > 0) {
    await req.redisClient.del(keys);
  }
}

const createPost = async (req, res) => {
  logger.info("Create post endpoint hit...");
  try {
    // Validate the Schema
    const { error } = validateCreatePost(req.body);

    if (error) {
      logger.warn("Validation Error", error.details[0].message);

      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { content, mediaIds } = req.body;
    const newlyCreatedPost = new Post({
      user: req.user.userId,
      // Denormalize the author's username at write time so the feed can render
      // author names without a cross-service join.
      authorUsername: req.user.username || "unknown",
      content,
      mediaIds: mediaIds || [],
    });

    await newlyCreatedPost.save();

    await publishEvent("post.created", {
      postId: newlyCreatedPost._id.toString(),
      userId: newlyCreatedPost.user.toString(),
      authorUsername: newlyCreatedPost.authorUsername,
      content: newlyCreatedPost.content,
      createdAt: newlyCreatedPost.createdAt,
    });

    await invalidatePostCache(req, newlyCreatedPost._id.toString());
    logger.info("Post created successfully", newlyCreatedPost);
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newlyCreatedPost,
    });
  } catch (e) {
    logger.error("Error creating posts", e);
    res.status(500).json({
      success: false,
      message: "Error creating posts",
    });
  }
};

const getAllPost = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `posts:${page}:${limit}`;
    const cachedPost = await req.redisClient.get(cacheKey);

    if (cachedPost) {
      return res.json(JSON.parse(cachedPost));
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalNoPosts = await Post.countDocuments();

    const result = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalNoPosts / limit),
      totalNoPosts: totalNoPosts,
    };

    // Save your posts in Redis Cache
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));
    res.json(result);
  } catch (e) {
    logger.error("Error fetching posts", e);
    res.status(500).json({
      success: false,
      message: "Error fetching posts",
    });
  }
};

const getPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const cacheKey = `post:${postId}`;
    const cachedPost = await req.redisClient.get(cacheKey);

    if (cachedPost) {
      return res.json(JSON.parse(cachedPost));
    }

    const singlePostDetailsById = await Post.findById(postId);

    if (!singlePostDetailsById) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    await req.redisClient.setex(
      cacheKey,
      300,
      JSON.stringify(singlePostDetailsById),
    );

    res.json(singlePostDetailsById);
  } catch (e) {
    logger.error("Error fetching post", e);
    res.status(500).json({
      success: false,
      message: "Error fetching post by ID",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Publish post delete method
    await publishEvent("post.deleted", {
      postId: post._id.toString(),
      userId: req.user.userId,
      mediaIds: post.mediaIds,
    });

    await invalidatePostCache(req, req.params.id);
    res.json({
      message: "Post deleted successfully",
    });
  } catch (e) {
    logger.error("Error deleting post", e);
    res.status(500).json({
      success: false,
      message: "Error deleting post",
    });
  }
};

module.exports = { createPost, getAllPost, getPost, deletePost };
