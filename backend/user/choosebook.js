const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.post('/', function (req, res) {
  const { ISBN } = req.body;

  // Query to retrieve the latest IdLogged value
  const loggedUserQuery = `
    SELECT IdLogged
    FROM LoggedUser
    ORDER BY IdLogged DESC
    LIMIT 1;
  `;

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error acquiring database connection', err);
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
              <div class="error-message">${err.message}</div>
              <a href="/libq/user/checkbooks1" class="back-button">Go back to the catalogue</a>
            </div>
          </body>
        </html>
      `);
    }

    connection.beginTransaction(function (err) {
      if (err) {
        console.error('Error starting database transaction', err);
        rollbackAndReleaseConnection(connection, res);
        return;
      }

      connection.query(loggedUserQuery, function (err, results) {
        if (err) {
          console.error('Error executing query', err);
          rollbackAndReleaseConnection(connection, res, err.message);
          return;
        }

        const idLogged = results[0].IdLogged;
  const checkQuery = `
  SELECT DISTINCT a.AvailableCopies
  FROM availability AS a
  INNER JOIN (
    SELECT IdSchool
    FROM student
    WHERE IdUsers = (
      ${idLogged}
    )
    UNION
    SELECT IdSchool
    FROM teacher
    WHERE IdUsers = (
      ${idLogged}
    )
  ) AS u
  ON a.IdSchool = u.IdSchool
  WHERE a.ISBN = ?
`;

const insertQuery = `
  INSERT INTO reservation (ReservationDate, Active, ISBN, IdUsers)
  VALUES (CURDATE(), ?, ?, (
    ${idLogged}
  ))
`;
        connection.query(checkQuery, [ISBN, idLogged], function (err, results) {
          console.log(results);
          if (err) {
            console.error('Error executing query', err);
            rollbackAndReleaseConnection(connection, res, err.message);
            return;
          }

          if (results.length > 0) {
            const availableCopies = results[0].AvailableCopies;

            let active = 0;
            if (availableCopies > 0) {
              active = 1;
            }

            connection.query(insertQuery, [active, ISBN, idLogged], function (err) {
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
          } else {
            rollbackAndReleaseConnection(connection, res, 'Book not found');
          }
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
            <a href="/libq/user/checkbooks1" class="back-button">Go back to the catalogue</a>
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
          <a href="/libq/user/checkbooks1" class="back-button">Go back to the catalogue</a>
        </div>
      </body>
    </html>
  `);
}

module.exports = router;
