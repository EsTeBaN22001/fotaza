const { Post, PostImage, User, Tag, Like, Bookmark, Collection } = require('../models')
const notificationService = require('../services/notificationService')

exports.toggleBookmark = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.user.id
    const collectionId = req.body.collectionId || null

    const post = await Post.findByPk(postId)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Publicación no encontrada' })
    }

    const existing = await Bookmark.findOne({
      where: { PostId: postId, UserId: userId }
    })

    let saved = false
    if (existing) {
      await existing.destroy()
      saved = false
    } else {
      await Bookmark.create({
        PostId: postId,
        UserId: userId,
        CollectionId: collectionId
      })
      saved = true

      await notificationService.createNotification({
        receiverId: post.UserId,
        actorId: userId,
        type: 'PUBLICATION_INTERESTED',
        relatedId: postId
      })
    }

    const saveCount = await Bookmark.count({ where: { PostId: postId } })

    return res.json({
      success: true,
      saved,
      saveCount
    })
  } catch (err) {
    console.error('❌ Error en toggleBookmark:', err)
    return res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

exports.updateBookmarkCollection = async (req, res) => {
  try {
    const { postId } = req.params
    const userId = req.user.id
    const { collectionId } = req.body

    const bookmark = await Bookmark.findOne({
      where: { PostId: postId, UserId: userId }
    })

    if (!bookmark) {
      return res.status(404).json({ success: false, message: 'Bookmark no encontrado' })
    }

    // Verificar que la colección pertenece al usuario (si se envía)
    if (collectionId) {
      const collection = await Collection.findOne({
        where: { id: collectionId, UserId: userId }
      })
      if (!collection) {
        return res.status(403).json({ success: false, message: 'Colección no encontrada' })
      }
    }

    bookmark.CollectionId = collectionId || null
    await bookmark.save()

    return res.json({ success: true, collectionId: bookmark.CollectionId })
  } catch (err) {
    console.error('❌ Error en updateBookmarkCollection:', err)
    return res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

exports.getSaved = async (req, res) => {
  try {
    const userId = req.user.id
    const collectionFilter = req.query.collection || null

    // Obtener colecciones del usuario
    const collections = await Collection.findAll({
      where: { UserId: userId },
      order: [['created_at', 'DESC']],
      include: [{
        model: Bookmark,
        as: 'bookmarks',
        attributes: ['PostId']
      }]
    })

    // Construir where para bookmarks
    const bookmarkWhere = { UserId: userId }
    if (collectionFilter === 'uncategorized') {
      bookmarkWhere.CollectionId = null
    } else if (collectionFilter) {
      bookmarkWhere.CollectionId = collectionFilter
    }

    const bookmarks = await Bookmark.findAll({
      where: bookmarkWhere,
      include: [
        {
          model: Post,
          include: [
            { model: PostImage, as: 'images' },
            { model: User, as: 'User', attributes: ['id', 'username'] },
            { model: Tag, through: { attributes: [] } },
            { model: Like },
            { model: Bookmark }
          ]
        },
        {
          model: Collection,
          as: 'Collection',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    })

    const posts = bookmarks.map(b => ({
      ...b.Post?.toJSON(),
      bookmarkCollectionId: b.CollectionId,
      bookmarkCollectionName: b.Collection?.name || null
    })).filter(p => p.id)

    res.render('pages/profile/saved', {
      posts,
      collections,
      activeCollection: collectionFilter
    })
  } catch (err) {
    console.error('❌ Error cargando guardados:', err)
    res.status(500).render('pages/error', {
      message: 'Error al cargar tus publicaciones guardadas',
      errors: [],
      status: 500
    })
  }
}

// =============================================
// CRUD de Colecciones (API JSON)
// =============================================

exports.getUserCollections = async (req, res) => {
  try {
    const collections = await Collection.findAll({
      where: { UserId: req.user.id },
      order: [['created_at', 'DESC']],
      include: [{
        model: Bookmark,
        as: 'bookmarks',
        attributes: ['PostId']
      }]
    })

    return res.json({
      success: true,
      collections: collections.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        postCount: c.bookmarks ? c.bookmarks.length : 0
      }))
    })
  } catch (err) {
    console.error('❌ Error en getUserCollections:', err)
    return res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

exports.createCollection = async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' })
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ success: false, message: 'El nombre no puede superar los 100 caracteres' })
    }

    // Verificar que no exista una colección con el mismo nombre
    const existing = await Collection.findOne({
      where: { UserId: req.user.id, name: name.trim() }
    })

    if (existing) {
      return res.status(409).json({ success: false, message: 'Ya tenés una colección con ese nombre' })
    }

    const collection = await Collection.create({
      name: name.trim(),
      description: description?.trim() || null,
      UserId: req.user.id
    })

    return res.status(201).json({
      success: true,
      collection: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        postCount: 0
      }
    })
  } catch (err) {
    console.error('❌ Error en createCollection:', err)
    return res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

exports.updateCollection = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description } = req.body

    const collection = await Collection.findOne({
      where: { id, UserId: req.user.id }
    })

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Colección no encontrada' })
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' })
    }

    // Verificar nombre duplicado (excluyendo la actual)
    const duplicate = await Collection.findOne({
      where: {
        UserId: req.user.id,
        name: name.trim(),
        id: { [require('sequelize').Op.ne]: id }
      }
    })

    if (duplicate) {
      return res.status(409).json({ success: false, message: 'Ya tenés otra colección con ese nombre' })
    }

    collection.name = name.trim()
    collection.description = description?.trim() || null
    await collection.save()

    return res.json({
      success: true,
      collection: {
        id: collection.id,
        name: collection.name,
        description: collection.description
      }
    })
  } catch (err) {
    console.error('❌ Error en updateCollection:', err)
    return res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

exports.deleteCollection = async (req, res) => {
  try {
    const { id } = req.params

    const collection = await Collection.findOne({
      where: { id, UserId: req.user.id }
    })

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Colección no encontrada' })
    }

    // Desasociar bookmarks (pasan a sin colección)
    await Bookmark.update(
      { CollectionId: null },
      { where: { CollectionId: id, UserId: req.user.id } }
    )

    await collection.destroy()

    return res.json({ success: true, message: 'Colección eliminada' })
  } catch (err) {
    console.error('❌ Error en deleteCollection:', err)
    return res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}
