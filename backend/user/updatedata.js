const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.get('/pika/:idlogged', function (req, res) {
  const userId = req.params.idlogged;

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    const query0 = `DROP VIEW IF EXISTS persons_per_school_view`;

    connection.query(query0, (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({ error: 'An error occurred while executing the query' });
          return;
        }

const query1=
`
CREATE OR REPLACE VIEW Persons_Per_School_View AS
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
join users u on u.idusers=t.idusers`;


connection.query(query1, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'An error occurred while executing the query' });
      return;
    }

let query = `select * from Persons_Per_School_View where PersonId=?`;


    connection.query(query, [userId], (error, results) => {
      if (error) {
        console.error('Error retrieving review:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the review' });
      } else {
        if (results.length > 0) {
          const Person = results[0];
          res.json({ Person }); 
        } else {
          res.status(404).json({ error: 'Review not found' });
        }
      }
      connection.release();
    });
  });
});
  });});

router.post('/:idlogged', function (req, res) {
  const userId = req.params.idlogged;

  const { PersonName, PersonEmail,Adress_street,Adress_number,Adress_city,BirthDate} = req.body;

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    const checkQuery = `select * from Persons_Per_School_View where PersonId=?`;

    connection.query(checkQuery, [userId], (error, results) => {
      if (error) {
        console.error('Error checking review:', error);
        res.status(500).json({ error: 'An error occurred while checking the review' });
      } else {
        if (results.length > 0) {
          const updateQuery = `
          UPDATE teacher
          SET TeacherName = ?, TeacherEmail = ?, Adress_street = ?,
          Adress_number = ?, Adress_city = ?, BirthDate = ?
          WHERE IdUsers = ?
        `;
        

          connection.query(
            updateQuery,
            [PersonName, PersonEmail,Adress_street,Adress_number,Adress_city,BirthDate, userId],
            (error, results) => {
              if (error) {
                console.error('Error updating review:', error);
                res.status(500).json({ error: 'An error occurred while updating the review' });
              } else {
                if (results.affectedRows > 0) {
                  const goBackURL = '/libq/user/viewdata'; 
                  const message = 'User data updated successfully.';

                  const htmlResponse = `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>Review Updated</title>
                      </head>
                      <body>
                        <h1>${message}</h1>
                        <button onclick="location.href='${goBackURL}'">Go Back</button>
                      </body>
                    </html>
                  `;

                  res.send(htmlResponse);
                } else {
                  res.status(404).json({ error: 'Review not found' });
                }
              }
              connection.release();
            }
          );
        } 
      }
    });
  });
});


module.exports = router;
