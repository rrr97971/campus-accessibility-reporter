const cloudinary = require('../config/cloudinary');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

// POST /api/uploads/image  (auth required)
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No image file provided');
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'campus-accessibility-reports',
        resource_type: 'image'
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(req.file.buffer);
  });

  res.status(201).json({ success: true, image_url: result.secure_url });
});

module.exports = { uploadImage };