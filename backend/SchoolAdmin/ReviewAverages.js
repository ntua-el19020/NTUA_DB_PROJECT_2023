const express = require('express');
const router = express.Router();
const pool = require('../connect');

const dropQuery = `DROP VIEW IF EXISTS SchoolUser;`
const viewQuery = `
  CREATE VIEW SchoolUser AS
    SELECT IdUsers, IdSchool, 'Student' AS UserType, StudentName AS Name
    FROM Student
    UNION ALL
    SELECT IdUsers, IdSchool, 'Teacher' AS UserType, TeacherName AS Name
    FROM Teacher;
`;

router.get('/', function (req, res) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Error getting database connection:', err);
            res.status(500).json({ error: 'An error occurred while getting a database connection' });
            return;
        }
        connection.query(dropQuery, function (viewErr, viewResults) {
            if (viewErr) {
                console.error('Error executing view query:', viewErr);
                res.status(500).json({ error: 'An error occurred while executing the view query' });
                connection.release();
                return;
            }
            connection.query(viewQuery, function (viewErr, viewResults) {
                if (viewErr) {
                    console.error('Error executing view query:', viewErr);
                    res.status(500).json({ error: 'An error occurred while executing the view query' });
                    connection.release();
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

                    const userQuery = `
        SELECT 
          SUBSTRING_INDEX(s.Name, ' ', 1) AS FirstName,
          SUBSTRING_INDEX(s.Name, ' ', -1) AS Surname,
          AVG(r.RatingLikert) AS MeanRating
        FROM SchoolUser s
        JOIN Review r ON r.IdUsers = s.IdUsers
        JOIN SchoolAdmin sa ON sa.IdUsers = ${loggedUserId}
        WHERE s.IdSchool = sa.IdSchool
          AND r.Approval = 1
        GROUP BY FirstName, Surname;
      `;

                    const categoryQuery = `
        SELECT 
          bc.Category,
          AVG(r.RatingLikert) AS MeanRating
        FROM SchoolUser s
        JOIN Review r ON r.IdUsers = s.IdUsers
        JOIN SchoolAdmin sa ON sa.IdUsers = ${loggedUserId}
        JOIN Book_Categories bc ON bc.ISBN = r.ISBN
        WHERE s.IdSchool = sa.IdSchool
          AND r.Approval = 1
        GROUP BY bc.Category;
      `;

                    connection.query(userQuery, function (userErr, userResults) {
                        if (userErr) {
                            console.error('Error executing user query:', userErr);
                            res.status(500).json({ error: 'An error occurred while executing the user query' });
                            connection.release();
                            return;
                        }

                        connection.query(categoryQuery, function (categoryErr, categoryResults) {
                            connection.release();

                            if (categoryErr) {
                                console.error('Error executing category query:', categoryErr);
                                res.status(500).json({ error: 'An error occurred while executing the category query' });
                                return;
                            }

                            let html = `
          <html>
            <head>
              <meta charset="utf-8">
              <title>Mean Ratings</title>
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
                  position: sticky;
                  top: 0;
                  z-index: 1;
                }

                th:first-child, td:first-child {
                  width: 200px;
                }

                th:nth-child(2), td:nth-child(2) {
                  width: 200px;
                }

                th:nth-child(3), td:nth-child(3) {
                  width: 150px;
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

                .search-bar {
                  height: 25px;
                  width: 300px;
                  margin-bottom: 10px;
                }

                .back-button::before {
                  content: '←';
                  margin-right: 5px;
                }
              </style>
              <script>
                window.addEventListener('DOMContentLoaded', () => {
                  const searchBar = document.getElementById('search-bar');
                  const userRows = document.querySelectorAll('.user-row');
                  const categoryDropdown = document.getElementById('category-dropdown');
                  const categoryRows = document.querySelectorAll('.category-row');

                  searchBar.addEventListener('keyup', (event) => {
                    const searchTerm = event.target.value.toLowerCase();

                    userRows.forEach((row) => {
                      const firstName = row.querySelector('.first-name').textContent.toLowerCase();
                      const surname = row.querySelector('.surname').textContent.toLowerCase();

                      if (firstName.includes(searchTerm) || surname.includes(searchTerm)) {
                        row.style.display = '';
                      } else {
                        row.style.display = 'none';
                      }
                    });
                  });

                  categoryDropdown.addEventListener('change', (event) => {
                    const selectedCategory = event.target.value.toLowerCase();

                    categoryRows.forEach((row) => {
                      const category = row.querySelector('.category').textContent.toLowerCase();

                      if (category === selectedCategory || selectedCategory === 'all') {
                        row.style.display = '';
                      } else {
                        row.style.display = 'none';
                      }
                    });
                  });
                });
              </script>
            </head>
            <body>
              <div class="container">
                <h1>Mean Ratings</h1>
                <h2>Users</h2>
                <input type="text" id="search-bar" class="search-bar" placeholder="Search by first name or surname">
                <table>
                  <tr>
                    <th>First Name</th>
                    <th>Surname</th>
                    <th>Mean Rating</th>
                  </tr>
        `;

                            userResults.forEach(function (user) {
                                html += `
            <tr class="user-row">
              <td class="first-name">${user.FirstName}</td>
              <td class="surname">${user.Surname}</td>
              <td>${user.MeanRating}</td>
            </tr>
          `;
                            });

                            html += `
                </table>
                <h2>Categories</h2>
                <select id="category-dropdown">
                <option value="all">All Categories</option>
                <option value="Ιστορία (History)">Ιστορία (History)</option>
                <option value="Μυθιστόρημα (Novel)">Μυθιστόρημα (Novel)</option>
                <option value="Φαντασία (Fantasy)">Φαντασία (Fantasy)</option>
                <option value="Μυστήριο (Mystery)">Μυστήριο (Mystery)</option>
                <option value="Θρίλερ (Thriller)">Θρίλερ (Thriller)</option>
                <option value="Ρομαντικό (Romance)">Ρομαντικό (Romance)</option>
                <option value="Ποίηση (Poetry)">Ποίηση (Poetry)</option>
                <option value="Διηγήματα (Short Stories)">Διηγήματα (Short Stories)</option>
                <option value="Αυτοβελτίωση (Self-Improvement)">Αυτοβελτίωση (Self-Improvement)</option>
                <option value="Θρησκεία (Religion)">Θρησκεία (Religion)</option>
                <option value="Φιλοσοφία (Philosophy)">Φιλοσοφία (Philosophy)</option>
                <option value="Ψυχολογία (Psychology)">Ψυχολογία (Psychology)</option>
                <option value="Παιδικά βιβλία (Childrens Books)">Παιδικά βιβλία (Children's Books)</option>
                <option value="Ταξίδια (Travel)">Ταξίδια (Travel)</option>
                <option value="Τέχνη (Art)">Τέχνη (Art)</option>
                <option value="Αρχιτεκτονική (Architecture)">Αρχιτεκτονική (Architecture)</option>
                <option value="Μαγειρική (Cooking)">Μαγειρική (Cooking)</option>
                <option value="Αθλητισμός (Sports)">Αθλητισμός (Sports)</option>
                <option value="Επιστημονικά (Science)">Επιστημονικά (Science)</option>
                <option value="Οικονομία (Economics)">Οικονομία (Economics)</option>
                <option value="Πολιτική (Politics)">Πολιτική (Politics)</option>
                <option value="Κοινωνιολογία (Sociology)">Κοινωνιολογία (Sociology)</option>
                <option value="Διοίκηση (Management)">Διοίκηση (Management)</option>
                <option value="Γλώσσες (Languages)">Γλώσσες (Languages)</option>
                <option value="Μουσική (Music)">Μουσική (Music)</option>
                <option value="Κινηματογράφος (Cinema)">Κινηματογράφος (Cinema)</option>
                <option value="Διάφορα (Miscellaneous)">Διάφορα (Miscellaneous)</option>
                </select>
                <div> </div>
                <table>
                  <tr>
                    <th>Category</th>
                    <th>Mean Rating</th>
                  </tr>
        `;

                            categoryResults.forEach(function (category) {
                                html += `
            <tr class="category-row">
              <td class="category">${category.Category}</td>
              <td>${category.MeanRating}</td>
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
    });
});

module.exports = router;
