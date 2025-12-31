const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const connection = require('../config/db');

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ?';
  connection.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Error querying database:', err.message);
      return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
    if (results.length === 0) {
      return res.redirect('/?error=Invalid username or password');
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (bcryptErr, bcryptResult) => {
      if (bcryptErr) {
        console.error('Error comparing passwords:', bcryptErr.message);
        return res.status(500).json({ error: 'An error occurred while processing your request' });
      }
      if (!bcryptResult) {
        return res.redirect('/?error=Invalid username or password');
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email
      };
      res.redirect('/home');
    });
  });
});

// Signup
router.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
    if (hashErr) {
      console.error('Error hashing password:', hashErr.message);
      return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    connection.query(sql, [username, email, hashedPassword], (insertErr, result) => {
      if (insertErr) {
        console.error('Error inserting user into database:', insertErr.message);
        return res.status(500).json({ error: 'An error occurred while processing your request' });
      }
      res.redirect('/');
    });
  });
});

module.exports = router;
