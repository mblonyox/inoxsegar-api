const express = require('express')
const verifyToken = require('../middlewares/verify_token')

const router = express.Router()

router.use(verifyToken)

/* GET users listing. */
router.get('/user',(req, res) => {
  res.send('respond with a resource');
})

module.exports = router
