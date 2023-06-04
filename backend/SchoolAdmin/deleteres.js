const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.post('/', function (req, res) {
  const reservationId = req.body.reservationId;

  const deleteQuery = `DELETE FROM reservation WHERE ReservationId = ?`;

  pool.query(deleteQuery, [reservationId], function (error, results, fields) {
    if (error) {
      res.status(500).json({ error: 'An error occurred' });
    } else {
      res.send(`
        <html>
          <head>
            <meta charset="utf-8">
            <title>Reservation Deleted</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
              }
              
              h1, h2 {
                text-align: center;
                color: #333;
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
              }

              .back-button::before {
                content: '←';
                margin-right: 5px;
              }
            </style>
          </head>
          <body>
            <div class="container">
                <h1>Request Discarded</h1>
                <a href="/libq/schooladmin/approvereservations" class="back-button">Go back</a>
            </div>
          </body>
        </html>
      `);
    }
  });
});

module.exports = router;
