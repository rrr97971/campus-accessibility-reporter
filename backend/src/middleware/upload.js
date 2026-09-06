const multer = require('multer');

// Files are held in memory just long enough to stream to Cloudinary —
// never written to disk on the server, so there's nothing to clean up
// and no local storage dependency (matches the "separate cloud storage" requirement).
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;