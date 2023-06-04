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

    const query = `
      SELECT * FROM users
      WHERE IdUsers = ?
    `;

    connection.query(query, [userId], (error, results) => {
      if (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the users' });
      } else {
        if (results.length > 0) {
          const users = results[0];
          res.json({ users }); 
        } else {
          res.status(404).json({ error: 'users not found' });
        }
      }
      connection.release();
    });
  });
});

router.post('/:idlogged', function (req, res) {
    const userId = req.params.idlogged;
    const { Password } = req.body;
  
    pool.getConnection(function (err, connection) {
      if (err) {
        console.error('Error getting database connection:', err);
        res.status(500).json({ error: 'An error occurred while getting a database connection' });
        return;
      }
  
      const checkQuery = `
        SELECT * FROM users
        WHERE IdUsers = ?
      `;
  
      connection.query(checkQuery, [userId], (error, results) => {
        if (error) {
          console.error('Error checking users:', error);
          res.status(500).json({ error: 'An error occurred while checking the users' });
        } else {
          if (results.length > 0) {
            const updateQuery = `
              UPDATE users
              SET Password = ?
              WHERE IdUsers = ?
            `;
            
            const IdUsers = results[0].IdUsers; 

          connection.query(
            updateQuery,
            [Password,IdUsers],
            (error, results) => {
              if (error) {
                console.error('Error updating users:', error);
                res.status(500).json({ error: 'An error occurred while updating the users' });
              } else {
                if (results.affectedRows > 0) {
                  const goBackURL = '/libq/user/viewdata'; 
                  const message = 'Password updated successfully';

                  const htmlResponse = `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>users Updated</title>
                      </head>
                      <body>
                        <h1>${message}</h1>
                        <button onclick="location.href='${goBackURL}'">Go Back</button>
                      </body>
                    </html>
                  `;

                  res.send(htmlResponse);
                } else {
                  res.status(404).json({ error: 'users not found' });
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
