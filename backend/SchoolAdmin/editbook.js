const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.get('/pika/:ISBN', function (req, res) {
  let ISBN = req.params.ISBN;

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    let query2 = 'SELECT s.idSchool as idSchool FROM schooladmin s, loggeduser l WHERE s.idusers=l.idlogged';

    connection.query(query2, (error, results) => {
      if (error) {
        console.error('Error retrieving school unit:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the school unit' });
        return;
      }

      const School = results[0].idSchool; 

      const dropBookViewQuery = 'DROP VIEW IF EXISTS book_view;';
      const createBookViewQuery = `
        CREATE VIEW book_view AS
        SELECT
          book.*,
          book_categories.Category
        FROM
          book
          JOIN book_categories ON book.ISBN = book_categories.ISBN;
      `;

      const dropBookCombinedViewQuery = 'DROP VIEW IF EXISTS book_combined_view;';
      const createBookCombinedViewQuery = `
        CREATE VIEW book_combined_view AS
        SELECT
          book_view.*,
          availability.Copies,
          availability.AvailableCopies,
          availability.IdSchool,
          book_categories_view.Categories
        FROM
          book_view
          JOIN availability ON book_view.ISBN = availability.ISBN
          JOIN book_categories_view ON book_view.ISBN = book_categories_view.ISBN;
      `;

      const getBookQuery = `
        SELECT DISTINCT
          ISBN,
          Title,
          Publisher,
          PageNumber,
          Summary,
          Picture,
          Language,
          Copies,
          Categories
        FROM
          book_combined_view
        WHERE
          IdSchool = ? and ISBN = ?;
      `;

      connection.query(dropBookViewQuery, (error) => {
        if (error) {
          console.error('Error dropping book view:', error);
          res.status(500).json({ error: 'An error occurred while dropping the book view' });
          return;
        }

        connection.query(createBookViewQuery, (error) => {
          if (error) {
            console.error('Error creating book view:', error);
            res.status(500).json({ error: 'An error occurred while creating the book view' });
            return;
          }

          connection.query(dropBookCombinedViewQuery, (error) => {
            if (error) {
              console.error('Error dropping book combined view:', error);
              res.status(500).json({ error: 'An error occurred while dropping the book combined view' });
              return;
            }

            connection.query(createBookCombinedViewQuery, (error) => {
              if (error) {
                console.error('Error creating book combined view:', error);
                res.status(500).json({ error: 'An error occurred while creating the book combined view' });
                return;
              }

              connection.query(getBookQuery, [School, ISBN], (error, results) => {
                connection.release();

                if (error) {
                  console.error('Error retrieving school unit:', error);
                  res.status(500).json({ error: 'An error occurred while retrieving the school unit' });
                  return;
                }

                if (results.length > 0) {
                  const Book = results[0];
                  res.json({ Book }); 
                } else {
                  res.status(404).json({ error: 'School unit not found' });
                }
              });
            });
          });
        });
      });
    });
  });
});

router.post('/:ISBN', function (req, res) {
    
    let ISBN = req.params.ISBN;

    const {  Title, Publisher, PageNumber, Summary, Picture, Language, Copies, Categories } = req.body;
  
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
          UPDATE Book
          SET Title = ?, Publisher = ?, PageNumber = ?, Summary = ?, Picture = ?, Language = ?
          WHERE  ISBN = ?;
        `;
  
        const updateAvailabilityQuery = `
          UPDATE Availability
          SET Copies = ?
          WHERE IdSchool = ? and ISBN = ?;
        `;
  
        const updateBookCategoriesQuery = `
          UPDATE book_categories
          SET Category = ?
          WHERE ISBN = ?;
        `;
  
        connection.query(
          updateBookQuery,
          [Title, Publisher, PageNumber, Summary, Picture, Language,  ISBN],
          (error, bookUpdateResults) => {
            if (error) {
              console.error('Error updating book:', error);
              res.status(500).json({ error: 'An error occurred while updating the book' });
              return;
            }
  
            connection.query(
              updateAvailabilityQuery,
              [Copies, School, ISBN],
              (error, availabilityUpdateResults) => {
                if (error) {
                  console.error('Error updating availability:', error);
                  res.status(500).json({ error: 'An error occurred while updating the availability' });
                  return;
                }
  
                connection.query(
                  updateBookCategoriesQuery,
                  [Categories, ISBN],
                  (error, bookCategoriesUpdateResults) => {
                    connection.release();
  
                    if (error) {
                      console.error('Error updating book categories:', error);
                      res.status(500).json({ error: 'An error occurred while updating the book categories' });
                      return;
                    }
  
                    if (
                      bookUpdateResults.affectedRows > 0 &&
                      availabilityUpdateResults.affectedRows > 0 &&
                      bookCategoriesUpdateResults.affectedRows > 0
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
    });
  });

  
  module.exports = router;
  