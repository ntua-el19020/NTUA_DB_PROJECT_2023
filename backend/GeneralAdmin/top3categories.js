const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.get('/', function (req, res) {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    let query = `
      SELECT category1, category2, COUNT(*) AS count
      FROM (
        SELECT b1.ISBN, b1.Category AS category1, b2.Category AS category2
        FROM Book_Categories as b1
        JOIN Book_Categories as b2 ON b1.ISBN = b2.ISBN AND b1.Category < b2.Category
        JOIN borrowing bor ON b1.ISBN = bor.ISBN
      ) AS book3_categories
      GROUP BY category1, category2
      ORDER BY count DESC
      LIMIT 3;
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
          <title>Top 3 Pairs of Categories</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 20px;
            }
            
            h1 {
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
            <h1>Top 3 Pairs of Categories</h1>
            <table>
              <thead>
                <tr>
                  <th>Category 1</th>
                  <th>Category 2</th>
                  <th>Number of Rentals</th>
                </tr>
              </thead>
              <tbody>
      `;

      for (const row of results) {
        htmlTable += `
          <tr>
            <td>${row.category1}</td>
            <td>${row.category2}</td>
            <td>${row.count}</td>
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
