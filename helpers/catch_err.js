module.exports = res => err => res.status(503).json({
    success: false,
    message: err.message
  })
