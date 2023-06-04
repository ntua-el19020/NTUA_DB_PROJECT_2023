const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.post('/', function (req, res) {
    const username = req.body.username;
    const title = req.body.title;
  
    // Query to retrieve the IdUsers based on the username
    const getUserIdQuery = `SELECT IdUsers FROM Users WHERE Username = ?`;
  
    // Query to retrieve the ISBN based on the book title
    const getIsbnQuery = `SELECT ISBN FROM Book WHERE Title = ?`;
  
    // Query to insert the rental record
    const insertRentalQuery = `INSERT INTO borrowing (BorrowDate, Returned, IdUsers, ISBN) VALUES (CURDATE(), 'False', ?, ?)`;
  
    pool.getConnection(function (err, connection) {
      if (err) {
        console.error('Error acquiring database connection', err);
        return res.send(`<html>...</html>`); // Error response
      }
  
      connection.beginTransaction(function (err) {
        if (err) {
          console.error('Error starting database transaction', err);
          rollbackAndReleaseConnection(connection, res);
          return;
        }
  
        // Query the IdUsers based on the username
        connection.query(getUserIdQuery, [username], function (err, userResult) {
          if (err) {
            console.error('Error executing query', err);
            rollbackAndReleaseConnection(connection, res, err.message);
            return;
          }
  
          if (userResult.length === 0) {
            rollbackAndReleaseConnection(connection, res, 'User not found');
            return;
          }
  
          const userId = userResult[0].IdUsers;
  
          // Query the ISBN based on the book title
          connection.query(getIsbnQuery, [title], function (err, bookResult) {
            if (err) {
              console.error('Error executing query', err);
              rollbackAndReleaseConnection(connection, res, err.message);
              return;
            }
  
            if (bookResult.length === 0) {
              rollbackAndReleaseConnection(connection, res, 'Book not found');
              return;
            }
  
            const isbn = bookResult[0].ISBN;
  
            // Insert the rental record
            connection.query(insertRentalQuery, [userId, isbn], function (err) {
              if (err) {
                console.error('Error executing query', err);
                rollbackAndReleaseConnection(connection, res, err.message);
                return;
              }
  
              connection.commit(function (err) {
                if (err) {
                  console.error('Error committing transaction', err);
                  rollbackAndReleaseConnection(connection, res, err.message);
                  return;
                }
  
                releaseConnectionAndRenderSuccess(connection, res);
              });
            });
          });
        });
      });
    });
  });

  function rollbackAndReleaseConnection(connection, res, errorMessage) {
    connection.rollback(function () {
      connection.release();
      console.error(errorMessage);
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
              <h1> ${errorMessage}</h1>
              <a href="/libq/schooladmin/inputrental" class="back-button">Go back</a>
              </div>
          </body>
        </html>
      `);
    });
  }
  
  function releaseConnectionAndRenderSuccess(connection, res) {
    connection.release();
    return res.send(`
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
            <h1>Reservation created successfully!</h1>
            <div class="success-message">Your reservation has been successfully created.</div>
            <a href="/libq/schooladmin/inputrental" class="back-button">Go back</a>
          </div>
        </body>
      </html>
    `);
  }

  module.exports = router;
