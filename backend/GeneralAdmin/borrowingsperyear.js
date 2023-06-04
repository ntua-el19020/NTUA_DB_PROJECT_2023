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
        return;
      }

      const query = `
      SELECT NumBorrowedBooks, GROUP_CONCAT(DISTINCT SchoolAdminName) AS SchoolAdminList
      FROM (
        SELECT YEAR(b.BorrowDate) AS Year, p.SchoolAdminName, COUNT(b.ISBN) AS NumBorrowedBooks
        FROM Persons_Per_School_View p
        JOIN Borrowing b ON p.PersonId = b.IdUsers
        GROUP BY YEAR(b.BorrowDate), p.SchoolAdminName
      ) AS subquery
      WHERE NumBorrowedBooks > 20
      GROUP BY NumBorrowedBooks
      HAVING COUNT(DISTINCT SchoolAdminName) > 1
      ORDER BY NumBorrowedBooks DESC;
    `;

    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'An error occurred while executing the query' });
        return;
      }

      // Generate HTML table
      let htmlTable = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Query 3.1.5</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              padding: 20px;
            }
            
            h1 {
              text-align: center;
              color: #333;
              margin-bottom: 20px;
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
              margin-top: 20px;
            }
            .back-button::before {
              content: '←';
              margin-right: 5px;
            }

            .action-buttons {
              display: flex;
              gap: 10px;
            }

            .delete-button {
              background-color: #f44336;
            }

          </style>
        </head>
        <body>
          <h1>School Admins who have loaned the same number of books in a year with more than 20 loans</h1>
          <table>
            <thead>
              <tr>
                <th>Number of Borrowed Books</th>
                <th>List of School Admins</th>
              </tr>
            </thead>
            <tbody>
      `;

      // Append rows to the HTML table
      for (const row of results) {
        htmlTable += `
          <tr>
            <td>${row.NumBorrowedBooks}</td>
            <td>${row.SchoolAdminList}</td>
          </tr>
        `;
      }

      // Complete the HTML table
      htmlTable += `
            </tbody>
          </table>
          <a href="/libq/generaladmin" class="back-button">Back to the homepage</a>
        </body>
        </html>
      `;

      // Send the HTML response
      res.send(htmlTable);

      connection.release();
    });
  });
});

});
module.exports = router;
