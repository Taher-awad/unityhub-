const express = require('express');
const router = express.Router();
const path = require('path');
const connection = require('../config/db');

// Chat page
router.get('/chat', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, '../public', 'chat.html'));
});

// Send message
router.post('/send-message', (req, res) => {
  const { friendId, message } = req.body;
  const userId = req.session.user.id;

  const sql = 'INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)';
  connection.query(sql, [userId, friendId, message], (err) => {
    if (err) {
      console.error('Error inserting message into database:', err.message);
      return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
    res.status(200).json({ message: 'Message sent successfully' });
  });
});

// Get messages
router.get('/messages', (req, res) => {
  const friendId = req.query.friendId;
  const userId = req.session.user.id;

  const sql = `
    SELECT sender_id, receiver_id, message
    FROM chat_messages
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY sent_at ASC
  `;
  connection.query(sql, [userId, friendId, friendId, userId], (err, messages) => {
    if (err) {
      console.error('Error fetching messages:', err.message);
      return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
    res.json(messages.map(message => ({
      ...message,
      isSender: message.sender_id === userId
    })));
  });
});

module.exports = router;
