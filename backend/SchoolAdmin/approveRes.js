const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.post('/', function (req, res) {
  const userId = req.body.userId;
  const isbn = req.body.isbn.toString();
  const reservationId = req.body.reservationId;

  const insertQuery = 'INSERT INTO borrowing (BorrowDate, Returned, IdUsers, ISBN) VALUES (CURDATE(), "False", ?, ?)';
  console.log(userId, isbn);
  pool.query(insertQuery, [userId, isbn], function (error, results) {
    if (error) {
      console.error('Error executing insert query:', error);
      return res.send(`
        <html>
          <head>
            <title>Error</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
              }
              
              h1 {
                text-align: center;
                color: #333;
              }

              .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }

              .error-message {
                text-align: center;
                font-weight: bold;
                margin-bottom: 20px;
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
              .back-button::before {
                content: '←';
                margin-right: 5px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Error: Database error</h1>
              <div class="error-message">${error.message}</div>
              <a href="/libq/schooladmin/approvereservations" class="back-button">Go back </a>
            </div>
          </body>
        </html>
      `);
    }

    const deleteQuery = 'DELETE FROM reservation WHERE ReservationId = ?';
    pool.query(deleteQuery, [reservationId], function (error, results) {
      if (error) {
        console.error('Error executing delete query:', error);
        return res.send(`
          <html>
            <head>
              <title>Error</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                }
                
                h1 {
                  text-align: center;
                  color: #333;
                }

                .container {
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
                }

                .error-message {
                  text-align: center;
                  font-weight: bold;
                  margin-bottom: 20px;
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
                .back-button::before {
                  content: '←';
                  margin-right: 5px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Error: Database error</h1>
                <div class="error-message">${error.message}</div>
                <a href="/libq/schooladmin/approvereservations" class="back-button">Go back</a>
              </div>
            </body>
          </html>
        `);
      }

      res.send(`
        <html>
          <head>
            <title>Success</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
              }
              
              h1 {
                text-align: center;
                color: #333;
              }

              .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }

              .success-message {
                text-align: center;
                font-weight: bold;
                margin-bottom: 20px;
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
              .back-button::before {
                content: '←';
                margin-right: 5px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Request approved!</h1>
              <div class="success-message">The request has been successfully approved.</div>
              <a href="/libq/schooladmin/approvereservations" class="back-button">Go back</a>
            </div>
          </body>
        </html>
      `);
    });
  });
});

module.exports = router;
