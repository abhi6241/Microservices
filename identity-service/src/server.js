require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./utils/logger');
const {RateLimiterRedis} = require('rate-limiter-flexible');
const Redis = require('ioredis');
const {rateLimit} = require('express-rate-limit');
const {RedisStore} = require('rate-limit-redis');
const routes = require('./routes/identity-service');
const errorHandler = require('./middleware/errorHandler');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

mongoose
    .connect (process. env. MONGODB_URI)
    .then (() => logger.info("Connected to mongodb"))
    .catch ((e) => logger.error("Mongo connection error", e));

const redisClient = new Redis(process.env.REDIS_URL);

// Global middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Recieved ${req.method} request to ${req.url}`);
    logger.info(`Requested body, ${req.body}`);

    next();
});

// DDoS protection and Rate-Limiting
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: 10,
    duration: 1
});

app.use((req, res, next) => {
    rateLimiter
        .consume(req.ip)
        .then(() => next())
        .catch(() => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({
                success: false,
                message: 'Too many requests'
            });
        });
});

// IP based Ratelimiting for sensitive endpoints
const sensitiveEndpointsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res. status (429). json({ success: false, message: "Too many requests" });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    })
});

// Apply this sensitiveEndpointslimiter to our routes
app.use('/api/auth/register', sensitiveEndpointsLimiter);

// Routes
app.use('/api/auth/', routes);

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info (`Identity service running on port ${PORT}`);
});

// Unhandled Promise Rejection
process.on('unhandledRejection', (reason, promise) => {
    logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
