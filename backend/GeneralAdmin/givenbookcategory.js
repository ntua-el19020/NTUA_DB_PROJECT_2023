const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.get('/', function (req, res) {
  const { Category } = req.query;

  let conditions = [];
  let values = [];

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    let query = `
    SELECT
      GROUP_CONCAT(DISTINCT WriterName ORDER BY WriterName ASC SEPARATOR ', ') AS FirstColumn,
      GROUP_CONCAT(DISTINCT TeacherName ORDER BY TeacherName ASC SEPARATOR ', ') AS SecondColumn
    FROM (
      SELECT
        WriterName,
        NULL AS TeacherName
      FROM
        book_writers
      INNER JOIN
        book_categories ON book_writers.ISBN = book_categories.ISBN
      WHERE
        book_categories.Category = ?
      UNION
      SELECT
        NULL AS WriterName,
        Teacher.TeacherName AS TeacherName
      FROM
        Teacher
      INNER JOIN
        Borrowing ON Teacher.IDUsers = Borrowing.IDUsers
      INNER JOIN
        book_categories ON Borrowing.ISBN = book_categories.ISBN
      WHERE
        book_categories.Category = ?
        AND Borrowing.BorrowDate > DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
    ) AS subquery;
    `;

    values.push(Category); 
    values.push(Category); 

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
