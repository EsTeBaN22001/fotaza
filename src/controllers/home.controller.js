const { Post, PostImage, User, Tag, Like, Bookmark, Rating } = require('../models')
const { Op, literal, fn, col } = require('sequelize')

/**
 * Algoritmo de home con balance 70/30:
 * - 70% (14 posts): Los más valorados (promedio >= 3.5 estrellas Y >= 3 votos),
 *   ordenados por score combinado: (promedio * 0.6) + (log(votos+1) * 0.4 * factor_normalizacion)
 * - 30% (6 posts): Publicaciones recientes que NO están en el grupo anterior (para dar
 *   visibilidad a contenido nuevo y mantener balance)
 * Total: 20 posts en la home
 */
exports.getHome = async (req, res) => {
  try {
    const commonIncludes = [
      { model: PostImage, as: 'images' },
      { model: User, as: 'User' },
      { model: Tag, through: { attributes: [] } },
      { model: Like },
      { model: Bookmark },
      { model: Rating, as: 'Ratings' }
    ]

    // ---- Grupo A: Posts bien valorados (70%) ----
    // Score = promedio * 0.6 + log(cantidad_votos + 1) * 2 (factor_normalizacion ~2 para equilibrar)
    const topRatedScoreExpr = literal(`(
      (SELECT COALESCE(AVG(r.value), 0) FROM ratings r WHERE r.PostId = Post.id) * 0.6
      + LOG(1 + (SELECT COUNT(*) FROM ratings r WHERE r.PostId = Post.id)) * 2.0
    )`)

    const topRatedPosts = await Post.findAll({
      where: {
        status: 'approved',
        // Al menos 3 valoraciones con promedio >= 3.5
        [Op.and]: [
          literal(`(SELECT COUNT(*) FROM ratings r WHERE r.PostId = Post.id) >= 3`),
          literal(`(SELECT COALESCE(AVG(r.value), 0) FROM ratings r WHERE r.PostId = Post.id) >= 3.5`)
        ]
      },
      include: commonIncludes,
      order: [[topRatedScoreExpr, 'DESC']],
      limit: 14
    })

    const topRatedIds = topRatedPosts.map(p => p.id)

    // ---- Grupo B: Recientes que NO están en el grupo A (30%) ----
    const recentPosts = await Post.findAll({
      where: {
        status: 'approved',
        ...(topRatedIds.length > 0 ? { id: { [Op.notIn]: topRatedIds } } : {})
      },
      include: commonIncludes,
      order: [['created_at', 'DESC']],
      limit: 6
    })

    // ---- Mezcla intercalada: 2-3 top rated, 1 reciente, repetir ----
    // Para dar sensación de balance y variedad visual
    const posts = interleavePosts(topRatedPosts, recentPosts)

    res.render('pages/home', { posts })
  } catch (err) {
    console.error('❌ Error cargando home:', err)
    res.status(500).render('pages/error', { message: 'Error cargando el feed', errors: [] })
  }
}

/**
 * Intercala posts de dos grupos: por cada 2-3 del grupo A, inserta 1 del grupo B.
 * Si no hay suficientes del grupo B, se completa con los del grupo A.
 */
function interleavePosts(groupA, groupB) {
  const result = []
  let iA = 0
  let iB = 0
  let cycle = 0 // 0,1 = groupA; 2 = groupB; se repite

  while (iA < groupA.length || iB < groupB.length) {
    if (cycle < 2 && iA < groupA.length) {
      result.push(groupA[iA++])
    } else if (cycle === 2 && iB < groupB.length) {
      result.push(groupB[iB++])
    } else if (iA < groupA.length) {
      result.push(groupA[iA++])
    } else if (iB < groupB.length) {
      result.push(groupB[iB++])
    }
    cycle = (cycle + 1) % 3
  }

  return result
}
