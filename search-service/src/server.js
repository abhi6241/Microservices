require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const Redis = require("ioredis");
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorHandler");
const mongoose = require("mongoose");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const searchRoutes = require("./routes/search-routes");
const {
  handlePostCreated,
  handlePostDeleted,
} = require("./eventHandlers/search-event-handlers");

const app = express();
const PORT = process.env.PORT || 3004;

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

// Homework - pass Redis client as part of your req and then implement redis caching

app.use("/api/search", searchRoutes);

app.use(errorHandler);

async function startServer() {
  while (true) {
    try {
      await connectToRabbitMQ();

      // Consume the events / subscribe to the events
      await consumeEvent("post.created", handlePostCreated);
      await consumeEvent("post.deleted", handlePostDeleted);

      app.listen(PORT, () => {
        logger.info(`Search service running on port ${PORT}`);
      });

      break; // Exit the loop once connected successfully
    } catch (e) {
      logger.error("Start server error", e);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

startServer();
