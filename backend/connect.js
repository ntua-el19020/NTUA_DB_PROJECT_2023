const mysql_db = require('mysql');
require('dotenv').config();

const connect = mysql_db.createPool({
  connectionLimit: 30,
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: 'libq',
});

// Attempt to establish a connection
connect.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  
  console.log('Connected to the MySQL database');
  
  // Release the connection when finished using it
  connection.release();
});


module.exports = connect;