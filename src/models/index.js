const User = require('./User')
const Post = require('./Post')
const Image = require('./Image')

User.hasMany(Post)
Post.belongsTo(User)

Post.hasMany(Image)
Image.belongsTo(Post)

module.exports = {
  User,
  Post,
  Image
}
