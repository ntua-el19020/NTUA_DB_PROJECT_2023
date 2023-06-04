const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.get('/', function (req, res) {
  const query = `
  SELECT S.*
  FROM SchoolUnit S , SCHOOLADMIN A, USERS U
  WHERE S.SchoolAdmin = A.NAME AND A.IDUSERS= U.IDUSERS AND U.APPROVED=1;
  `;

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    connection.query(query, (err, results) => {
      connection.release(); 

      if (err) {
        console.error('Error executing the query: ', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      const schoolsHtml = generateSchoolsHtml(results);
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>School Units</title>
            <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                }

                .container {
                  max-width: 1200px;
                  margin: 0 auto;
                  padding: 20px;
                }

                h1 {
                  text-align: center;
                  color: #333;
                }

                table {
                  border-collapse: collapse;
                  width: 100%;
                  margin-bottom: 20px;
                  margin-left: auto;
                  margin-right: auto;
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

                .btn-container {
                  display: flex;
                  justify-content: flex-start; /* Changed to align buttons to the left */
                  margin-bottom: 20px;
                }

                .btn-container a {
                  display: inline-block;
                  padding: 8px 16px;
                  font-size: 14px;
                  font-weight: bold;
                  text-decoration: none;
                  background-color: #ff3d3d;
                  color: #fff;
                  border: none;
                  border-radius: 4px;
                }

                .btn-container button {
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
            </style>
            <script>
                // JavaScript function to delete a school unit
                function deleteSchool(schoolId) {
                  if (confirm('Are you sure you want to delete this school unit?')) {
                    fetch('/libq/generaladmin/viewschools/delete', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ schoolId })
                    })
                      .then(response => {
                        if (response.ok) {
                          location.reload(); // Reload the page after successful deletion
                        } else {
                          console.error('Error deleting school unit:', response.statusText);
                          alert('An error occurred while deleting the school unit');
                        }
                      })
                      .catch(error => {
                        console.error('Error deleting school unit:', error);
                        alert('An error occurred while deleting the school unit');
                      });
                  }
                }
            </script>
        </head>
        <body>
            <div class="container">
                <h1>School Units</h1>
                <div class="btn-container">
                    <a href="http://localhost:9103/libq/generaladmin/createschool">Add New School Unit</a>
                </div>
                <table>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Address street</th>
                        <th>Address Number</th>
                        <th>City</th>
                        <th>Email</th>
                        <th>School Principle</th>
                        <th>School Admin</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                    ${schoolsHtml}
                </table>
                <div class="btn-container">
                <button onclick="window.location.href='/libq/generaladmin'">← Back to homepage</button>
                </div>
            </div>
        </body>
        </html>
      `;

      res.send(html);
    });
  });
});

function generateSchoolsHtml(schools) {
  let html = '';

  schools.forEach((school) => {
    html += '<tr>';
    html += `<td>${school.IdSchool}</td>`;
    html += `<td>${school.Name}</td>`;
    html += `<td>${school.Adress_street}</td>`;
    html += `<td>${school.Adress_number}</td>`;
    html += `<td>${school.Adress_city}</td>`;
    html += `<td>${school.Email}</td>`;
    html += `<td>${school.SchoolPrinciple}</td>`;
    html += `<td>${school.SchoolAdmin}</td>`;
    html += `<td><a href="/libq/generaladmin/updateschool/${school.IdSchool}">Edit</a></td>`; // Add Edit link
    html += `<td><button onclick="deleteSchool(${school.IdSchool})">Delete</button></td>`; // Add Delete button
    html += '</tr>';
  });

  return html;
}

router.post('/delete', function (req, res) {
  const { schoolId } = req.body;

  const deleteQuery = 'DELETE FROM SchoolUnit WHERE IdSchool = ?';
  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    connection.query(deleteQuery, [schoolId], (err, results) => {
      connection.release(); 

      if (err) {
        console.error('Error executing the delete query:', err);
        res.status(500).json({ error: 'An error occurred while deleting the school' });
        return;
      }

      res.sendStatus(200);
    });
  });
});

module.exports = router;
