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

    const loggedUserQuery = `
      SELECT IdLogged
      FROM LoggedUser
      ORDER BY IdLogged DESC
      LIMIT 1;
    `;

    connection.query(loggedUserQuery, (loggedUserError, loggedUserResults) => {
      if (loggedUserError) {
        console.error('Error retrieving logged user:', loggedUserError);
        res.status(500).json({ error: 'An error occurred while retrieving the logged user' });
        connection.release();
        return;
      }

      const idLogged = loggedUserResults[0].IdLogged;

      const query = `
        SELECT u.Username, st.StudentName, st.StudentEmail, u.IdUsers
        FROM student AS st
        INNER JOIN users AS u ON st.IdUsers = u.IdUsers
        WHERE st.IdSchool = (SELECT IdSchool FROM users WHERE IdUsers = ?) AND u.Approved = 0
        UNION
        SELECT u.Username, t.TeacherName, t.TeacherEmail, u.IdUsers
        FROM teacher AS t
        INNER JOIN users AS u ON t.IdUsers = u.IdUsers
        WHERE t.IdSchool = (SELECT IdSchool FROM users WHERE IdUsers = ?) AND u.Approved = 0
      `;

      connection.query(query, [idLogged, idLogged], (error, results) => {
        if (error) {
          console.error('Error retrieving users:', error);
          res.status(500).json({ error: 'An error occurred while retrieving the users' });
        } else {
          if (results.length > 0) {
            const users = results;

            const htmlResponse = `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <title>Pending Users</title>
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

                    .approve-button {
                      display: inline-block;
                      padding: 6px 12px;
                      font-size: 14px;
                      font-weight: bold;
                      text-decoration: none;
                      background-color: #008CBA;
                      color: #fff;
                      border: none;
                      border-radius: 4px;
                      cursor: pointer;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>Pending Users</h1>
                    <table>
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${users
                          .map(
                            (user) => `
                              <tr>
                                <td>${user.Username}</td>
                                <td>${user.StudentName || user.TeacherName}</td>
                                <td>${user.StudentEmail || user.TeacherEmail}</td>
                                <td><button class="approve-button" onclick="approveUser(${user.IdUsers})">Approve Request</button></td>
                              </tr>
                            `
                          )
                          .join('')}
                      </tbody>
                    </table>
                    <button class="back-button" onclick="location.href='/libq/schooladmin'">Back to the homepage</button>
                  </div>
                  <script>
                    function approveUser(userId) {
                      fetch('/libq/schooladmin/approve', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ userId: userId })
                      })
                        .then(response => {
                          if (response.ok) {
                            alert('User request approved!');
                            location.reload();
                          } else {
                            alert('Failed to approve user request.');
                          }
                        })
                        .catch(error => {
                          console.error('An error occurred while approving user request:', error);
                          alert('An error occurred while approving user request.');
                        });
                    }
                  </script>
                </body>
              </html>
            `;

            res.send(htmlResponse);
          } else {
            res.status(404).json({ error: 'No pending users found' });
          }
        }
        connection.release();
      });
    });
  });
});

router.post('/approve', function (req, res) {
  const userId = req.body.userId;

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    const query = `
      UPDATE users SET Approved = 1 WHERE IdUsers = ?
    `;

    connection.query(query, [userId], (error, results) => {
      if (error) {
        console.error('Error approving user request:', error);
        res.status(500).json({ error: 'An error occurred while approving the user request' });
      } else {
        res.status(200).json({ message: 'User request approved successfully' });
      }
      connection.release();
    });
  });
});

module.exports = router;
