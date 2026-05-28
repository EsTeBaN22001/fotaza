const express = require('express')
const router = express.Router()
const { authRequired } = require('../middlewares/authMiddleware')
const bookmarkController = require('../controllers/bookmark.controller')

router.get('/', authRequired, bookmarkController.getUserCollections)
router.post('/', authRequired, bookmarkController.createCollection)
router.put('/:id', authRequired, bookmarkController.updateCollection)
router.delete('/:id', authRequired, bookmarkController.deleteCollection)

module.exports = router
