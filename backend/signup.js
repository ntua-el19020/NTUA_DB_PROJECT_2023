const express = require('express');
const router = express.Router();
const pool = require('./connect.js');

router.post('/', (req, res) => {
  const {
    username,
    password,
    userType,
    name,
    addressStreet,
    addressNumber,
    addressCity,
    email,
    birthdate,
    school,
  } = req.body;

  if (req.body.signup) {
    return res.redirect('/libq/signup');
  }
  console.log(req.body);

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return res.status(500).send('Internal Server Error');
    }

    const query = `SELECT * FROM Users WHERE Username = ?`;
    connection.query(query, [username], (err, results) => {
      if (err) {
        connection.release();
        console.error('Error executing the query:', err);
        return res.status(500).send('Internal Server Error');
      }

      if (results.length > 0) {
        connection.release();
        return res.send({ error: 'Username already exists' });
      }

      const user = {
        Username: username,
        Password: password,
        Approved: 0,
      };
      
      const insertUserQuery = `INSERT INTO Users SET ?`;
      connection.query(insertUserQuery, user, (err, result) => {
        if (err) {
          connection.release();
          console.error('Error inserting user data:', err);
          return res.status(500).send('Internal Server Error');
        }

        const userId = result.insertId; // Get the newly inserted user's ID

        if (userType === 'student') {
          const studentData = {
            StudentName: name,
            Adress_street: addressStreet,
            Adress_number: addressNumber,
            Adress_city: addressCity,
            StudentEmail: email,
            BirthDate: birthdate,
            BooksToBorrow: 2,
            BooksToReserve: 2,
            IdUsers: userId,
            IdSchool: school,
          };

          const insertStudentQuery = `INSERT INTO Student SET ?`;
          connection.query(insertStudentQuery, studentData, (err) => {
            connection.release();
            if (err) {
              console.error('Error inserting student data:', err);
              return res.status(500).send('Internal Server Error');
            }

            res.redirect('/libq/user');
          });
        } else if (userType === 'teacher') {
          const teacherData = {
            TeacherName: name,
            Adress_street: addressStreet,
            Adress_number: addressNumber,
            Adress_city: addressCity,
            TeacherEmail: email,
            BirthDate: birthdate,
            BooksToBorrow: 1,
            BooksToReserve: 1,
            IdUsers: userId,
            IdSchool: school,
          };

          const insertTeacherQuery = `INSERT INTO Teacher SET ?`;
          connection.query(insertTeacherQuery, teacherData, (err) => {
            connection.release();
            if (err) {
              console.error('Error inserting teacher data:', err);
              return res.status(500).send('Internal Server Error');
            }

            res.redirect('/libq/user');
          });
        } else {
          connection.release();
          return res.send({ error: 'Unknown user type' });
        }
      });
    });
  });
});

module.exports = router;
