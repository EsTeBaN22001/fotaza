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
const Bookmark = require('./Bookmark')

User.hasMany(Post, { foreignKey: 'UserId', as: 'posts' })
Post.belongsTo(User, { foreignKey: 'UserId', as: 'User' })

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
  foreignKey: 'following_id',
  otherKey: 'follower_id'
})

User.belongsToMany(User, {
  as: 'Following',
  through: Follow,
  foreignKey: 'follower_id',
  otherKey: 'following_id'
})

User.hasMany(Notification, { foreignKey: 'UserId', as: 'notifications' })
Notification.belongsTo(User, { foreignKey: 'UserId', as: 'Receiver' })
Notification.belongsTo(User, { foreignKey: 'actorId', as: 'Actor' })
Collection.belongsTo(User)

User.hasMany(Like, { onDelete: 'CASCADE' })
Like.belongsTo(User, { onDelete: 'CASCADE' })
Post.hasMany(Like, { onDelete: 'CASCADE' })
Like.belongsTo(Post, { onDelete: 'CASCADE' })

User.belongsToMany(Post, { through: Like, as: 'LikedPosts', onDelete: 'CASCADE' })
Post.belongsToMany(User, { through: Like, as: 'LikedBy', onDelete: 'CASCADE' })

User.hasMany(Bookmark, { onDelete: 'CASCADE' })
Bookmark.belongsTo(User, { onDelete: 'CASCADE' })
Post.hasMany(Bookmark, { onDelete: 'CASCADE' })
Bookmark.belongsTo(Post, { onDelete: 'CASCADE' })

User.belongsToMany(Post, { through: Bookmark, as: 'SavedPosts', onDelete: 'CASCADE' })
Post.belongsToMany(User, { through: Bookmark, as: 'SavedBy', onDelete: 'CASCADE' })

User.hasMany(Report, { foreignKey: 'reporterId', as: 'reportsMade' })
Report.belongsTo(User, { foreignKey: 'reporterId', as: 'Reporter' })
User.hasMany(Report, { foreignKey: 'resolverId', as: 'reportsResolved' })
Report.belongsTo(User, { foreignKey: 'resolverId', as: 'Resolver' })

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
  Like,
  Bookmark
}
