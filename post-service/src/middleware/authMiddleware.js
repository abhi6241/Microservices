const logger = require("../utils/logger");

const authenticateRequest = (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    logger.warn("Access attempted without user ID");
    return res.status(401).json({
      success: false,
      message: "Authentication required! Please login to continue",
    });
  }

  const username = req.headers["x-user-username"];
  req.user = { userId, username };

  next();
};

module.exports = { authenticateRequest };
