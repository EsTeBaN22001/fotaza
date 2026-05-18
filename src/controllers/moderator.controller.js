const { Report, Post, PostImage, Comment, User } = require('../models')
const notificationService = require('../services/notificationService')
const { Op } = require('sequelize')
const sequelize = require('../config/db')

exports.getDashboard = async (req, res) => {
  try {
    const statusFilter = req.query.status || 'pending'

    const reports = await Report.findAll({
      where: { status: statusFilter },
      include: [
        { model: User, as: 'Reporter', attributes: ['id', 'username'] }
      ],
      order: [['created_at', 'DESC']]
    })

    res.render('moderator/dashboard', {
      title: 'Panel de Moderación',
      reports,
      statusFilter
    })
  } catch (error) {
    console.error('Error in getDashboard:', error)
    res.status(500).render('pages/error', { message: 'Error cargando el panel de moderador' })
  }
}

exports.getReportDetail = async (req, res) => {
  try {
    const { targetType, targetId } = req.params

    const reports = await Report.findAll({
      where: { targetType, targetId },
      include: [
        { model: User, as: 'Reporter', attributes: ['id', 'username'] },
        { model: User, as: 'Resolver', attributes: ['id', 'username'] }
      ]
    })

    if (!reports.length) {
      return res.redirect('/moderator/reports')
    }

    let targetData = null
    let targetOwner = null

    if (targetType === 'post') {
      targetData = await Post.findByPk(targetId, {
        include: [{ model: User, as: 'User' }, { model: PostImage, as: 'images' }]
      })
      if (targetData) targetOwner = targetData.User
    } else if (targetType === 'postImage') {
      targetData = await PostImage.findByPk(targetId, {
        include: [{ model: Post, include: [{ model: User, as: 'User' }] }]
      })
      if (targetData && targetData.Post) targetOwner = targetData.Post.User
    } else if (targetType === 'comment') {
      targetData = await Comment.findByPk(targetId, {
        include: [{ model: User }]
      })
      if (targetData) targetOwner = targetData.User
    }

    res.render('moderator/report-detail', {
      title: 'Detalle de Denuncia',
      reports,
      targetType,
      targetId,
      targetData,
      targetOwner
    })

  } catch (error) {
    console.error('Error in getReportDetail:', error)
    res.status(500).render('pages/error', { message: 'Error cargando detalle' })
  }
}

exports.resolveReport = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const reportId = req.params.id
    const resolverId = req.user.id
    const { resolutionNotes } = req.body

    const report = await Report.findByPk(reportId)
    if (!report) return res.status(404).json({ error: 'Reporte no encontrado' })

    await Report.update(
      { status: 'resolved', resolverId, resolutionNotes },
      { where: { targetType: report.targetType, targetId: report.targetId, status: 'pending' }, transaction }
    )

    let targetOwnerId = null

    if (report.targetType === 'post' || report.targetType === 'postImage') {
      let postId = report.targetId
      if (report.targetType === 'postImage') {
        const img = await PostImage.findByPk(report.targetId)
        if (img) postId = img.PostId
      }

      const post = await Post.findByPk(postId, { transaction })
      if (post) {
        post.status = 'removed'
        await post.save({ transaction })
        targetOwnerId = post.UserId

        await notificationService.createNotification({
          receiverId: targetOwnerId,
          type: 'PUBLICATION_REMOVED',
          message: 'Una de tus publicaciones ha sido eliminada por incumplir las normas.',
          relatedId: postId
        })
      }
    } else if (report.targetType === 'comment') {
      const comment = await Comment.findByPk(report.targetId, { transaction })
      if (comment) {
        targetOwnerId = comment.UserId
        await comment.destroy({ transaction })

        await notificationService.createNotification({
          receiverId: targetOwnerId,
          type: 'COMMENT_REMOVED',
          message: 'Un comentario tuyo fue eliminado por un moderador.',
          relatedId: report.targetId
        })
      }
    }

    if (targetOwnerId) {
      const removedPostsCount = await Post.count({
        where: { UserId: targetOwnerId, status: 'removed' },
        transaction
      })

      if (removedPostsCount >= 3) {
        const user = await User.findByPk(targetOwnerId, { transaction })
        if (user && user.active) {
          user.active = false
          await user.save({ transaction })

          await notificationService.createNotification({
            receiverId: targetOwnerId,
            type: 'ACCOUNT_SUSPENDED',
            message: 'Tu cuenta ha sido suspendida por acumular múltiples faltas a las normas.'
          })
        }
      }
    }

    await transaction.commit()
    res.redirect('/moderator/reports')

  } catch (error) {
    await transaction.rollback()
    console.error('Error in resolveReport:', error)
    res.status(500).json({ error: 'Error al resolver' })
  }
}

exports.dismissReport = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const reportId = req.params.id
    const resolverId = req.user.id
    const { resolutionNotes } = req.body

    const report = await Report.findByPk(reportId)
    if (!report) return res.status(404).json({ error: 'Reporte no encontrado' })

    await Report.update(
      { status: 'dismissed', resolverId, resolutionNotes },
      { where: { targetType: report.targetType, targetId: report.targetId, status: 'pending' }, transaction }
    )

    if (report.targetType === 'post' || report.targetType === 'postImage') {
      let postId = report.targetId
      if (report.targetType === 'postImage') {
        const img = await PostImage.findByPk(report.targetId)
        if (img) postId = img.PostId
      }

      const post = await Post.findByPk(postId, { transaction })
      if (post && (post.status === 'reported' || post.status === 'under_review')) {
        post.status = 'approved'
        await post.save({ transaction })
      }
    }

    await transaction.commit()
    res.redirect('/moderator/reports')

  } catch (error) {
    await transaction.rollback()
    console.error('Error in dismissReport:', error)
    res.status(500).json({ error: 'Error al desestimar' })
  }
}

exports.deleteReport = async (req, res) => {
  try {
    const reportId = req.params.id

    const report = await Report.findByPk(reportId)
    if (!report) {
      return res.status(404).render('pages/error', { message: 'Reporte no encontrado' })
    }

    if (report.status === 'pending') {
      return res.status(400).render('pages/error', { message: 'No se puede eliminar un reporte que aún está pendiente' })
    }

    const currentStatus = report.status
    await report.destroy()

    res.redirect(`/moderator/reports?status=${currentStatus}`)
  } catch (error) {
    console.error('Error in deleteReport:', error)
    res.status(500).render('pages/error', { message: 'Error interno al eliminar el reporte' })
  }
}
