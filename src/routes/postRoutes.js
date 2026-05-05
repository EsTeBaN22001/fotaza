const { sanitizeCreatePost } = require('../middlewares/validators/postValidators')

router.post('/posts', authRequired, sanitizeCreatePost, validateInputs('pages/createPost'), controller.create)
