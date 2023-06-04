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

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    connection.query(loggedUserQuery, (loggedUserError, loggedUserResults) => {
      if (loggedUserError) {
        console.error('Error retrieving logged user:', loggedUserError);
        res.status(500).json({ error: 'An error occurred while retrieving the logged user' });
        connection.release();
        return;
      }

      const idLogged = loggedUserResults[0].IdLogged;

      const query = `
        SELECT DISTINCT r.ReservationId, r.ReservationDate, r.Active, r.ISBN, u.Name, u.Email, r.IdUsers
        FROM reservation AS r
        INNER JOIN (
            SELECT IdUsers, IdSchool, StudentEmail AS Email, StudentName AS Name FROM student
            UNION
            SELECT IdUsers, IdSchool, TeacherEmail AS Email, TeacherName AS Name FROM teacher
        ) AS u
        INNER JOIN SchoolAdmin AS sa
        ON sa.IdSchool = u.IdSchool
        WHERE sa.IdUsers = ? AND r.IdUsers = u.IdUsers
      `;

      connection.query(query, [idLogged], function (error, results, fields) {
        if (error) {
          res.status(500).json({ error: 'An error occurred' });
        } else {
          let tableHTML = `
            <html>
              <head>
                <meta charset="utf-8">
                <title>Approve Reservations</title>
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
                  <h1>Approve Reservations</h1>
                  <table>
                    <thead>
                      <tr>
                        <th>Reservation Date</th>
                        <th>Status</th>
                        <th>ISBN</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Approve Request</th>
                        <th>Discard Request</th>
                      </tr>
                    </thead>
                    <tbody>
          `;

          results.forEach((row) => {
            const isActive = row.Active === 1;
            const status = isActive ? 'Active' : 'Inactive';

            tableHTML += `
              <tr>
                <td>${row.ReservationDate}</td>
                <td>${status}</td>
                <td>${row.ISBN}</td>
                <td>${row.Name}</td>
                <td>${row.Email}</td>
                <td>
                  <form method="POST" action="/libq/schooladmin/approveres">
                    <input type="hidden" name="userId" value="${row.IdUsers}">
                    <input type="hidden" name="isbn" value="${row.ISBN}">
                    <input type="hidden" name="reservationId" value="${row.ReservationId}">
                    <button type="submit" ${isActive ? '' : 'disabled'}>Approve Request</button>
                  </form>
                </td>
                <td> 
                  <form method="POST" action="/libq/schooladmin/deleteres">
                    <input type="hidden" name="reservationId" value="${row.ReservationId}">
                    <button type="submit">Discard Request</button>
                  </form>
                </td>
              </tr>
            `;
          });

          tableHTML += `
                    </tbody>
                  </table>
                  <a class="back-button" href="/libq/schooladmin">Back to the homepage</a>
                </div>
              </body>
            </html>
          `;

          res.send(tableHTML);

          connection.release();
        }
      });
    });
  });
});

module.exports = router;
