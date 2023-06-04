const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.get('/', function (req, res) {
  const loggedUserQuery = `
    SELECT IdLogged
    FROM LoggedUser
    ORDER BY IdLogged DESC
    LIMIT 1;
  `;

  pool.query(loggedUserQuery, (loggedUserError, loggedUserResults) => {
    if (loggedUserError) {
      console.error('Error executing loggedUserQuery:', loggedUserError);
      res.status(500).send('Internal Server Error');
      return;
    }

    const saIdUsers = loggedUserResults[0].IdLogged;

    const query = `
      SELECT DISTINCT b.BorrowingId, b.BorrowDate, b.Returned, b.ISBN, u.Name, u.Email
      FROM borrowing AS b
      INNER JOIN (
          SELECT IdUsers, IdSchool, StudentEmail AS Email, StudentName AS Name FROM student
          UNION
          SELECT IdUsers, IdSchool, TeacherEmail AS Email, TeacherName AS Name FROM teacher
      ) AS u
      INNER JOIN SchoolAdmin AS sa ON sa.IdSchool = u.IdSchool
      WHERE sa.IdUsers = ? AND b.IdUsers = u.IdUsers AND b.Returned = "False";
    `;

    pool.query(query, [saIdUsers], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Rendering the results as an HTML table
      const tableRows = results.map((row) => {
        return `
          <tr>
            <td>${row.BorrowDate}</td>
            <td>${row.Returned}</td>
            <td>${row.ISBN}</td>
            <td>${row.Name}</td>
            <td>${row.Email}</td>
            <td>
              <form method="POST" action="/libq/schooladmin/confirmreturn">
                <input type="hidden" name="borrowingId" value="${row.BorrowingId}">
                <button type="submit">Confirm Return</button>
              </form>
            </td>
          </tr>
        `;
      });

      const html = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>Confirm Returns of Books</title>
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

              .search-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
              }

              .search-container label {
                font-weight: bold;
              }

              .search-container input[type="text"] {
                padding: 8px;
                font-size: 14px;
                border: 1px solid #ccc;
                border-radius: 4px;
                width: 200px;
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
              <h1>Confirm Returns of Books</h1>
              <table>
                <tr>
                  <th>Date of Rental</th>
                  <th>Returned</th>
                  <th>ISBN</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
                ${tableRows.join('')}
              </table>
              <a href="/libq/schooladmin" class="back-button">Back to the homepage</a>
            </div>
          </body>
        </html>
      `;

      res.send(html);
    });
  });
});

module.exports = router;
