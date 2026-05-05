const User = require('./User')
const Post = require('./Post')
const PostImage = require('./PostImage')
const Comment = require('./Comment')
const Rating = require('./Rating')
const Tag = require('./Tag')
const Report = require('./Report')
const Follow = require('./Follow')
const Notification = require('./Notification')
const Collection = require('./Collection')
const Interest = require('./Interest')

// Relaciones
User.hasMany(Post, { foreignKey: 'UserId', as: 'posts' }) // opcional
Post.belongsTo(User, { foreignKey: 'UserId', as: 'User' }) // ✅ as: 'User' (PascalCase)

// 🖼️ Post ↔ PostImage
Post.hasMany(PostImage, { foreignKey: 'PostId', as: 'images' }) // ✅ as: 'images'
PostImage.belongsTo(Post, { foreignKey: 'PostId' })

User.hasMany(Comment)
Comment.belongsTo(User)
Comment.belongsTo(Post)
Post.hasMany(Comment)

PostImage.hasMany(Rating)
Rating.belongsTo(PostImage)
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
  PostImage,
  Comment,
  Rating,
  Tag,
  Report,
  Follow,
  Notification,
  Collection,
  Interest
}
