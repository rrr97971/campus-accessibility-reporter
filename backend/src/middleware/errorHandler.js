// Simple centralized error handler.
// Controllers call next(err) or throw inside an async wrapper,
// and every error ends up here with a consistent JSON shape.
function errorHandler(err, req, res, next) {
  console.error(err);

  // Multer errors (oversized file, wrong field name) arrive with a `code`
  // property rather than a statusCode — translate them to a clean 400.
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, error: 'Image must be smaller than 5MB' });
  }
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ success: false, error: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message
  });
}

// Wraps async route handlers so thrown errors reach errorHandler
// instead of crashing the process or needing try/catch everywhere.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { errorHandler, asyncHandler, ApiError };
