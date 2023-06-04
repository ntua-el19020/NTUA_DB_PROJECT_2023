const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.get('/', function (req, res) {
  const { Category } = req.query;

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    let query = `
      SELECT TeacherName, A.count AS TotalBorrowings
      FROM Teacher
      INNER JOIN (
        SELECT IDUsers, COUNT(*) AS count
        FROM Borrowing
        GROUP BY IDUsers
      ) AS A ON Teacher.IDUsers = A.IDUsers
      WHERE Teacher.BirthDate > DATE_SUB(CURDATE(), INTERVAL 40 YEAR)
      ORDER BY TotalBorrowings DESC;
    `;

    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'An error occurred while executing the query' });
        return;
      }

      let htmlTable = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Teacher Rentals</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
            }
            
            h1, h2 {
              text-align: center;
              color: #333;
            }

            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }

            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 20px;
            }

            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }

            th {
              background-color: #808285;
              color: #fff;
            }
            
            .back-button {
              display: inline-block;
              padding: 8px 16px;
              font-size: 14px;
              font-weight: bold;
              text-decoration: none;
              background-color: #4CAF50;
              color: #fff;
              border: none;
              border-radius: 4px;
            }
            
            .back-button::before {
              content: '←';
              margin-right: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Teacher Rentals</h1>
            <table>
              <thead>
                <tr>
                  <th>Teacher Name</th>
                  <th>Total Rentals</th>
                </tr>
              </thead>
              <tbody>
      `;

      for (const row of results) {
        htmlTable += `
          <tr>
            <td>${row.TeacherName}</td>
            <td>${row.TotalBorrowings}</td>
          </tr>
        `;
      }

      htmlTable += `
              </tbody>
            </table>
            <h3><a href="http://localhost:9103/libq/generaladmin" class="back-button">Back to the homepage</a></h3>
          </div>
        </body>
        </html>
      `;

      res.send(htmlTable);

      connection.release();
    });
  });
});

module.exports = router;
