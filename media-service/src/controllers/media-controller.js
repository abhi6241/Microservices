const logger = require('../utils/logger');
const {uploadMediaToCloudinary} = require('../utils/cloudinary');
const Media = require('../models/Media');

const uploadMedia = async (req, res) => {
    logger.info('Starting media upload');
    try {
        if(!req.file) {
            logger.error('No file found. Please add a file and try again');
            return res.status(500).json({
                success: false,
                message: 'No file found. Please add a file and try again'
            });
        }

        const {originalname, mimetype, buffer} = req.file;
        const userId = req.user.userId;

        logger.info(`File details: name=${originalname}, type=${mimetype}`);
        logger.info(`Uploading to Cloudinary starting...`); 

        const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
        logger.info(`Cloudinary upload successfully. Public ID: - ${cloudinaryUploadResult.public_id}`);

        const newlyCreatedMedia = new Media({
            publicId: cloudinaryUploadResult.public_id,
            originalName: originalname,
            mimeType: mimetype,
            url: cloudinaryUploadResult.secure_url,
            userId
        });

        await newlyCreatedMedia.save();

        res.status(201).json({
            success: true,
            mediaId: newlyCreatedMedia,
            url: newlyCreatedMedia.url,
            message: 'Media upload is successful'
        });
    } catch(e) {
        logger.error('Error creating media', e);
        res.status(500).json({
            success: false,
            message: 'Error creating media'
        });
    }
};

const getAllMedias = async (req, res) => {
    try {
        const results = await Media.find({});
        return res.json({results});
    } catch(e) {
        logger.error('Error fetching medias', e);
        res.status(500).json({
            success: false,
            message: 'Error fetching medias'
        });
    }
};

module.exports = {uploadMedia, getAllMedias};
