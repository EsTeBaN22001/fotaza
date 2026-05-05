const { sanitizeCreatePost } = require('../middlewares/validators/postValidators')

router.post('/', authRequired, sanitizeCreatePost, validateInputs('pages/createPost'), controller.create)
