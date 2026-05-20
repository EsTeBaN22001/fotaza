-- ============================
-- CREACIÓN BASE DE DATOS
-- ============================
DROP DATABASE IF EXISTS fotaza2;
CREATE DATABASE fotaza2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fotaza2;

-- ============================
-- USERS
-- ============================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','validator') DEFAULT 'user',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================
-- POSTS
-- ============================
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  user_id INT NOT NULL,
  comments_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_posts_user ON posts(user_id);

-- ============================
-- IMAGES
-- ============================
CREATE TABLE images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NULL,
  mimeType VARCHAR(100) NOT NULL,
  imageData LONGBLOB NOT NULL,
  originalData LONGBLOB NULL,
  license ENUM('copyright','free') NOT NULL,
  watermark VARCHAR(255),
  post_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_images_post ON images(post_id);

-- ============================
-- TAGS
-- ============================
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- N:M POSTS - TAGS
CREATE TABLE post_tags (
  post_id INT,
  tag_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- ============================
-- COMMENTS
-- ============================
CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- ============================
-- RATINGS (valoración por publicación, no por imagen)
-- ============================
CREATE TABLE ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  value INT NOT NULL CHECK (value BETWEEN 1 AND 5),
  UserId INT NOT NULL,
  PostId INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_post_rating (UserId, PostId),
  FOREIGN KEY (UserId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (PostId) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_ratings_post ON ratings(PostId);

-- ============================
-- REPORTS (IMÁGENES / COMENTARIOS)
-- ============================
CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reason VARCHAR(255) NOT NULL,
  description TEXT,
  user_id INT NOT NULL,
  image_id INT NULL,
  comment_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- ============================
-- FOLLOWERS
-- ============================
CREATE TABLE follows (
  follower_id INT,
  following_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  PRIMARY KEY (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================
-- NOTIFICATIONS
-- ============================
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  user_id INT NOT NULL,
  triggered_by INT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (triggered_by) REFERENCES users(id)
);

-- ============================
-- COLLECTIONS
-- ============================
CREATE TABLE collections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE collection_posts (
  collection_id INT,
  post_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  PRIMARY KEY (collection_id, post_id),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- ============================
-- INTEREST (ME INTERESA - por publicación)
-- ============================
CREATE TABLE interests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  UserId INT NOT NULL,
  PostId INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_post_interest (UserId, PostId),
  FOREIGN KEY (UserId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (PostId) REFERENCES posts(id) ON DELETE CASCADE
);

-- ============================
-- MESSAGES (mensajería privada 1-a-1)
-- ============================
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  senderId INT NOT NULL,
  receiverId INT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_sender ON messages(senderId);
CREATE INDEX idx_messages_receiver ON messages(receiverId);

-- ============================
-- DATOS DE PRUEBA
-- ============================

-- Usuarios (password = 123456 en bcrypt)
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@test.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36uW0H7Z1xE3e8h5o5h3Z2K', 'validator'),
('user1', 'user1@test.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36uW0H7Z1xE3e8h5o5h3Z2K', 'user');

-- Tags
INSERT INTO tags (name) VALUES ('naturaleza'), ('ciudad'), ('arte');

-- Post
INSERT INTO posts (title, description, user_id) VALUES
('Mi primera foto', 'Descripción de prueba', 2);

-- Imagen
INSERT INTO images (filename, mimeType, imageData, license, watermark, post_id) VALUES
('test.jpg', 'image/jpeg', X'FFD8FFE000104A46494600010101006000600000FFFE000E46696C65207772697474656EFFDB004300080606070605080707070909080A0C140D0C0B0B0C1912130F141D1A1F1E1D1A1C1C20242E2720222C231C1C2837292C30313434341F27393D38323C2E333432FFC0000B080001000101011100FFC40014000100000000000000000000000000000000FFC40014100100000000000000000000000000000000FFDA0008010100003F0037FFD9', 'free', NULL, 1);

-- Relación tag
INSERT INTO post_tags (post_id, tag_id) VALUES (1,1);

-- Comentario
INSERT INTO comments (content, user_id, post_id) VALUES
('Muy buena foto!', 1, 1);

-- Rating
INSERT INTO ratings (value, user_id, image_id) VALUES
(5, 1, 1);

-- Follow
INSERT INTO follows (follower_id, following_id) VALUES
(1,2);

-- Colección
INSERT INTO collections (name, user_id) VALUES
('Favoritas', 2);

INSERT INTO collection_posts (collection_id, post_id) VALUES
(1,1);