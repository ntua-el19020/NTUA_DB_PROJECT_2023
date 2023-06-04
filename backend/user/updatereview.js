const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.get('/pika/:idlogged/:ISBN', function (req, res) {
  const userId = req.params.idlogged;
  const isbn = req.params.ISBN;

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    const query = `
      SELECT * FROM review
      WHERE IdUsers = ? AND ISBN = ?
    `;

    connection.query(query, [userId, isbn], (error, results) => {
      if (error) {
        console.error('Error retrieving review:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the review' });
      } else {
        if (results.length > 0) {
          const review = results[0];
          res.json({ review }); // Send the review data as JSON response
        } else {
          res.status(404).json({ error: 'Review not found' });
        }
      }
      connection.release();
    });
  });
});

router.post('/:idlogged/:ISBN', function (req, res) {
  const userId = req.params.idlogged;
  const isbn = req.params.ISBN;

  const { ReviewText, RatingLikert } = req.body;

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    const checkQuery = `
      SELECT * FROM review
      WHERE IdUsers = ? AND ISBN = ?
    `;

    connection.query(checkQuery, [userId, isbn], (error, results) => {
      if (error) {
        console.error('Error checking review:', error);
        res.status(500).json({ error: 'An error occurred while checking the review' });
      } else {
        if (results.length > 0) {
          const updateQuery = `
            UPDATE review
            SET ReviewText = ?, RatingLikert = ?, Approval = 0
            WHERE IdUsers = ? AND ISBN = ?
          `;

          connection.query(
            updateQuery,
            [ReviewText, RatingLikert, userId, isbn],
            (error, results) => {
              if (error) {
                console.error('Error updating review:', error);
                res.status(500).json({ error: 'An error occurred while updating the review' });
              } else {
                if (results.affectedRows > 0) {
                  const goBackURL = '/libq/user/myborrowings'; 
                  const message = 'Review created successfully';
                
                  const htmlResponse = `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <title>Review Created</title>
                        <style>
                          body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                          }
                
                          h2 {
                            text-align: center;
                            color: #333;
                            margin-top: 20px;
                          }
                
                          .container {
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
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
                        </style>
                      </head>
                      <body>
                        <div class="container">
                          <h2>${message}</h2>
                          <button class="back-button" onclick="location.href='${goBackURL}'">Go Back</button>
                        </div>
                      </body>
                    </html>
                  `;
                
                  res.send(htmlResponse);
                              }              }
              connection.release();
            }
          );
        }
      }
    });
  });
});


module.exports = router;
