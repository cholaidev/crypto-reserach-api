function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
    code: 'NOT_FOUND',
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  const payload = {
    success: false,
    message: err.message || 'Unable to fetch cryptocurrency data',
    code,
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.details = err.details || undefined;
  }

  if (statusCode === 500) {
    payload.message = 'Unable to fetch cryptocurrency data';
  }

  res.status(statusCode).json(payload);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
