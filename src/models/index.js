const User = require('./User')
const Post = require('./Post')
const Image = require('./Image')
const Comment = require('./Comment')
const Rating = require('./Rating')
const Tag = require('./Tag')
const Report = require('./Report')
const Follow = require('./Follow')
const Notification = require('./Notification')
const Collection = require('./Collection')
const Interest = require('./Interest')

// Relaciones
User.hasMany(Post)
Post.belongsTo(User)

Post.hasMany(Image)
Image.belongsTo(Post)

User.hasMany(Comment)
Comment.belongsTo(User)
Post.hasMany(Comment)

Image.hasMany(Rating)
Rating.belongsTo(Image)
User.hasMany(Rating)

Post.belongsToMany(Tag, { through: 'post_tags' })
Tag.belongsToMany(Post, { through: 'post_tags' })

User.belongsToMany(User, {
  as: 'Followers',
  through: Follow,
  foreignKey: 'following_id'
})

User.belongsToMany(User, {
  as: 'Following',
  through: Follow,
  foreignKey: 'follower_id'
})

User.hasMany(Notification)
Collection.belongsTo(User)

module.exports = {
  User,
  Post,
  Image,
  Comment,
  Rating,
  Tag,
  Report,
  Follow,
  Notification,
  Collection,
  Interest
}
