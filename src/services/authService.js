const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User } = require('../models')

exports.register = async data => {
  const hash = await bcrypt.hash(data.password, 10)

  return await User.create({
    ...data,
    password: hash
  })
}

exports.login = async (email, password) => {
  const user = await User.findOne({ where: { email } })

  if (!user) throw new Error('User not found')

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error('Invalid password')

  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' })
}
