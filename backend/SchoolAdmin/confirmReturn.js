const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.post('/', function (req, res) {
  const borrowingId = req.body.borrowingId;
  const updateQuery = `UPDATE borrowing SET Returned = 'True' WHERE BorrowingId = ?`;

  pool.query(updateQuery, [borrowingId], (error, results) => {
    if (error) {
      console.error('Error updating the return status:', error);
      res.status(500).send('Internal Server Error');
      return;
    }

    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Return Confirmed</title>
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
            <h2>Return Confirmed</h2>
            <a href="/libq/schooladmin/submitreturns" class="back-button" style="display: block; text-align: center;">Back</a>
            </div>
        </body>
      </html>
    `;

    res.send(html);
  });
});

module.exports = router;
