exports = err => {
  return res.status(503).json({
    success: false,
    message: err.message
  })
}
