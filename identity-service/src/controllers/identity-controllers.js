const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const User = require("../models/User");
const { validateRegistration, validateLogin } = require("../utils/validation");
const generateTokens = require("../utils/generateToken");
const RefreshToken = require("../models/RefreshToken");

// User Registraion
const registerUser = async (req, res) => {
  logger.info("Registration endpoint hit...");

  try {
    // Validate the Schema
    const { error } = validateRegistration(req.body);

    if (error) {
      logger.warn("Validation Error", error.details[0].message);

      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password, username } = req.body;
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("User already exists");

      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    user = new User({ username, email, password });
    await user.save();
    logger.warn("User saved successfully", user._id);

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(201).json({
      success: true,
      message: "user registered successfully",
      accessToken,
      refreshToken,
    });
  } catch (e) {
    logger.error("Registraion error occured", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// User login
const loginUser = async (req, res) => {
  logger.info("Login endpoint hit");
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn("Validation Error", error.details[0].message);

      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn("Invalid user");
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if User password is valid or not
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      logger.warn("Invalid password");
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const { accessToken, refreshToken } = await generateTokens(user);
    res.json({
      success: true,
      accessToken,
      refreshToken,
      userId: user._id,
      username: user.username,
    });
  } catch (e) {
    logger.error("Login error occured", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Refresh Token
const refreshTokenUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Refresh token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh Token missing",
      });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn("Invalid or expired refresh token");
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await User.findById(storedToken.user);

    if (!user) {
      logger.warn("User not found");
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);

    // Delete the old refresh token
    await RefreshToken.deleteOne({ _id: storedToken._id });
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (e) {
    logger.error("Refresh token error occured", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Logout
const logoutUser = async (req, res) => {
  logger.info("Logout endpoint hit...");
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Refresh token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    await RefreshToken.deleteOne({ token: refreshToken });
    logger.info("Refresh token deleted for logout");
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (e) {
    logger.error("Error while logging out", e);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Current user profile — verifies the Bearer token locally (the identity
// service owns JWT_SECRET) and returns the account for the logged-in user.
const getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user = await User.findById(payload.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      userId: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (e) {
    logger.error("Get current user error occured", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshTokenUser,
  logoutUser,
  getCurrentUser,
};
