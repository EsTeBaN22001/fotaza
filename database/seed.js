require('dotenv').config()
const sequelize = require('../src/config/db')
const bcrypt = require('bcrypt')

const {
  User,
  Post,
  PostImage,
  Tag,
  Comment,
  Rating,
  Follow,
  Notification,
  Collection,
  Like,
  Report
} = require('../src/models')

const IMG = {
  sunset: '/uploads/seed_landscape_sunset.webp',
  butterfly: '/uploads/seed_butterfly_macro.webp',
  city: '/uploads/seed_city_night.webp',
  forest: '/uploads/seed_forest_path.webp',
  architecture: '/uploads/seed_architecture.webp',
  ocean: '/uploads/seed_ocean_waves.webp',
  alley: '/uploads/seed_european_alley.webp'
}

async function seed() {
  console.log('🌱 Iniciando seed...\n')

  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
  await sequelize.sync({ force: true })
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1')

  console.log('\n👤 Creando usuarios...')
  const password = await bcrypt.hash('esteban22001', 10)
  const passwordGeneric = await bcrypt.hash('password123', 10)

  const esteban = await User.create({
    username: 'esteban22001',
    email: 'esteban1.redon2@gmail.com',
    password,
    role: 'validator'
  })

  const lucia = await User.create({
    username: 'lucia_foto',
    email: 'lucia@example.com',
    password: passwordGeneric,
    role: 'user'
  })

  const marcos = await User.create({
    username: 'marcos_lens',
    email: 'marcos@example.com',
    password: passwordGeneric,
    role: 'user'
  })

  const ana = await User.create({
    username: 'ana_captures',
    email: 'ana@example.com',
    password: passwordGeneric,
    role: 'user'
  })

  const allUsers = [esteban, lucia, marcos, ana]
  console.log('  ✅ 4 usuarios creados')

  console.log('\n🏷️  Creando tags...')
  const tags = {}
  const tagNames = ['naturaleza', 'ciudad', 'arte', 'paisaje', 'macro', 'nocturna', 'arquitectura', 'viajes', 'retrato']
  for (const name of tagNames) {
    tags[name] = await Tag.create({ name })
  }
  console.log(`  ✅ ${tagNames.length} tags creados`)

  console.log('\n📸 Creando publicaciones...')

  const post1 = await Post.create({
    title: 'Atardecer en las montañas',
    description: 'Capturé este increíble atardecer mientras hacía trekking por la cordillera. Los colores del cielo eran surrealistas, mezcla de naranjas y púrpuras que parecían pintados a mano. Definitivamente uno de los mejores atardeceres que he fotografiado.',
    UserId: esteban.id,
    commentsEnabled: true
  })
  await PostImage.bulkCreate([
    { url: IMG.sunset, license: 'copyright', PostId: post1.id },
    { url: IMG.forest, license: 'copyright', PostId: post1.id }
  ])
  await post1.addTags([tags['naturaleza'], tags['paisaje']])

  const post2 = await Post.create({
    title: 'Mariposa en flor silvestre',
    description: 'Fotografía macro de una mariposa posándose sobre una flor silvestre. Usé un lente macro 100mm f/2.8 para lograr ese bokeh cremoso en el fondo. La paciencia es clave para este tipo de tomas.',
    UserId: esteban.id,
    commentsEnabled: true
  })
  await PostImage.create({
    url: IMG.butterfly,
    license: 'free',
    PostId: post2.id
  })
  await post2.addTags([tags['naturaleza'], tags['macro']])

  const post3 = await Post.create({
    title: 'Ciudad de noche',
    description: 'Fotografía nocturna urbana después de la lluvia. Los reflejos de neón en el asfalto mojado crean una atmósfera cyberpunk única. Exposición larga de 4 segundos a f/8, ISO 200.',
    UserId: esteban.id,
    commentsEnabled: true
  })
  await PostImage.bulkCreate([
    { url: IMG.city, license: 'copyright', PostId: post3.id },
    { url: IMG.architecture, license: 'copyright', PostId: post3.id }
  ])
  await post3.addTags([tags['ciudad'], tags['nocturna'], tags['arquitectura']])

  const post4 = await Post.create({
    title: 'Sendero entre bosques',
    description: 'Un paseo matutino por el bosque patagónico. La niebla entre los árboles crea una atmósfera mágica e irreal. Cada rayo de sol que se filtra es una oportunidad fotográfica.',
    UserId: lucia.id,
    commentsEnabled: true
  })
  await PostImage.create({
    url: IMG.forest,
    license: 'free',
    PostId: post4.id
  })
  await post4.addTags([tags['naturaleza'], tags['paisaje']])

  const post5 = await Post.create({
    title: 'Arquitectura moderna',
    description: 'Las líneas geométricas y los reflejos en los edificios de cristal siempre me fascinan. Esta toma fue hecha con un gran angular de 16mm para exagerar las perspectivas.',
    UserId: lucia.id,
    commentsEnabled: true
  })
  await PostImage.bulkCreate([
    { url: IMG.architecture, license: 'copyright', PostId: post5.id },
    { url: IMG.city, license: 'copyright', PostId: post5.id },
    { url: IMG.alley, license: 'copyright', PostId: post5.id }
  ])
  await post5.addTags([tags['arquitectura'], tags['ciudad']])

  const post6 = await Post.create({
    title: 'Olas rompiendo al atardecer',
    description: 'La costa atlántica tiene una energía increíble. Estas olas rompiendo contra los acantilados en la hora dorada fueron hipnóticas. Usé velocidad de obturación rápida (1/2000) para congelar el movimiento del agua.',
    UserId: lucia.id,
    commentsEnabled: true
  })
  await PostImage.create({
    url: IMG.ocean,
    license: 'free',
    PostId: post6.id
  })
  await post6.addTags([tags['naturaleza'], tags['paisaje']])

  const post7 = await Post.create({
    title: 'Callejón europeo',
    description: 'Recorriendo las callecitas de un pueblito en el sur de Francia. Los adoquines, las flores colgantes y esa luz cálida hacen que cada rincón sea una postal. Viajes que inspiran.',
    UserId: marcos.id,
    commentsEnabled: true
  })
  await PostImage.bulkCreate([
    { url: IMG.alley, license: 'copyright', PostId: post7.id },
    { url: IMG.sunset, license: 'copyright', PostId: post7.id }
  ])
  await post7.addTags([tags['viajes'], tags['ciudad'], tags['arte']])

  const post8 = await Post.create({
    title: 'Detalles en la naturaleza',
    description: 'A veces las fotos más impactantes están en los detalles más pequeños. Esta mariposa me dejó acercarme lo suficiente para capturar cada textura de sus alas.',
    UserId: marcos.id,
    commentsEnabled: true
  })
  await PostImage.create({
    url: IMG.butterfly,
    license: 'free',
    PostId: post8.id
  })
  await post8.addTags([tags['naturaleza'], tags['macro']])

  const post9 = await Post.create({
    title: 'Amanecer en la costa',
    description: 'Madrugar tiene su recompensa. Este amanecer en la costa con el cielo encendido de colores fue una de esas experiencias que no se olvidan. La fotografía no le hace justicia, pero se acerca.',
    UserId: marcos.id,
    commentsEnabled: false
  })
  await PostImage.bulkCreate([
    { url: IMG.ocean, license: 'free', PostId: post9.id },
    { url: IMG.sunset, license: 'free', PostId: post9.id },
    { url: IMG.forest, license: 'free', PostId: post9.id }
  ])
  await post9.addTags([tags['naturaleza'], tags['paisaje']])

  const allPosts = [post1, post2, post3, post4, post5, post6, post7, post8, post9]
  console.log('  ✅ 9 publicaciones creadas (con imágenes y tags)')

  console.log('\n💬 Creando comentarios...')

  await Comment.bulkCreate([
    { content: '¡Qué colores increíbles! ¿Con qué cámara sacaste esto?', PostId: post1.id, UserId: lucia.id },
    { content: 'El atardecer más hermoso que vi en mucho tiempo. Excelente composición.', PostId: post1.id, UserId: marcos.id },
    { content: 'La paleta de colores es espectacular 🔥', PostId: post1.id, UserId: ana.id },
    { content: 'Gracias a todos! Usé una Sony A7III con un 24-70mm f/2.8', PostId: post1.id, UserId: esteban.id },

    { content: 'El bokeh está perfecto, se nota el buen lente. ¿Es el Canon 100mm L?', PostId: post2.id, UserId: marcos.id },
    { content: '¡Me encanta la fotografía macro! ¿Cuánto tiempo estuviste esperando la toma?', PostId: post2.id, UserId: ana.id },
    { content: 'Alrededor de 45 minutos jaja, pero valió la pena', PostId: post2.id, UserId: esteban.id },

    { content: 'Parece sacada de Blade Runner 🎬', PostId: post3.id, UserId: lucia.id },
    { content: 'Los reflejos en el asfalto son brutales. Gran trabajo.', PostId: post3.id, UserId: marcos.id },
    { content: 'La composición urbana nocturna es tu fuerte, sin duda.', PostId: post3.id, UserId: ana.id }
  ])

  await Comment.bulkCreate([
    { content: 'La niebla le da un toque misterioso increíble', PostId: post4.id, UserId: esteban.id },
    { content: '¿Dónde es esto? Parece un bosque encantado', PostId: post4.id, UserId: marcos.id },
    { content: 'Es en el Parque Nacional Nahuel Huapi 🌲', PostId: post4.id, UserId: lucia.id },

    { content: 'Las líneas geométricas están muy bien logradas', PostId: post5.id, UserId: esteban.id },
    { content: 'El gran angular hace maravillas con la arquitectura', PostId: post5.id, UserId: ana.id },
    { content: 'Me gusta mucho cómo capturaste los reflejos en el vidrio', PostId: post5.id, UserId: marcos.id },
    { content: '¡Gracias! Es uno de mis temas favoritos para fotografiar', PostId: post5.id, UserId: lucia.id },

    { content: '¡La potencia del mar en una foto! Impresionante', PostId: post6.id, UserId: esteban.id },
    { content: 'La hora dorada siempre entrega los mejores resultados ✨', PostId: post6.id, UserId: ana.id }
  ])

  await Comment.bulkCreate([
    { content: 'Me transporté a Europa con esta foto. Hermosa.', PostId: post7.id, UserId: lucia.id },
    { content: '¡Los colores son increíbles! ¿Editaste mucho?', PostId: post7.id, UserId: esteban.id },
    { content: 'Muy poco, solo ajusté temperatura y contraste en Lightroom', PostId: post7.id, UserId: marcos.id },
    { content: 'Quiero ir a ese lugar algún día 😍', PostId: post7.id, UserId: ana.id },

    { content: 'La textura de las alas se ve increíble en esa resolución', PostId: post8.id, UserId: esteban.id },
    { content: 'Macro photography at its finest! 📷', PostId: post8.id, UserId: lucia.id },
    { content: 'Necesito aprender más sobre fotografía macro, ¿algún consejo?', PostId: post8.id, UserId: ana.id }
  ])

  console.log('  ✅ 26 comentarios creados')

  console.log('\n🤝 Creando relaciones de seguimiento...')

  await Follow.bulkCreate([

    { follower_id: esteban.id, following_id: lucia.id },
    { follower_id: esteban.id, following_id: marcos.id },

    { follower_id: lucia.id, following_id: esteban.id },
    { follower_id: lucia.id, following_id: ana.id },

    { follower_id: marcos.id, following_id: esteban.id },
    { follower_id: marcos.id, following_id: lucia.id },

    { follower_id: ana.id, following_id: esteban.id },
    { follower_id: ana.id, following_id: lucia.id },
    { follower_id: ana.id, following_id: marcos.id }
  ])

  console.log('  ✅ 9 relaciones de seguimiento creadas')

  console.log('\n⭐ Creando ratings...')

  const allImages = await PostImage.findAll()

  const ratingsData = []
  const ratingUsers = [lucia, marcos, ana, esteban]

  for (const img of allImages) {

    const post = await Post.findByPk(img.PostId)
    const eligibleUsers = ratingUsers.filter(u => u.id !== post.UserId)

    for (let i = 0; i < Math.min(eligibleUsers.length, 2 + Math.floor(Math.random() * 2)); i++) {
      ratingsData.push({
        value: 3 + Math.floor(Math.random() * 3),
        UserId: eligibleUsers[i].id,
        ImageId: img.id
      })
    }
  }

  await Rating.bulkCreate(ratingsData)
  console.log(`  ✅ ${ratingsData.length} ratings creados`)

  console.log('\n❤️  Creando likes...')
  const likesData = []

  for (const post of allPosts) {

    const numLikes = 1 + Math.floor(Math.random() * 4)
    const shuffledUsers = [...allUsers].sort(() => 0.5 - Math.random())

    for (let i = 0; i < numLikes; i++) {
      likesData.push({
        PostId: post.id,
        UserId: shuffledUsers[i].id
      })
    }
  }

  await Like.bulkCreate(likesData)
  console.log(`  ✅ ${likesData.length} likes creados`)

  console.log('\n🔔 Creando notificaciones...')

  await Notification.create({
    type: 'USER_FOLLOWED',
    UserId: esteban.id,
    actorId: marcos.id,
    message: 'ha comenzado a seguirte.',
    is_read: false
  })
  await Notification.create({
    type: 'COMMENT_CREATED',
    UserId: esteban.id,
    actorId: lucia.id,
    relatedId: post1.id,
    message: 'ha comentado tu publicación.',
    is_read: false
  })
  await Notification.create({
    type: 'POST_LIKED',
    UserId: esteban.id,
    actorId: ana.id,
    relatedId: post1.id,
    message: 'le ha gustado tu publicación.',
    is_read: true
  })
  await Notification.create({
    type: 'PUBLICATION_INTERESTED',
    UserId: lucia.id,
    actorId: marcos.id,
    relatedId: post4.id,
    message: 'ha guardado tu publicación.',
    is_read: false
  })

  console.log('  ✅ 4 notificaciones creadas')

  console.log('\n📁 Creando colecciones...')

  await Collection.create({ name: 'Mis favoritas', UserId: esteban.id })
  await Collection.create({ name: 'Inspiración paisajes', UserId: lucia.id })
  await Collection.create({ name: 'Para editar', UserId: marcos.id })

  console.log('  ✅ 3 colecciones creadas')

  console.log('\n🚩 Creando reportes de prueba...')

  post4.status = 'reported'
  await post4.save()
  await Report.create({
    reporterId: marcos.id,
    targetType: 'post',
    targetId: post4.id,
    reason: 'SPAM',
    description: 'Este post parece publicidad repetitiva de turismo.',
    status: 'pending'
  })

  post5.status = 'under_review'
  await post5.save()
  await Report.bulkCreate([
    {
      reporterId: esteban.id,
      targetType: 'post',
      targetId: post5.id,
      reason: 'COPYRIGHT',
      description: 'Esta foto fue tomada de una galería protegida de internet.',
      status: 'pending'
    },
    {
      reporterId: marcos.id,
      targetType: 'post',
      targetId: post5.id,
      reason: 'ESTAFA',
      description: 'Promociona una estafa inmobiliaria en el texto.',
      status: 'pending'
    },
    {
      reporterId: ana.id,
      targetType: 'post',
      targetId: post5.id,
      reason: 'CONTENIDO_INAPROPIADO',
      description: 'El texto es insultante y agresivo.',
      status: 'pending'
    }
  ])

  const commentInPost1 = await Comment.findOne({ where: { PostId: post1.id, UserId: lucia.id } })
  if (commentInPost1) {
    await Report.create({
      reporterId: ana.id,
      targetType: 'comment',
      targetId: commentInPost1.id,
      reason: 'ACOSO',
      description: 'Comentario agresivo e intimidante.',
      status: 'pending'
    })
  }

  console.log('  ✅ Reportes de prueba creados')

  console.log('\n' + '='.repeat(50))
  console.log('🎉 ¡Seed completado exitosamente!')
  console.log('='.repeat(50))
  console.log('\n📊 Resumen:')
  console.log('  👤 4 usuarios')
  console.log('  📸 9 publicaciones (con imágenes variadas)')
  console.log('  💬 26 comentarios')
  console.log('  🏷️  9 tags')
  console.log('  🤝 9 relaciones de seguimiento')
  console.log(`  ⭐ ${ratingsData.length} ratings`)
  console.log(`  ❤️  ${likesData.length} likes`)
  console.log('  🔔 4 notificaciones')
  console.log('  📁 3 colecciones')
  console.log('\n🔑 Credenciales:')
  console.log('  esteban22001 / esteban22001 (validator)')
  console.log('  lucia_foto   / password123')
  console.log('  marcos_lens  / password123')
  console.log('  ana_captures / password123')
  console.log('')

  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Error ejecutando seed:', err)
  process.exit(1)
})
