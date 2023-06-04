const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.post('/', function (req, res) {
  const { ISBN, Title, Publisher, PageNumber, Summary, Picture, Language, Copies, Category } = req.body;

  if (!Copies) {
    res.status(400).json({ error: 'Copies field is required' });
    return;
  }

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    const query = 'INSERT INTO Book (ISBN, Title, Publisher, PageNumber, Summary, Picture, Language,Rating) VALUES (?, ?, ?, ?, ?, ?, ?,?)';

    connection.query(query, [ISBN, Title, Publisher, PageNumber, Summary, Picture, Language,0], (error, results) => {
      if (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ error: 'Failed to create book' });
        return;
      }

      const query0000 = 'INSERT INTO book_categories (ISBN, Category) VALUES (?, ?)';

      connection.query(query0000, [ISBN, Category], (error, results) => {
        if (error) {
          console.error('Error creating book:', error);
          res.status(500).json({ error: 'Failed to create book' });
          return;
        }



      const query2 = 'SELECT s.idSchool as idSchool FROM schooladmin s, loggeduser l WHERE s.idusers=l.idlogged';

      connection.query(query2, (error, results) => {
        if (error) {
          console.error('Error retrieving school unit:', error);
          res.status(500).json({ error: 'An error occurred while retrieving the school unit' });
          return;
        }

        const School = results[0].idSchool; 

        const query3 = 'INSERT INTO Availability (Copies, AvailableCopies, IdSchool, ISBN) VALUES (?, ?, ?, ?)';

        connection.query(query3, [Copies, Copies, School, ISBN], (error, results) => {
          if (error) {
            console.error('Error creating availability:', error);
            res.status(500).json({ error: 'Failed to create availability' });
            return;
          }

          res.status(200).redirect('/libq/schooladmin/viewbooks1');
        });
      });
    });
  });
});
});

module.exports = router;
