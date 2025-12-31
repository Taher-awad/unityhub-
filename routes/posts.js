const express = require('express');
const router = express.Router();
const connection = require('../config/db');

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Home page
router.get('/home', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  const user = req.session.user;
  const sql = `
    SELECT posts.*, users.username AS username, users.profile_picture AS profile_picture,
           COUNT(post_comments.post_id) AS comment_count
    FROM posts
    INNER JOIN users ON posts.user_id = users.id
    LEFT JOIN post_comments ON posts.id = post_comments.post_id
    WHERE posts.user_id = ? OR EXISTS (
      SELECT 1 FROM friends WHERE friends.user_id = ? AND friends.friend_id = posts.user_id
    )
    GROUP BY posts.id
    ORDER BY posts.created_at DESC
  `;
  connection.query(sql, [user.id, user.id], (err, posts) => {
    if (err) {
      console.error('Error querying posts from database:', err.message);
      return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
    const friendSql = 'SELECT users.username AS username FROM friends INNER JOIN users ON friends.friend_id = users.id WHERE friends.user_id = ?';
    connection.query(friendSql, [user.id], (friendErr, friends) => {
      if (friendErr) {
        console.error('Error querying friends from database:', friendErr.message);
        return res.status(500).json({ error: 'An error occurred while processing your request' });
      }
      const shuffledPosts = shuffleArray(posts);
      res.render('home', { posts: shuffledPosts, user, friends });
    });
  });
});

// Create Post (Basic info)
router.post('/post', (req, res) => {
  const { userId, text } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  const sql = 'INSERT INTO posts (user_id, text) VALUES (?, ?)';
  connection.query(sql, [userId, text], (err, result) => {
    if (err) {
      console.error('Error inserting post into database:', err.message);
      return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
    const postId = result.insertId;
    const getPostSql = `
      SELECT posts.*, users.username AS username, users.profile_picture AS profile_picture
      FROM posts
      INNER JOIN users ON posts.user_id = users.id
      WHERE posts.id = ?
    `;
    connection.query(getPostSql, [postId], (getPostErr, postResult) => {
      if (getPostErr || postResult.length === 0) {
        console.error('Error retrieving newly added post:', getPostErr ? getPostErr.message : 'Post not found');
        return res.status(500).json({ error: 'An error occurred while processing your request' });
      }
      res.status(200).json(postResult[0]);
    });
  });
});

// Like/Unlike
router.post('/like', (req, res) => {
  const { postId, userId } = req.body;
  const checkLikedSql = 'SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?';
  connection.query(checkLikedSql, [postId, userId], (checkLikedErr, likedRows) => {
    if (checkLikedErr) {
      console.error('Error checking if post is already liked:', checkLikedErr.message);
      return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
    if (likedRows.length > 0) {
      const deleteLikeSql = 'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?';
      connection.query(deleteLikeSql, [postId, userId], (deleteLikeErr) => {
        if (deleteLikeErr) {
          console.error('Error deleting like from database:', deleteLikeErr.message);
          return res.status(500).json({ error: 'An error occurred while processing your request' });
        }
        const updateLikesSql = 'UPDATE posts SET likes = likes - 1 WHERE id = ?';
        connection.query(updateLikesSql, [postId], (updateLikesErr, updateResult) => {
          if (updateLikesErr) {
            console.error('Error updating post likes:', updateLikesErr.message);
            return res.status(500).json({ error: 'An error occurred while processing your request' });
          }
          res.json({ message: 'Post unliked successfully', liked: false, likeCount: updateResult.affectedRows });
        });
      });
    } else {
      const insertLikeSql = 'INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)';
      connection.query(insertLikeSql, [postId, userId], (insertLikeErr) => {
        if (insertLikeErr) {
          console.error('Error inserting like into database:', insertLikeErr.message);
          return res.status(500).json({ error: 'An error occurred while processing your request' });
        }
        const updateLikesSql = 'UPDATE posts SET likes = likes + 1 WHERE id = ?';
        connection.query(updateLikesSql, [postId], (updateLikesErr, updateResult) => {
          if (updateLikesErr) {
            console.error('Error updating post likes:', updateLikesErr.message);
            return res.status(500).json({ error: 'An error occurred while processing your request' });
          }
          res.json({ message: 'Post liked successfully', liked: true, likeCount: updateResult.affectedRows });
        });
      });
    }
  });
});

router.get('/check-like', (req, res) => {
  const { postId, userId } = req.query;
  const checkLikedSql = 'SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?';
  connection.query(checkLikedSql, [postId, userId], (checkLikedErr, likedRows) => {
      if (checkLikedErr) {
          console.error('Error checking if post is already liked:', checkLikedErr.message);
          return res.status(500).json({ error: 'An error occurred while processing your request' });
      }
      res.json({ liked: likedRows.length > 0 });
  });
});

// Comments
router.post('/comment', (req, res) => {
  const { postId, commentText } = req.body;
  const userId = req.session.user.id;

  const sql = 'INSERT INTO post_comments (post_id, user_id, text) VALUES (?, ?, ?)';
  connection.query(sql, [postId, userId, commentText], (err, result) => {
      if (err) {
          console.error('Error inserting comment into database:', err.message);
          return res.status(500).json({ error: 'An error occurred while processing your request' });
      }

      const getCommentSql = `
          SELECT pc.*, u.username
          FROM post_comments pc
          INNER JOIN users u ON pc.user_id = u.id
          WHERE pc.id = ?
      `;
      connection.query(getCommentSql, [result.insertId], (getCommentErr, commentResult) => {
          if (getCommentErr || commentResult.length === 0) {
              console.error('Error retrieving newly added comment:', getCommentErr ? getCommentErr.message : 'Comment not found');
              return res.status(500).json({ error: 'An error occurred while processing your request' });
          }
          res.status(200).json({ message: 'Comment added successfully', comment: commentResult[0] });
      });
  });
});

router.get('/comments', (req, res) => {
  const postId = req.query.postId;
  const sql = `
      SELECT post_comments.*, users.username
      FROM post_comments
      INNER JOIN users ON post_comments.user_id = users.id
      WHERE post_comments.post_id = ?
  `;
  connection.query(sql, [postId], (err, comments) => {
      if (err) {
          console.error('Error fetching comments:', err.message);
          return res.status(500).json({ error: 'An error occurred while processing your request' });
      }
      res.json(comments);
  });
});

module.exports = router;
