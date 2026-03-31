/**
 * Standardised API error response format.
 * All errors return: { success: false, error: { code, message, details? } }
 * All successes return: { success: true, ...data }
 *
 * Usage:
 *   res.json(apiSuccess({ items: [...] }))
 *   throw new ApiError(400, 'VALIDATION_FAILED', 'Email is required')
 *   next(new ApiError(404, 'NOT_FOUND', 'Quote not found'))
 */

class ApiError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

function apiSuccess(data) {
  return { success: true, ...data };
}

function apiError(statusCode, code, message, details) {
  const response = {
    success: false,
    error: { code, message }
  };
  if (details) response.error.details = details;
  return response;
}

/**
 * Express error-handling middleware.
 * Catches thrown ApiErrors and unhandled errors, returns consistent format.
 */
function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(apiError(err.statusCode, err.code, err.message, err.details));
  }

  // Log unexpected errors
  console.error('[API Error]', req.method, req.originalUrl, err.message);

  // Don't leak internal error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;

  res.status(500).json(apiError(500, 'INTERNAL_ERROR', message));
}

module.exports = { ApiError, apiSuccess, apiError, errorHandler };
