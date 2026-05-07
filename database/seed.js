require('dotenv').config()
const sequelize = require('../src/config/db')
const bcrypt = require('bcrypt')

const { User, Post, PostImage, Tag } = require('../src/models')

async function seed() {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
  await sequelize.sync({ force: true })
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1')

  const password = await bcrypt.hash('esteban22001', 10)

  const user = await User.create({
    username: 'esteban22001',
    email: 'esteban1.redon2@gmail.com',
    password,
    role: 'validator'
  })

  const post = await Post.create({
    title: 'Primera foto',
    description: 'Test',
    UserId: user.id,
    commentsEnabled: true
  })

  await PostImage.bulkCreate([
    {
      url: '/uploads/test.webp',
      license: 'free',
      PostId: post.id
    },
    {
      url: '/uploads/test2.webp',
      license: 'free',
      PostId: post.id
    }
  ])

  const tag = await Tag.create({ name: 'naturaleza' })
  await post.addTag(tag)

  console.log('Seed completado')
  process.exit()
}

seed()
