const express = require('express');
const router = express.Router();
const pool = require('../connect');

// ...

router.post('/', function (req, res) {
  const { Name, Adress_street, Adress_number, Adress_city, Email, SchoolPrinciple, SchoolAdmin } = req.body;

  function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
  }

  username1 = generateRandomString(8);
  password1 = generateRandomString(12);

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    const query = `
      INSERT INTO SchoolUnit (Name, Adress_street, Adress_number, Adress_city, Email, SchoolPrinciple, SchoolAdmin)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(query, [Name, Adress_street, Adress_number, Adress_city, Email, SchoolPrinciple, SchoolAdmin], (error, results) => {
      if (error) {
        connection.release();
        console.error('Error creating school unit:', error);
        res.status(500).json({ error: 'An error occurred while creating the school unit' });
        return;
      }

      const query2 = `
        INSERT INTO users (Username, Password, Approved)
        VALUES (?, ?, ?)
      `;

      connection.query(query2, [username1, password1, 1], (error, results) => {
        if (error) {
          connection.release();
          console.error('Error creating school unit:', error);
          res.status(500).json({ error: 'An error occurred while creating the school unit' });
          return;
        }

        const query01 = `
          SELECT Idusers
          FROM users 
          WHERE Username = ?
        `;

        connection.query(query01, [username1], (error, results) => {
          if (error) {
            connection.release();
            console.error('Error creating school unit:', error);
            res.status(500).json({ error: 'An error occurred while creating the school unit' });
            return;
          }

          const IDuser = results[0].Idusers;

          const query11 = `
            SELECT * FROM Schoolunit
            WHERE Name = ?
          `;

          connection.query(query11, [Name], (error, results) => {
            if (error) {
              connection.release();
              console.error('Error creating school unit:', error);
              res.status(500).json({ error: 'An error occurred while creating the school unit' });
              return;
            }

            const IDschool = results[0].IdSchool;

            const query1 = `
              INSERT INTO schooladmin (IdUsers, IdSchool, Name)
              VALUES (?, ?, ?)
            `;

            connection.query(query1, [IDuser, IDschool, SchoolAdmin], (error, results) => {
              connection.release();

              if (error) {
                console.error('Error creating school unit:', error);
                res.status(500).json({ error: 'An error occurred while creating the school unit' });
                return;
              }

              res.redirect('/libq/generaladmin/viewschools');
            });
          });
        });
      });
    });
  });
});

module.exports = router;
