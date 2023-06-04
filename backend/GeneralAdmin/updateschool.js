const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.get('/pika/:id', function (req, res) {
  const schoolId = req.params.id;

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    const query = `
      SELECT * FROM SchoolUnit
      WHERE IdSchool = ?
    `;

    connection.query(query, [schoolId], (error, results) => {
      if (error) {
        console.error('Error retrieving school unit:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the school unit' });
      } else {
        if (results.length > 0) {
          const schoolUnit = results[0];
          res.json({ schoolUnit }); 
        } else {
          res.status(404).json({ error: 'School unit not found' });
        }
      }
      connection.release();
    });
  });
});

router.post('/:id', function (req, res) {
  const schoolId = req.params.id;
  // ... Update logic

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    const query = `
      UPDATE SchoolUnit
      SET Name = ?, Adress_street = ?,Adress_number = ?, Adress_city = ?, Email = ?, SchoolPrinciple = ?, SchoolAdmin = ?
      WHERE IdSchool = ?
    `;

    const { Name, Adress_street, Adress_number, Adress_city, Email, SchoolPrinciple, SchoolAdmin } = req.body;

    connection.query(
      query,
      [Name, Adress_street, Adress_number, Adress_city, Email, SchoolPrinciple, SchoolAdmin, schoolId],
      (error, results) => {
        if (error) {
          console.error('Error updating school unit:', error);
          res.status(500).json({ error: 'An error occurred while updating the school unit' });
        } else {
          if (results.affectedRows > 0) {
      res.redirect('/libq/generaladmin/viewschools');
          } else {
            res.status(404).json({ error: 'School unit not found' });
          }
        }
        connection.release();
      }
    );
  });
});

module.exports = router;
