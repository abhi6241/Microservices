const logger = require("../utils/logger");
const { Search } = require("../models/Search");

// Implement caching here for 2 to 5 min
const searchPostController = async (req, res) => {
  logger.info("Search endpoint hit...");
  try {
    const { query } = req.query;

    if (!query || !String(query).trim()) {
      return res.status(400).json({
        success: false,
        message: "Query parameter is required",
      });
    }

    const results = await Search.find(
      { $text: { $search: String(query).trim() } },
      { score: { $meta: "textScore" } },
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);

    res.json(results);
  } catch (e) {
    logger.error("Error while searching post", e);
    return res.status(500).json({
      success: false,
      message: "Error while searching post",
    });
  }
};

module.exports = { searchPostController };
