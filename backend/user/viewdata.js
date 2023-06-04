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

    let query1 = 'SELECT idlogged FROM LoggedUser';

    connection.query(query1, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'An error occurred while executing the query' });
        return;
      }

      const idlogged = results[0].idlogged;

      let queries = [
        'DROP VIEW IF EXISTS persons_per_school_view;',
        `CREATE OR REPLACE VIEW Persons_Per_School_View AS
        SELECT  'Student' AS PersonType, st.IdUsers AS PersonId, st.StudentName AS PersonName, st.StudentEmail AS PersonEmail 
        , st.Adress_street as Adress_street,st.Adress_number as Adress_number, st.Adress_city as Adress_city,st.BirthDate as BirthDate, u.username as  username, u.password as password
        FROM Student st
        JOIN SchoolAdmin sa ON st.IdSchool = sa.IdSchool
        JOIN SchoolUnit s ON sa.IdSchool = s.IdSchool
        join users u on u.idusers=st.idusers
        UNION ALL
        SELECT  'Teacher' AS PersonType, t.IdUsers AS PersonId, t.TeacherName AS PersonName, t.TeacherEmail AS PersonEmail
        , t.Adress_street as Adress_street,t.Adress_number as Adress_number, t.Adress_city as Adress_city,t.BirthDate as BirthDate, u.username as  username, u.password as password
        FROM Teacher t
        JOIN SchoolAdmin sa ON t.IdSchool = sa.IdSchool
        JOIN SchoolUnit s ON sa.IdSchool = s.IdSchool
        join users u on u.idusers=t.idusers;`
      ];

      // Execute each query
      connection.query(queries[0], (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({ error: 'An error occurred while executing the query' });
          return;
        }

        connection.query(queries[1], (err, results) => {
          if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'An error occurred while executing the query' });
            return;
          }

          let query3 = `
          SELECT p.persontype AS persontype, p.PersonId AS PersonId, p.PersonName AS PersonName, p.PersonEmail AS PersonEmail, p.Adress_street AS Adress_street
          , p.Adress_number AS Adress_number, p.Adress_number AS Adress_number, p.Adress_number AS Adress_number, p.Adress_city AS Adress_city, p.BirthDate AS BirthDate
          , p.username AS username, p.password AS password
          FROM persons_per_school_view p, loggeduser l
          WHERE l.IdLogged = p.PersonId;`;

          connection.query(query3, (err, results) => {
            if (err) {
              console.error('Error executing query:', err);
              res.status(500).json({ error: 'An error occurred while executing the query' });
              return;
            }

            let htmlContent = `
            <!DOCTYPE html>
            <html>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                }
      
                h1 {
                  text-align: center;
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
                  margin-bottom: 20px;
                }
      
                .back-button::before {
                  content: '←';
                  margin-right: 5px;
                }
      
                /* CSS for the cards */
                .card {
                  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
                  transition: 0.3s;
                  width: 40%;
                  margin: auto;
                  margin-bottom: 20px;
                }
      
                .card:hover {
                  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
                }
      
                .container {
                  padding: 2px 16px;
                }
      
                .edit-link {
                  display: inline-block;
                  padding: 5px 10px;
                  background-color: #4CAF50;
                  color: white;
                  text-decoration: none;
                  border-radius: 4px;
                  transition: background-color 0.3s;
                }
      
                .edit-link:hover {
                  background-color: #45a049;
                }
      
                .edit-link:active {
                  background-color: #3e8e41;
                }
              </style>
              <body>
                <h1>My Data</h1>
          `;

for (const row of results) {
  htmlContent += `
    <div class="card">
      <div class="container">
        <h2>${row.PersonName}</h2>
        <p>Email: ${row.PersonEmail}</p>
        <p>Street: ${row.Adress_street}</p>
        <p>City: ${row.Adress_city}</p>
        <p>Birth Date: ${row.BirthDate}</p>
        <p>Username: ${row.username}</p>
        <p><a href="/libq/user/changepassword/${idlogged}" class="edit-link">Change Password</a></p>
  `;
  if (row.persontype === 'Teacher') {
    htmlContent += `
      <p><a href="/libq/user/updatedata/${idlogged}" class="edit-link">Edit Data</a></p>
    `;
  }
  htmlContent += `
      </div>
    </div>
    <div>
    <a href="/libq/user">Back to the homepage</a>
    </div>
  `;
}


            htmlContent += `
              </body>
            </html>
            `;

            res.send(htmlContent);

            connection.release();
          });
        });
      });
    });
  });
});

module.exports = router;
