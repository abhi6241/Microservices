const express = require('express');
const {createPost, getAllPost, getPost, deletePost} = require('../controllers/post-controllers');
const {authenticateRequest} = require('../middleware/authMiddleware');

const router = express();

// Middlleware -> this will tell if the user is an Auth user or not 
router.use(authenticateRequest);

router.post('/create-post', createPost);
router.get('/all-posts', getAllPost);
router.get('/:id', getPost);
router.delete('/:id', deletePost);

module.exports = router;
