const express = require('express')
const router = express.Router()
const moderatorController = require('../controllers/moderator.controller')
const { validatorRequired } = require('../middlewares/authMiddleware')

router.use(validatorRequired)

router.get('/reports', moderatorController.getDashboard)
router.get('/reports/:targetType/:targetId', moderatorController.getReportDetail)
router.post('/reports/:id/resolve', moderatorController.resolveReport)
router.post('/reports/:id/dismiss', moderatorController.dismissReport)
router.post('/reports/:id/delete', moderatorController.deleteReport)

module.exports = router
