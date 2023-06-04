const express = require('express');
const router = express.Router();
const pool = require('../connect');

router.get('/', function (req, res) {
  const { Category, Title, Publisher, Copies } = req.query;

  let conditions = [];
  let values = [];

  if (Title) {
    conditions.push('Title = ?');
    values.push(Title);
  }

  if (Category) {
    conditions.push('Category = ?');
    values.push(Category);
  }

  if (Publisher) {
    conditions.push('Publisher = ?');
    values.push(Publisher);
  }

  if (Copies) {
    conditions.push('Copies = ?');
    values.push(Copies);
  }

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'An error occurred while getting a database connection' });
      return;
    }

    let query1 = `
      SELECT IdSchool
      FROM schooladmin
      JOIN LoggedUSer ON schooladmin.Idusers = LoggedUSer.IdLogged;
    `;

    connection.query(query1, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'An error occurred while executing the query' });
        connection.release();
        return;
      }

      const idSchool = results[0].IdSchool;

      let query00 = 'DROP VIEW IF EXISTS book_view';

      connection.query(query00, (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({ error: 'An error occurred while executing the query' });
          connection.release();
          return;
        }

        let query01 = `
          CREATE OR REPLACE VIEW book_view AS
          SELECT
            book.*,
            book_categories.Category
          FROM
            book
            JOIN book_categories ON book.ISBN = book_categories.ISBN;
        `;

        connection.query(query01, (err, results) => {
          if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'An error occurred while executing the query' });
            connection.release();
            return;
          }



          let query000001 = `
          CREATE or replace VIEW book_categories_view AS
          SELECT
            b.ISBN,
            b.Title,
            GROUP_CONCAT(DISTINCT bc.Category) AS Categories
          FROM
            book b
          JOIN book_categories bc ON b.ISBN = bc.ISBN
          GROUP BY b.ISBN, b.Title;
          
        `;

        connection.query(query000001, (err, results) => {
          if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'An error occurred while executing the query' });
            connection.release();
            return;
          }



          let query10 = 'DROP VIEW IF EXISTS book_combined_view';

          connection.query(query10, (err, results) => {
            if (err) {
              console.error('Error executing query:', err);
              res.status(500).json({ error: 'An error occurred while executing the query' });
              connection.release();
              return;
            }

            let query11 = `
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
                JOIN book_categories_view ON book_view.ISBN = book_categories_view.ISBN
            `;

            connection.query(query11, (err, results) => {
              if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'An error occurred while executing the query' });
                connection.release();
                return;
              }

              let query = `
                SELECT DISTINCT
                  ISBN,
                  Title,
                  Publisher,
                  PageNumber,
                  Summary,
                  Picture,
                  Language,
                  Rating,
                  Copies,
                  AvailableCopies,
                  Categories
                FROM
                  book_combined_view
                WHERE
                  IdSchool = ?
              `;
                
              if (conditions.length > 0) {
                const whereClause = conditions.join(' AND ');
                query += ' AND ' + whereClause;
              }
              
              query += ' ORDER BY Title, Publisher';

              connection.query(query, [idSchool, ...values], (err, results) => {
                if (err) {
                  console.error('Error executing query:', err);
                  res.status(500).json({ error: 'An error occurred while executing the query' });
                  connection.release();
                  return;
                }

                res.json(results);
                connection.release();
              });
            });
          });
        });
      });
    });
  });
});

router.delete('/deletebook/:ISBN', function (req, res) {
  const ISBN = req.params.ISBN;

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
        connection.release();
        return;
      }

      const School = results[0].idSchool; // Assign the retrieved school ID to the School variable

      let query = 'DELETE FROM Availability WHERE ISBN = ? and idschool = ?';

      connection.query(query, [ISBN, School], (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({ error: 'An error occurred while executing the query' });
          connection.release();
          return;
        }

        if (results.affectedRows > 0) {
          res.sendStatus(200); 
        } else {
          res.sendStatus(404); 
        }

        connection.release();
      });
    });
  });
});
});
module.exports = router;
