const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.get('/', function (req, res) {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }



    const query = `
    CREATE OR REPLACE VIEW schooladminsapplications AS
    select
      sa.Name AS name
    from
      (
      schooladmin sa
      join users u on(sa.IdUsers = u.IdUsers)
      )
    where
      u.Approved = 0;
    `;

    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'An error occurred while executing the query' });
        return;
      }



    const query = 'SELECT DISTINCT * FROM SchoolAdminsApplications';

    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'An error occurred while executing the query' });
        return;
      }

      let tableHtml = `
        <html>
        <head>
          <title>School Admin Applications</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              padding: 20px;
            }
            
            h1 {
              text-align: center;
              color: #333;
              margin-bottom: 20px;
            }

            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 20px;
            }

            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }

            th {
              background-color: #808285;
              color: #fff;
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

            .action-buttons {
              display: flex;
              gap: 10px;
            }

            .delete-button {
              background-color: #f44336;
            }

          </style>
        </head>
        <body>
          <h1>School Admin Applications</h1>
      `;

      tableHtml += `
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
      `;

      results.forEach(admin => {
        tableHtml += `
          <tr>
            <td>${admin.name}</td>
            <td class="action-buttons">
              <form action="/libq/generaladmin/SaApplications/approve" method="POST">
                <input type="hidden" name="adminId" value="${admin.name}">
                <button type="submit">Approve</button>
              </form>
              <form action="/libq/generaladmin/SaApplications/delete" method="POST">
                <input type="hidden" name="adminId" value="${admin.name}">
                <button class="delete-button" type="submit">Delete</button>
              </form>
            </td>
          </tr>
        `;
      });

      tableHtml += `
          </tbody>
        </table>
      `;

      tableHtml += `
        <a class="back-button" href="/libq/generaladmin">Back to the homepage</a>
      `;

      tableHtml += `
        </body>
        </html>
      `;

      // Send the generated HTML table as the response
      res.send(tableHtml);

      connection.release();
    });
  });
});

router.post('/approve', (req, res) => {
  const adminname = req.body.adminId;

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    const updateQuery = 'UPDATE users SET Approved = 1 WHERE IdUsers = (SELECT IdUsers FROM schooladmin WHERE name = ?)';

    connection.query(updateQuery, [adminname], (err, results) => {
      if (err) throw err;
      console.log(`Admin with Name ${adminname} approved`);

      connection.release();

      res.redirect('/libq/generaladmin/SaApplications');
    });
  });
});

router.post('/delete', (req, res) => {
  const adminname = req.body.adminId;

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    const deleteQuery = 'DELETE FROM schooladmin WHERE name = ?';

    connection.query(deleteQuery, [adminname], (err, results) => {
      if (err) throw err;
      console.log(`Admin with Name ${adminname} deleted`);

      connection.release();

      res.redirect('/libq/generaladmin/SaApplications');
    });
  });
});
});

module.exports = router;
