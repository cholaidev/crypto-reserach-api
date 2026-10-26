function healthCheck(req, res) {
  res.json({
    success: true,
    data: {
      status: 'ok',
      message: 'Crypto Research API is healthy',
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = {
  healthCheck,
};
