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

    let query1 = `
      SELECT IdSchool
      FROM schooladmin
      JOIN LoggedUSer ON schooladmin.Idusers = LoggedUSer.IdLogged;
    `;

    connection.query(query1, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'An error occurred while executing the query' });
        connection.release();
        return;
      }

      const idSchool = results[0].IdSchool;

      const query0 = `
        CREATE OR REPLACE VIEW Persons_Per_School_View AS
        SELECT sa.IdUsers as IdSchoolAdmin, sa.Name as SchoolAdminName, s.IdSchool, 'Student' AS PersonType, st.IdUsers AS PersonId, st.StudentName AS PersonName, st.StudentEmail AS PersonEmail
        FROM Student st
        JOIN SchoolAdmin sa ON st.IdSchool = sa.IdSchool
        JOIN SchoolUnit s ON sa.IdSchool = s.IdSchool
        UNION ALL
        SELECT sa.IdUsers IdSchoolAdmin, sa.Name as SchoolAdminName,s.IdSchool, 'Teacher' AS PersonType, t.IdUsers AS PersonId, t.TeacherName AS PersonName, t.TeacherEmail AS PersonEmail
        FROM Teacher t
        JOIN SchoolAdmin sa ON t.IdSchool = sa.IdSchool
        JOIN SchoolUnit s ON sa.IdSchool = s.IdSchool;
      `;

      connection.query(query0, (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({ error: 'An error occurred while executing the query' });
          connection.release();
          return;
        }

        const query0101 = `
          SELECT r.* 
          FROM review r
          INNER JOIN Persons_Per_School_View p ON p.PersonId = r.Idusers
          WHERE p.IdSchool = ? AND r.Approval = 0;
        `;

        connection.query(query0101, [idSchool], (err, results) => {
          connection.release();
          if (err) {
            console.error('Error retrieving reviews:', err);
            res.status(500).json({ error: 'An error occurred while retrieving the reviews' });
            return;
          }
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
                <h1>Approve Reviews</h1>
                <table>
                  <thead>
                    <tr>
                      <th>ReviewText</th>
                      <th>RatingLikert</th>
                      <th>ISBN</th>
                    </tr>
                  </thead>
                  <tbody>
        `;
  
        results.forEach((row) => {
          const isActive = row.Active === 1;
          const status = isActive ? 'Active' : 'Inactive';
  
          tableHTML += `
            <tr>
              <td>${row.ReviewText}</td>
              <td>${row.RatingLikert}</td>
              <td>${row.ISBN}</td>
              <td>
                <form method="POST" action="/libq/schooladmin/approvereview/approve">
                  <input type="hidden" name="IdUsers" value="${row.IdUsers}">
                  <input type="hidden" name="ISBN" value="${row.ISBN}">
                  <button type="submit">Approve Review</button>
                </form>
              </td>
              <td> 
                <form method="POST" action="/libq/schooladmin/approvereview/delete">
                <input type="hidden" name="IdUsers" value="${row.IdUsers}">
                <input type="hidden" name="ISBN" value="${row.ISBN}">
                <button type="submit">Discard Review</button>
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
        });
      });
    });
  });
});

router.post('/approve', (req, res) => {
    const IdUsers = req.body.IdUsers;
    const ISBN = req.body.ISBN;

    pool.getConnection(function (err, connection) {
      if (err) {
        console.error('Error getting database connection:', err);
        res.status(500).json({ error: 'An error occurred while getting a database connection' });
        return;
      }
 

      const updateQuery = 'UPDATE Review SET Approval = 1 WHERE IdUsers = ? and ISBN=?';
  
      connection.query(updateQuery, [IdUsers,ISBN], (err, results) => {
        if (err) throw err;
        console.log(`Review for book by user ${IdUsers} approved`);
  
        connection.release();
  
        res.redirect('/libq/schooladmin/approvereview');
      });
    });
  });
  
  router.post('/delete', (req, res) => {
    const IdUsers = req.body.IdUsers;
    const ISBN = req.body.ISBN;
  
    pool.getConnection(function (err, connection) {
      if (err) {
        console.error('Error getting database connection:', err);
        res.status(500).json({ error: 'An error occurred while getting a database connection' });
        return;
      }
  
      const deleteQuery = 'DELETE FROM Review WHERE IdUsers = ? and ISBN=?';
  
      connection.query(deleteQuery, [IdUsers,ISBN], (err, results) => {
        if (err) throw err;
        console.log(`Review for book ${ISBN} deleted`);
  
        connection.release();
  
        res.redirect('/libq/schooladmin/approvereview');
      });
    });
  });
  
  module.exports = router;
  