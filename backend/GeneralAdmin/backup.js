const express = require('express');
const router = express.Router();
const mysqldump = require('mysqldump');
const fs = require('fs');
const path = require('path');

router.get('/', function (req, res) {
  const connectionOptions = {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'libq'
  };

  const backupDirectory = path.join(__dirname, '..', 'backup');
  const backupFilePath = path.join(backupDirectory, 'libq.sql');
  const successMessage = 'Backup completed successfully';

  mysqldump({
    connection: connectionOptions,
    dumpToFile: backupFilePath
  })
    .then(() => {
      console.log('Backup completed');
      const successHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Backup Success</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f0f0f0;
                    margin: 0;
                    padding: 20px;
                }

                h1 {
                    color: #333;
                    text-align: center;
                    margin-bottom: 20px;
                }

                a {
                    color: #333;
                    text-decoration: none;
                    padding: 5px 10px;
                    display: inline-block;
                    border-radius: 5px;
                    background-color: #eee;
                    transition: background-color 0.3s ease;
                }

                a:hover {
                    background-color: #ccc;
                }

                .center {
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <h1>${successMessage}</h1>
            <h3 class="center"><a href="http://localhost:9103/libq/generaladmin">Back to the homepage</a></h3>
        </body>
        </html>
      `;
      res.status(200).send(successHTML);
    })
    .catch((error) => {
      console.error('Backup error:', error);
      res.status(500).json({ message: 'Backup failed' });
    });
});

module.exports = router;
