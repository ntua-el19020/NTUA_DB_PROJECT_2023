const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.get('/', function (req, res) {
  const { YEAR, MONTH } = req.query;

  let conditions = [];
  let values = [];

  if (YEAR) {
    conditions.push('YEAR(b.BorrowDate) = ?');
    values.push(YEAR);
  }

  if (MONTH) {
    conditions.push('MONTH(b.BorrowDate) = ?');
    values.push(MONTH);
  }

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    let query = `
      SELECT su.Name AS SchoolName, COUNT(*) AS TotalBorrowings
      FROM Borrowing AS b
      JOIN Student AS s ON b.IdUsers = s.IdUsers
      JOIN SchoolUnit AS su ON s.IdSchool = su.IdSchool
    `;

    if (conditions.length > 0) {
      const whereClause = conditions.join(' AND ');
      query += ' WHERE ' + whereClause + ' GROUP BY su.Name';
    }

    if (conditions.length == 0) {
      query += ' GROUP BY su.Name';
    }

    connection.query(query, values, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'An error occurred while executing the query' });
        return;
      }
      res.json(results);
    });

    connection.release();
  });
});

module.exports = router;
