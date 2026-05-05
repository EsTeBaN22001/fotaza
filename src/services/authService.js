const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User } = require('../models')

exports.register = async ({ username, email, password }) => {
  const existingUser = await User.findOne({ where: { email } })

  if (existingUser) {
    throw new Error('El email ya está registrado')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await User.create({
    username,
    email,
    password: hashedPassword
  })

  return user
}

exports.login = async (email, password) => {
  const user = await User.findOne({ where: { email } })

  if (!user) throw new Error('Usuario no encontrado')

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error('Contraseña incorrecta')

  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' })
}
