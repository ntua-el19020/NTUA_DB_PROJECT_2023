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
        
          const query2 = 'SELECT s.idSchool as idSchool FROM schooladmin s, loggeduser l WHERE s.idusers=l.idlogged';

      connection.query(query2, (error, results) => {
        if (error) {
          console.error('Error retrieving school unit:', error);
          res.status(500).json({ error: 'An error occurred while retrieving the school unit' });
          return;
        }

        const idSchool = results[0].idSchool;


        query000=`SELECT b.* 
        FROM book AS b
        LEFT JOIN availability AS a ON b.ISBN = a.ISBN AND a.Idschool = 1
        WHERE a.ISBN IS NULL order by b.Title`

        
        connection.query(query000, [idSchool], (err, results) => {
            if (err) {
              console.error('Error executing query:', err);
              res.status(500).json({ error: 'An error occurred while executing the query' });
              connection.release();
              return;
            }

            res.json(results);
        

});});});});





// Handle the create book form submission
// router.post('/', function (req, res) {
//   const { ISBN, Title, Publisher, PageNumber, Summary, Picture, Language } = req.body;

//   pool.getConnection(function (err, connection) {
//     if (err) {
//       console.error('Error getting database connection:', err);
//       res.status(500).json({ error: 'An error occurred while getting a database connection' });
//       return;
//     }

//     // const query00 = "select * from book where ISBN=?"
    
//     // connection.query(query, [ISBN, Title, Publisher, PageNumber, Summary, Picture, Language], (error, results) => {
//     //     if (error) {
//     //       console.error('Error creating book:', error);
//     //       res.status(500).json({ error: 'Failed to create book' });
//     //       return;
//     //     }


//     const query = 'INSERT INTO Book (ISBN, Title, Publisher, PageNumber, Summary, Picture, Language) VALUES (?, ?, ?, ?, ?, ?, ?)';

//     connection.query(query, [ISBN, Title, Publisher, PageNumber, Summary, Picture, Language], (error, results) => {
//       if (error) {
//         console.error('Error creating book:', error);
//         res.status(500).json({ error: 'Failed to create book' });
//         return;
//       }

//       // Get the newly created book ID
//       const bookId = results.insertId;

//       const query2 = 'SELECT s.idSchool as idSchool FROM schooladmin s, loggeduser l WHERE s.idusers=l.idlogged';

//       connection.query(query2, (error, results) => {
//         if (error) {
//           console.error('Error retrieving school unit:', error);
//           res.status(500).json({ error: 'An error occurred while retrieving the school unit' });
//           return;
//         }

//         const School = results[0].idSchool; // Assign the retrieved school ID to the School variable

//         const query3 = 'INSERT INTO Availability (Copies, AvailableCopies, IdSchool, ISBN) VALUES (?, ?, ?, ?)';

//         connection.query(query3, [0, 0, School, ISBN], (error, results) => {
//           if (error) {
//             console.error('Error creating availability:', error);
//             res.status(500).json({ error: 'Failed to create availability' });
//             return;
//           }

//           // Redirect the user to /libq/generaladmin/viewschools
//           res.status(200).redirect('/libq/generaladmin/viewbooks1');
//         });
//       });
//     });
//   });
// });

module.exports = router;
