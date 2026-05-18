const express = require('express')
const router = express.Router()
const reportController = require('../controllers/report.controller')
const { authRequired } = require('../middlewares/authMiddleware')

router.post('/', authRequired, reportController.createReport)

module.exports = router
