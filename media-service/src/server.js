require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mediaRoutes = require("./routes/media-routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const { connectToRabbitMQ } = require("./utils/rabbitmq");
const { handlePostDeleted } = require("./eventHandlers/media-event-handlers");
const { consumeEvent } = require("./utils/rabbitmq");

const app = express();
const PORT = process.env.PORT || 3003;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to MongoDB"))
  .catch((e) => logger.error("MongoDB connection error", e));

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(`Requested body, ${req.body}`);

  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "media-service",
    uptime: process.uptime(),
  });
});

app.use("/api/media", mediaRoutes);

app.use(errorHandler);

async function startServer() {
  while (true) {
    try {
      await connectToRabbitMQ();

      // Consume the events / subscribe to the events
      await consumeEvent("post.deleted", handlePostDeleted);

      app.listen(PORT, () => {
        logger.info(`Media service running on port ${PORT}`);
      });

      break; // Exit the loop once connected successfully
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
