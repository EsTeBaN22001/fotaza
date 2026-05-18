const express = require('express')
const router = express.Router()

const controller = require('../controllers/search.controller')

router.get('/', controller.getSearch)
router.get('/explore', controller.getExplore)
router.get('/autocomplete', controller.getAutocomplete)

module.exports = router
