const express = require('express');
const router = express.Router();
const pool = require('./connect.js');

router.post('/', (req, res) => {
  const { username, password } = req.body;
  if (req.body.signup) {
    return res.redirect('/libq/signup');
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return res.status(500).send('Internal Server Error');
    }

    const query = `SELECT * FROM Users WHERE Username = ?`;
    connection.query(query, [username], (err, results) => {
      connection.release(); // Release the connection back to the pool

      if (err) {
        console.error('Error executing the query:', err);
        return res.status(500).send('Internal Server Error');
      }

      if (results.length === 0) {
        return res.status(400).send('Username does not exist');
      }

      const user = results[0];

      if (user.Password !== password) {
        return res.status(500).send('Wrong password');
      }

      if (!user.Approved) {
        return res.status(500).send('Account not yet approved');
      }

      // Check user type
      const userId = user.IdUsers;
      console.log(userId);
      const emptyLoggedUserQuery = `DELETE FROM LoggedUser`;
      connection.query(emptyLoggedUserQuery, (err) => {
        if (err) {
          connection.release(); // Release the connection back to the pool
          console.error('Error emptying LoggedUser table:', err);
          return res.status(500).send('Internal Server Error');
        }

        // Insert user's ID into LoggedUser table
        const insertLoggedUserQuery = `INSERT INTO LoggedUser (IdLogged) VALUES (?)`;
        connection.query(insertLoggedUserQuery, [userId], (err) => {
          if (err) {
            console.error('Error inserting user ID into LoggedUser table:', err);
            return res.status(500).send('Internal Server Error');
          }})})
        
      const queries = [
        {
          table: 'GeneralAdmin',
          userType: 'generaladmin',
        },
        {
          table: 'SchoolAdmin',
          userType: 'schooladmin',
        },
        {
          table: 'Student',
          userType: 'student',
        },
        {
          table: 'Teacher',
          userType: 'teacher',
        },
      ];

      const userTypeQuery = queries.find(({ table }) => table !== 'GeneralAdmin');

      if (!userTypeQuery) {
        return res.send({ error: 'Unknown user type' });
      }

      const userTypeQueryStr = `SELECT * FROM ${userTypeQuery.table} WHERE IdUsers = ?`;
      connection.query(userTypeQueryStr, [userId], (err, results) => {
        if (err) {
          console.error(`Error executing the query for ${userTypeQuery.table}:`, err);
          return res.status(500).send('Internal Server Error');
        }

        if (results.length > 0) {
          return res.redirect(`/libq/${userTypeQuery.userType}`);
        }

        const generalAdminQueryStr = `SELECT * FROM GeneralAdmin WHERE IdUsers = ?`;
        connection.query(generalAdminQueryStr, [userId], (err, results) => {
          if (err) {
            console.error('Error executing the query for GeneralAdmin:', err);
            return res.status(500).send('Internal Server Error');
          }

          if (results.length > 0) {
            return res.redirect('/libq/generaladmin');
          }

          const schoolAdminQueryStr = `SELECT * FROM SchoolAdmin WHERE IdUsers = ?`;
          connection.query(schoolAdminQueryStr, [userId], (err, results) => {
            if (err) {
              console.error('Error executing the query for SchoolAdmin:', err);
              return res.status(500).send('Internal Server Error');
            }

            if (results.length > 0) {
              return res.redirect('/libq/schooladmin');
            }

            const studentQueryStr = `SELECT * FROM Student WHERE IdUsers = ?`;
            connection.query(studentQueryStr, [userId], (err, results) => {
              if (err) {
                console.error('Error executing the query for Student:', err);
                return res.status(500).send('Internal Server Error');
              }

              if (results.length > 0) {
                return res.redirect('/libq/user');
              }

              const teacherQueryStr = `SELECT * FROM Teacher WHERE IdUsers = ?`;
              connection.query(teacherQueryStr, [userId], (err, results) => {
                if (err) {
                  console.error('Error executing the query for Teacher:', err);
                  return res.status(500).send('Internal Server Error');
                }

                if (results.length > 0) {
                  return res.redirect('/libq/user');
                }

                return res.send({ error: 'Unknown user type' });
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;
