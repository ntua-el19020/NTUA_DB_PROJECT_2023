const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.get('/', function (req, res) {
  const { Category, name, surname, daysLate } = req.query;

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

    connection.query(loggedUserQuery, function (loggedUserErr, loggedUserResults) {
      if (loggedUserErr) {
        console.error('Error executing logged user query:', loggedUserErr);
        res.status(500).json({ error: 'An error occurred while executing the logged user query' });
        connection.release();
        return;
      }

      const loggedUserId = loggedUserResults[0].IdLogged;

      const studentQuery = `
        SELECT DISTINCT bk.Title AS title, s.IdUsers, SUBSTRING_INDEX(s.StudentName, ' ', 1) AS Name, SUBSTRING_INDEX(s.StudentName, ' ', -1) AS Surname, DATEDIFF(CURDATE(), b.BorrowDate) AS DaysLate
        FROM Student s
        JOIN Borrowing b ON b.IdUsers = s.IdUsers
        JOIN SchoolAdmin sa ON sa.IdUsers = ${loggedUserId}
        JOIN Book bk ON bk.ISBN = b.ISBN
        WHERE s.IdSchool = sa.IdSchool
          AND b.Returned = "False"
          AND DATE_ADD(b.BorrowDate, INTERVAL 14 DAY) < CURDATE()
        ORDER BY s.StudentName ASC;
      `;

      const teacherQuery = `
        SELECT DISTINCT bk.Title AS title, t.IdUsers, SUBSTRING_INDEX(t.TeacherName, ' ', 1) AS Name, SUBSTRING_INDEX(t.TeacherName, ' ', -1) AS Surname, DATEDIFF(CURDATE(), b.BorrowDate) AS DaysLate
        FROM Teacher t
        JOIN Borrowing b ON b.IdUsers = t.IdUsers
        JOIN SchoolAdmin sa ON sa.IdUsers = ${loggedUserId}
        JOIN Book bk ON bk.ISBN = b.ISBN
        WHERE t.IdSchool = sa.IdSchool
          AND b.Returned = "False"
          AND DATE_ADD(b.BorrowDate, INTERVAL 14 DAY) < CURDATE()
        ORDER BY t.TeacherName ASC;
      `;

      connection.query(studentQuery, function (studentErr, studentResults) {
        if (studentErr) {
          console.error('Error executing student query:', studentErr);
          res.status(500).json({ error: 'An error occurred while executing the student query' });
          connection.release();
          return;
        }

        connection.query(teacherQuery, function (teacherErr, teacherResults) {
          connection.release();

          if (teacherErr) {
            console.error('Error executing teacher query:', teacherErr);
            res.status(500).json({ error: 'An error occurred while executing the teacher query' });
            return;
          }

          let html = `
          <html>
            <head>
              <meta charset="utf-8">
              <title>Late Users</title>
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
              <script>
                function searchTable() {
                  const nameInput = document.getElementById('nameInput').value.toLowerCase();
                  const surnameInput = document.getElementById('surnameInput').value.toLowerCase();
                  const daysLateInput = document.getElementById('daysLateInput').value.toLowerCase();
                  const tableRows = document.getElementsByClassName('tableRow');

                  Array.from(tableRows).forEach(row => {
                    const name = row.getElementsByClassName('name')[0].textContent.toLowerCase();
                    const surname = row.getElementsByClassName('surname')[0].textContent.toLowerCase();
                    const daysLate = row.getElementsByClassName('daysLate')[0].textContent.toLowerCase();
                    const title = row.getElementsByClassName('title')[0].textContent.toLowerCase();
                    
                    const nameMatch = name.includes(nameInput);
                    const surnameMatch = surname.includes(surnameInput);
                    const daysLateMatch = daysLate.includes(daysLateInput);

                    if (nameMatch && surnameMatch && daysLateMatch) {
                      row.style.display = 'table-row';
                    } else {
                      row.style.display = 'none';
                    }
                  });
                }
              </script>
            </head>
            <body>
              <div class="container">
                <h1>Late Students and Teachers</h1>
                <div class="search-container">
                  <div>
                    <label for="nameInput">Name:</label>
                    <input type="text" id="nameInput" placeholder="Search by name" value="${name || ''}" onkeyup="searchTable()">
                  </div>
                  <div>
                    <label for="surnameInput">Surname:</label>
                    <input type="text" id="surnameInput" placeholder="Search by surname" value="${surname || ''}" onkeyup="searchTable()">
                  </div>
                  <div>
                    <label for="daysLateInput">Days Late:</label>
                    <input type="text" id="daysLateInput" placeholder="Search by days late" value="${daysLate || ''}" onkeyup="searchTable()">
                  </div>
                </div>
                <h2>Students</h2>
                <table>
                  <tr>
                    <th>Name</th>
                    <th>Surname</th>
                    <th>Days Late</th>
                    <th>Book Title</th>
                  </tr>
        `;

          studentResults.forEach(function (student) {
            html += `
            <tr class="tableRow">
              <td class="name">${student.Name}</td>
              <td class="surname">${student.Surname}</td>
              <td class="daysLate">${student.DaysLate}</td>
              <td class="title">${student.title}</td>
            </tr>
          `;
          });

          html += `
                </table>
                <h2>Teachers</h2>
                <table>
                  <tr>
                    <th>Name</th>
                    <th>Surname</th>
                    <th>Days Late</th>
                    <th>Book Title</th>
                  </tr>
        `;

          teacherResults.forEach(function (teacher) {
            html += `
            <tr class="tableRow">
              <td class="name">${teacher.Name}</td>
              <td class="surname">${teacher.Surname}</td>
              <td class="daysLate">${teacher.DaysLate}</td>
              <td class="title">${teacher.title}</td>
            </tr>
          `;
          });

          html += `
                </table>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="/libq/schooladmin" class="back-button">Back to Home Page</a>
                </div>
              </div>
            </body>
          </html>
        `;

          res.send(html);
        });
      });
    });
  });
});

module.exports = router;
