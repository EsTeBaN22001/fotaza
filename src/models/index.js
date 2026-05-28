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
const Message = require('./Message')

User.hasMany(Post, { foreignKey: 'UserId', as: 'posts', onDelete: 'CASCADE' })
Post.belongsTo(User, { foreignKey: 'UserId', as: 'User' })

Post.hasMany(PostImage, { foreignKey: 'PostId', as: 'images', onDelete: 'CASCADE' })
PostImage.belongsTo(Post, { foreignKey: 'PostId' })

User.hasMany(Comment, { onDelete: 'CASCADE' })
Comment.belongsTo(User)
Comment.belongsTo(Post)
Post.hasMany(Comment, { onDelete: 'CASCADE' })

// Rating ahora asociado a Post (no a PostImage)
Post.hasMany(Rating, { foreignKey: 'PostId', as: 'Ratings', onDelete: 'CASCADE' })
Rating.belongsTo(Post, { foreignKey: 'PostId' })
User.hasMany(Rating, { foreignKey: 'UserId', onDelete: 'CASCADE' })
Rating.belongsTo(User, { foreignKey: 'UserId' })

Post.belongsToMany(Tag, { through: 'post_tags', onDelete: 'CASCADE' })
Tag.belongsToMany(Post, { through: 'post_tags', onDelete: 'CASCADE' })

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
User.hasMany(Collection, { foreignKey: 'UserId', as: 'collections', onDelete: 'CASCADE' })
Collection.belongsTo(User, { foreignKey: 'UserId' })

Collection.hasMany(Bookmark, { foreignKey: 'CollectionId', as: 'bookmarks', onDelete: 'SET NULL' })
Bookmark.belongsTo(Collection, { foreignKey: 'CollectionId', as: 'Collection' })

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

// Interest: usuario expresa interés en adquirir una publicación
User.hasMany(Interest, { foreignKey: 'UserId', as: 'interests', onDelete: 'CASCADE' })
Interest.belongsTo(User, { foreignKey: 'UserId', as: 'InterestedUser' })
Post.hasMany(Interest, { foreignKey: 'PostId', as: 'Interests', onDelete: 'CASCADE' })
Interest.belongsTo(Post, { foreignKey: 'PostId' })

// Messages: mensajería privada 1-a-1
User.hasMany(Message, { foreignKey: 'senderId', as: 'SentMessages', onDelete: 'CASCADE' })
Message.belongsTo(User, { foreignKey: 'senderId', as: 'Sender' })
User.hasMany(Message, { foreignKey: 'receiverId', as: 'ReceivedMessages', onDelete: 'CASCADE' })
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'Receiver' })

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
  Bookmark,
  Message
}
