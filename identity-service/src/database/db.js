require('dotenv').config();
const mongoose = require("mongoose");
const logger = require('../utils/logger');
const {log} = require('winston');

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => logger.info('Connected to MongoDB successfully'))
    .catch((e) => logger.error('MongoDB connection error', e));

module.exports = mongoose;