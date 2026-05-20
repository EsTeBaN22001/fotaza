const { Post, PostImage, User, Tag, Like, Bookmark, Follow, Rating, Comment } = require('../models')
const { Op, literal } = require('sequelize')
const sanitizeHtml = require('sanitize-html')

exports.getSearch = async (req, res) => {
  try {
    let q = req.query.q ? req.query.q.trim() : ''
    q = sanitizeHtml(q, { allowedTags: [], allowedAttributes: {} })

    const activeTab = req.query.tab === 'users' ? 'users' : 'posts'

    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 9))
    const offset = (page - 1) * limit

    if (activeTab === 'users') {
      const whereUser = { active: true }
      if (q) {
        whereUser[Op.or] = [
          { username: { [Op.like]: `%${q}%` } }
        ]
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereUser,
        attributes: ['id', 'username', 'email', 'role', 'active', 'created_at'],
        limit,
        offset,
        order: [['username', 'ASC']]
      })

      const usersData = await Promise.all(users.map(async u => {
        const followerCount = await u.countFollowers()
        const followingCount = await u.countFollowing()
        let isFollowing = false
        if (req.user) {
          const follow = await Follow.findOne({
            where: { follower_id: req.user.id, following_id: u.id }
          })
          isFollowing = !!follow
        }
        return {
          id: u.id,
          username: u.username,
          role: u.role,
          created_at: u.created_at,
          followerCount,
          followingCount,
          isFollowing,
          isSelf: req.user ? req.user.id === u.id : false
        }
      }))

      const totalPages = Math.ceil(count / limit)

      return res.render('pages/search/index', {
        title: 'Buscar Usuarios',
        activeTab,
        q,
        users: usersData,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {}
      })
    } else {
      const wherePost = { status: 'approved' }

      if (req.query.author) {
        const authorUsername = sanitizeHtml(req.query.author.trim(), { allowedTags: [], allowedAttributes: {} })
        if (authorUsername) {
          wherePost['$User.username$'] = authorUsername
        }
      }

      if (req.query.date_from || req.query.date_to) {
        const dateFilter = {}
        if (req.query.date_from) {
          const dateFrom = new Date(req.query.date_from)
          if (!isNaN(dateFrom.getTime())) {
            dateFilter[Op.gte] = dateFrom
          }
        }
        if (req.query.date_to) {
          const dateTo = new Date(req.query.date_to)
          dateTo.setHours(23, 59, 59, 999)
          if (!isNaN(dateTo.getTime())) {
            dateFilter[Op.lte] = dateTo
          }
        }
        wherePost.created_at = dateFilter
      }

      if (req.query.comments) {
        if (req.query.comments === 'enabled') {
          wherePost.commentsEnabled = true
        } else if (req.query.comments === 'disabled') {
          wherePost.commentsEnabled = false
        }
      }

      if (req.query.license) {
        if (['copyright', 'free'].includes(req.query.license)) {
          wherePost['$images.license$'] = req.query.license
        }
      }

      if (q) {
        const matchPattern = `%${q}%`
        wherePost[Op.or] = [
          { title: { [Op.like]: matchPattern } },
          { description: { [Op.like]: matchPattern } },
          { '$User.username$': { [Op.like]: matchPattern } },
          { '$Tags.name$': { [Op.like]: matchPattern } }
        ]
      }

      let selectedTags = []
      if (req.query.tags) {
        if (Array.isArray(req.query.tags)) {
          selectedTags = req.query.tags.map(t => sanitizeHtml(t.trim().toLowerCase(), { allowedTags: [], allowedAttributes: {} }))
        } else {
          selectedTags = req.query.tags.split(',').map(t => sanitizeHtml(t.trim().toLowerCase(), { allowedTags: [], allowedAttributes: {} })).filter(Boolean)
        }
        if (selectedTags.length > 0) {
          wherePost['$Tags.name$'] = { [Op.in]: selectedTags }
        }
      }

      let order = [['created_at', 'DESC']]
      const orderBy = req.query.order_by || 'recent'

      if (orderBy === 'old') {
        order = [['created_at', 'ASC']]
      } else if (orderBy === 'top_rated') {
        const ratingSubquery = `(
          SELECT COALESCE(AVG(r.value), 0)
          FROM ratings r
          WHERE r.PostId = Post.id
        )`
        order = [[literal(ratingSubquery), 'DESC']]
      } else if (orderBy === 'most_commented') {
        const commentSubquery = `(
          SELECT COUNT(*)
          FROM comments c
          WHERE c.PostId = Post.id
        )`
        order = [[literal(commentSubquery), 'DESC']]
      } else if (orderBy === 'most_liked') {
        const likeSubquery = `(
          SELECT COUNT(*)
          FROM likes l
          WHERE l.PostId = Post.id
        )`
        order = [[literal(likeSubquery), 'DESC']]
      } else if (orderBy === 'most_saved') {
        const bookmarkSubquery = `(
          SELECT COUNT(*)
          FROM bookmarks b
          WHERE b.PostId = Post.id
        )`
        order = [[literal(bookmarkSubquery), 'DESC']]
      } else if (orderBy === 'trending') {
        const trendingSubquery = `(
          COALESCE((SELECT COUNT(*) FROM likes l WHERE l.PostId = Post.id), 0) * 3 +
          COALESCE((SELECT COUNT(*) FROM comments c WHERE c.PostId = Post.id), 0) * 2 +
          COALESCE((SELECT COUNT(*) FROM bookmarks b WHERE b.PostId = Post.id), 0) * 1
        )`
        order = [[literal(trendingSubquery), 'DESC']]
      } else if (orderBy === 'relevance' && q) {
        const relevanceSubquery = `(
          CASE 
            WHEN Post.title = ${Post.sequelize.escape(q)} THEN 100
            WHEN Post.title LIKE ${Post.sequelize.escape('%' + q + '%')} THEN 50
            WHEN Post.description LIKE ${Post.sequelize.escape('%' + q + '%')} THEN 10
            ELSE 1
          END
        )`
        order = [[literal(relevanceSubquery), 'DESC']]
      }

      const includeModels = [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'username', 'active']
        },
        {
          model: PostImage,
          as: 'images',
          attributes: ['id', 'url', 'license', 'watermark']
        },
        {
          model: Tag,
          through: { attributes: [] },
          attributes: ['id', 'name']
        },
        {
          model: Like,
          attributes: ['UserId']
        },
        {
          model: Bookmark,
          attributes: ['UserId']
        }
      ]

      const allMatchingPosts = await Post.findAll({
        attributes: ['id'],
        where: wherePost,
        include: includeModels,
        order,
        distinct: true,
        subQuery: false
      })

      const allIds = allMatchingPosts.map(p => p.id)
      const count = allIds.length
      const paginatedIds = allIds.slice(offset, offset + limit)

      let posts = []
      if (paginatedIds.length > 0) {
        posts = await Post.findAll({
          where: { id: { [Op.in]: paginatedIds } },
          include: includeModels,
          order
        })
      }

      const allTags = await Tag.findAll({
        order: [['name', 'ASC']]
      })

      const totalPages = Math.ceil(count / limit)

      return res.render('pages/search/index', {
        title: 'Buscar Publicaciones',
        activeTab,
        q,
        posts,
        allTags,
        selectedTags,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          author: req.query.author || '',
          date_from: req.query.date_from || '',
          date_to: req.query.date_to || '',
          comments: req.query.comments || '',
          license: req.query.license || '',
          order_by: orderBy
        }
      })
    }
  } catch (err) {
    console.error('❌ Error en getSearch:', err)
    res.status(500).render('pages/error', {
      message: 'Error al realizar la búsqueda',
      errors: [{ message: err.message }]
    })
  }
}

exports.getExplore = async (req, res) => {
  try {
    const ratingSubquery = `(
      SELECT COALESCE(AVG(r.value), 0)
      FROM ratings r
      WHERE r.PostId = Post.id
    )`

    const popularPosts = await Post.findAll({
      where: { status: 'approved' },
      include: [
        { model: User, as: 'User', attributes: ['id', 'username'] },
        { model: PostImage, as: 'images', attributes: ['id', 'url', 'license'] },
        { model: Tag, through: { attributes: [] } },
        { model: Like },
        { model: Bookmark }
      ],
      order: [[literal(ratingSubquery), 'DESC']],
      limit: 6
    })

    const trendingTags = await Tag.findAll({
      attributes: [
        'id',
        'name',
        [literal('(SELECT COUNT(*) FROM post_tags pt INNER JOIN posts p ON pt.PostId = p.id WHERE pt.TagId = Tag.id AND p.status = "approved")'), 'postCount']
      ],
      order: [[literal('postCount'), 'DESC']],
      limit: 10
    })

    const featuredCreators = await User.findAll({
      where: { active: true },
      attributes: [
        'id',
        'username',
        [literal('(SELECT COUNT(*) FROM follows f WHERE f.following_id = User.id)'), 'followerCount']
      ],
      order: [[literal('followerCount'), 'DESC']],
      limit: 5
    })

    const featuredCreatorsData = await Promise.all(featuredCreators.map(async u => {
      let isFollowing = false
      if (req.user) {
        const follow = await Follow.findOne({
          where: { follower_id: req.user.id, following_id: u.id }
        })
        isFollowing = !!follow
      }
      return {
        id: u.id,
        username: u.username,
        followerCount: u.getDataValue('followerCount'),
        isFollowing,
        isSelf: req.user ? req.user.id === u.id : false
      }
    }))

    let followedPosts = []
    if (req.user) {
      const following = await req.user.getFollowing()
      const followingIds = following.map(u => u.id)
      if (followingIds.length > 0) {
        followedPosts = await Post.findAll({
          where: {
            UserId: { [Op.in]: followingIds },
            status: 'approved'
          },
          include: [
            { model: User, as: 'User', attributes: ['id', 'username'] },
            { model: PostImage, as: 'images', attributes: ['id', 'url'] },
            { model: Tag, through: { attributes: [] } },
            { model: Like },
            { model: Bookmark }
          ],
          order: [['created_at', 'DESC']],
          limit: 6
        })
      }
    }

    const recentPosts = await Post.findAll({
      where: { status: 'approved' },
      include: [
        { model: User, as: 'User', attributes: ['id', 'username'] },
        { model: PostImage, as: 'images', attributes: ['id', 'url', 'license'] },
        { model: Tag, through: { attributes: [] } },
        { model: Like },
        { model: Bookmark }
      ],
      order: [['created_at', 'DESC']],
      limit: 12
    })

    res.render('pages/search/explore', {
      title: 'Explorar Contenido',
      popularPosts,
      trendingTags,
      featuredCreators: featuredCreatorsData,
      followedPosts,
      recentPosts
    })
  } catch (err) {
    console.error('❌ Error en getExplore:', err)
    res.status(500).render('pages/error', {
      message: 'Error al cargar la exploración de contenido',
      errors: [{ message: err.message }]
    })
  }
}

exports.getAutocomplete = async (req, res) => {
  try {
    const q = req.query.q ? req.query.q.trim() : ''
    if (!q || q.length < 2) {
      return res.json({ tags: [], users: [], posts: [] })
    }

    const cleanQ = sanitizeHtml(q, { allowedTags: [], allowedAttributes: {} })
    const matchPattern = `%${cleanQ}%`

    const tags = await Tag.findAll({
      where: { name: { [Op.like]: matchPattern } },
      attributes: ['id', 'name'],
      limit: 5
    })

    const users = await User.findAll({
      where: {
        active: true,
        username: { [Op.like]: matchPattern }
      },
      attributes: ['id', 'username'],
      limit: 5
    })

    const posts = await Post.findAll({
      where: {
        status: 'approved',
        title: { [Op.like]: matchPattern }
      },
      attributes: ['id', 'title'],
      limit: 5
    })

    return res.json({
      tags: tags.map(t => t.name),
      users: users.map(u => u.username),
      posts: posts.map(p => ({ id: p.id, title: p.title }))
    })
  } catch (err) {
    console.error('❌ Error en getAutocomplete:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
