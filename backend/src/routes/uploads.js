const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadImage } = require('../controllers/uploadController');

router.post('/image', verifyToken, upload.single('image'), uploadImage);

module.exports = router;