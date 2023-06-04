const express = require('express');
const router = express.Router();
const pool = require('../connect');


  
   router.post('/:ISBN', function (req, res) {

      
       let ISBN = req.params.ISBN;
  
       const { Copies } = req.body;
    
       pool.getConnection(function (err, connection) {
         if (err) {
           console.error('Error getting database connection:', err);
           res.status(500).json({ error: 'An error occurred while getting a database connection' });
           return;
         }
    
         let query = 'SELECT s.idSchool as idSchool FROM schooladmin s, loggeduser l WHERE s.idusers=l.idlogged';
    
         connection.query(query, (error, results) => {
           if (error) {
             console.error('Error retrieving school unit:', error);
             res.status(500).json({ error: 'An error occurred while retrieving the school unit' });
             return;
           }
    
           const School = results[0].idSchool; 
    
           const updateBookQuery = `
           INSERT INTO Availability 
           (Copies, AvailableCopies, IdSchool, ISBN)
           VALUES (?, ?, ?, ?)
         `;
             
          connection.query(
            updateBookQuery,
            [Copies, Copies, School, ISBN],
            (error, bookUpdateResults) => {
              if (error) {
                console.error('Error updating book:', error);
                res.status(500).json({ error: 'An error occurred while updating the book' });
                return;
              }
                     
                      if (
                        bookUpdateResults.affectedRows > 0
                      ) {
                        res.redirect('/libq/schooladmin/viewbooks1');
                      } else {
                        res.status(404).json({ error: 'Book not found' });
                      }
                    }
                  );
                }
              );
            }
          );
        });
  
module.exports = router;
