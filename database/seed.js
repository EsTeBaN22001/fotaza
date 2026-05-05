require('dotenv').config()
const sequelize = require('../src/config/db')
const bcrypt = require('bcrypt')

const { User, Post, Image, Tag } = require('../src/models')

async function seed() {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
  await sequelize.sync({ force: true })
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1')

  const password = await bcrypt.hash('123456', 10)

  const user = await User.create({
    username: 'admin',
    email: 'admin@test.com',
    password,
    role: 'validator'
  })

  const post = await Post.create({
    title: 'Primera foto',
    description: 'Test',
    UserId: user.id
  })

  const image = await Image.create({
    url: 'uploads/test.jpg',
    license: 'free',
    PostId: post.id
  })

  const tag = await Tag.create({ name: 'naturaleza' })
  await post.addTag(tag)

  console.log('Seed completado')
  process.exit()
}

seed()
