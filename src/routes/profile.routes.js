const express = require('express')
const router = express.Router()
const { authRequired } = require('../middlewares/authMiddleware')
const profileController = require('../controllers/profile.controller')
const postController = require('../controllers/post.controller')

// 📸 Ver mis publicaciones
router.get('/my-posts', authRequired, profileController.getMyPosts)

// ✏️ Editar: CAMBIAR .put() POR .post()
router.get('/edit/:id', authRequired, postController.showEditForm)
router.post('/edit/:id', authRequired, postController.updatePost) // ✅ POST en lugar de PUT

// 🗑️ Eliminar: CAMBIAR .delete() POR .post()
router.post('/delete/:id', authRequired, postController.deletePost) // ✅ POST en lugar de DELETE

module.exports = router
