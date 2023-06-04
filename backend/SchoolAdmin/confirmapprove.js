const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.post('/', function (req, res) {
  const userId = req.body.userId;

  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    const query = `UPDATE users SET Approved = 1 WHERE IdUsers = ?`;

    connection.query(query, [userId], (error, results) => {
      if (error) {
        console.error('Error approving user request:', error);
        res.status(500).json({ error: 'Failed to approve user request' });
      } else {
        res.json({ message: 'User request approved successfully' });
      }
      connection.release();
    });
  });
});

module.exports = router;
