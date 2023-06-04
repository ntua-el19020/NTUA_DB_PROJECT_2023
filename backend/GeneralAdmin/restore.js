const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

router.get('/', function (req, res) {
  const connectionOptions = {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'libq',
    multipleStatements: true 
  };

  const connection = mysql.createConnection(connectionOptions);

  const backupFilePath = path.join(__dirname, '..', 'backup', 'libq.sql');
  const backupFile = fs.readFileSync(backupFilePath, 'utf8');
  const statements = backupFile.split(';');

  let executedStatements = 0; 

  for (const statement of statements) {
    const sql = statement.trim();

    if (sql && !isDelimiterOrTriggerStatement(sql)) {
      connection.query(sql, (error, results) => {
        if (error) {
          console.error('Error executing SQL statement:', error);
          console.log('Problematic SQL statement:', sql);
        } else {
          console.log('SQL statement executed successfully.');
        }

        executedStatements++;

        if (executedStatements === statements.length) {
          res.send('Backup restored successfully.');
          return; 
        }
      });
    } else {
      executedStatements++;

      if (executedStatements === statements.length) {
        res.send('Backup restored successfully.');
        return; 
      }
    }
  }
});

function isDelimiterOrTriggerStatement(sql) {
  const trimmedSql = sql.trim().toLowerCase();
  return trimmedSql.startsWith('delimiter') || trimmedSql.startsWith('create trigger');
}

module.exports = router;
