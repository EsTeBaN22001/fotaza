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
const Like = require('./Like')


// Relaciones
User.hasMany(Post, { foreignKey: 'UserId', as: 'posts' })
Post.belongsTo(User, { foreignKey: 'UserId', as: 'User' })

// 🖼️ Post ↔ PostImage
Post.hasMany(PostImage, { foreignKey: 'PostId', as: 'images' })
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
  foreignKey: 'following_id', // Columna que apunta al usuario que RECIBE el follow
  otherKey: 'follower_id' // Columna que apunta al usuario que HACE el follow
})

User.belongsToMany(User, {
  as: 'Following',
  through: Follow,
  foreignKey: 'follower_id', // Columna que apunta al usuario que HACE el follow
  otherKey: 'following_id' // Columna que apunta al usuario que RECIBE el follow
})

User.hasMany(Notification)
Collection.belongsTo(User)

// ❤️ Likes
User.hasMany(Like, { onDelete: 'CASCADE' })
Like.belongsTo(User, { onDelete: 'CASCADE' })
Post.hasMany(Like, { onDelete: 'CASCADE' })
Like.belongsTo(Post, { onDelete: 'CASCADE' })
// Atajo: Muchos a muchos entre User y Post a través de Like
User.belongsToMany(Post, { through: Like, as: 'LikedPosts', onDelete: 'CASCADE' })
Post.belongsToMany(User, { through: Like, as: 'LikedBy', onDelete: 'CASCADE' })

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
  Interest,
  Like
}
