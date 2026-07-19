require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const Redis = require("ioredis");
const logger = require("./utils/logger");
const postRoutes = require("./routes/post-routes");
const errorHandler = require("./middleware/errorHandler");
const mongoose = require("mongoose");
const { connectToRabbitMQ } = require("./utils/rabbitmq");

const app = express();
const PORT = process.env.PORT || 3002;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongo connection error", e));

const redisClient = new Redis(process.env.REDIS_URL);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(`Requested body, ${req.body}`);

  next();
});

// Routes -> pass redisclient to routes
app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;

    next();
  },
  postRoutes,
);

app.use(errorHandler);

async function startServer() {
  while (true) {
    try {
      await connectToRabbitMQ();

      app.listen(PORT, () => {
        logger.info(`Post service running on port ${PORT}`);
      });

      break;
    } catch (e) {
      logger.error("Start server error", e);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

startServer();

// Unhandled Promise Rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
