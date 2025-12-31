const express = require('express');
const router = express.Router();
const path = require('path');
const connection = require('../config/db');

// Add friend page
router.get('/addfriend', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, '../public', 'addfriend.html'));
});

// Search users
router.get('/search-users', (req, res) => {
  const searchQuery = req.query.q;
  const sql = 'SELECT id, username, email FROM users WHERE username LIKE ? OR email LIKE ?';
  connection.query(sql, [`%${searchQuery}%`, `%${searchQuery}%`], (err, users) => {
      if (err) {
          console.error('Error searching users:', err.message);
          return res.status(500).json({ error: 'An error occurred while processing your request' });
      }
      res.json(users);
  });
});

// Add friend
router.post('/add-friend/:friendId', (req, res) => {
  const userId = req.session.user.id;
  const friendId = req.params.friendId;

  const checkFriendQuery = 'SELECT * FROM users WHERE id = ?';
  connection.query(checkFriendQuery, [friendId], (err, results) => {
    if (err) {
      console.error('Error checking friend ID:', err.message);
      return res.status(500).send('Internal Server Error');
    }
    if (results.length === 0) {
      return res.status(404).send('Friend not found');
    }

    const checkFriendshipQuery = 'SELECT * FROM friends WHERE user_id = ? AND friend_id = ?';
    connection.query(checkFriendshipQuery, [userId, friendId], (friendshipErr, friendshipResults) => {
      if (friendshipErr) {
        console.error('Error checking friendship:', friendshipErr.message);
        return res.status(500).send('Internal Server Error');
      }
      if (friendshipResults.length > 0) {
        return res.status(400).send('Friendship already exists');
      }

      const insertFriendshipQuery = 'INSERT INTO friends (user_id, friend_id) VALUES (?, ?)';
      connection.query(insertFriendshipQuery, [userId, friendId], (insertErr) => {
        if (insertErr) {
          console.error('Error inserting friendship:', insertErr.message);
          return res.status(500).send('Internal Server Error');
        }
        return res.status(200).send('Friend added successfully');
      });
    });
  });
});

// Get friends
router.get('/friends', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.session.user.id;
  const sql = 'SELECT users.id, users.username, users.profile_picture FROM users INNER JOIN friends ON users.id = friends.friend_id WHERE friends.user_id = ?';
  connection.query(sql, [userId], (err, friends) => {
    if (err) {
      console.error('Error fetching friends:', err.message);
      return res.status(500).json({ error: 'An error occurred while fetching friends' });
    }
    res.json(friends);
  });
});

module.exports = router;
