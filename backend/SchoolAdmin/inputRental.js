const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.get('/', function (req, res) {
  res.send(`
    <html>
      <head>
        <title>Rent a book to a User</title>
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

          .input-container {
            margin-bottom: 10px;
          }

          label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
          }

          input[type="text"] {
            width: 100%;
            padding: 8px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
          }

          .button-container {
            text-align: center;
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

          .rent-button {
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
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Rent a book to a User</h1>
          <form method="POST" action="/libq/schooladmin/makerental">
            <div class="input-container">
              <label for="username">Username:</label>
              <input type="text" id="username" name="username" required>
            </div>
            <div class="input-container">
              <label for="title">Book Title:</label>
              <input type="text" id="title" name="title" required>
            </div>
            <div class="button-container">
              <button type="submit" class="rent-button">Make Rental</button>
            </div>
            <a class="back-button" href="/libq/schooladmin">Back to the homepage</a>
          </form>
        </div>
      </body>
    </html>
  `);
});

module.exports = router;
