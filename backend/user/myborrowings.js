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

    let query1 = 'SELECT idlogged FROM LoggedUser';

    connection.query(query1, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'An error occurred while executing the query' });
        return;
      }

      const idlogged = results[0].idlogged;
      let b=[];
      b.push(idlogged);
      b.push(idlogged);


      let query2 = `
      SELECT DISTINCT A.Title as Title, A.ISBN as ISBN, A.rating as Rating, R.ReviewText as RatingText, R.RatingLikert as RatingLikert
      FROM (
          SELECT BOR.ISBN as ISBN, B.Title as Title, B.rating as rating, bor.Idusers as id
          FROM borrowing BOR
          JOIN book B ON BOR.ISBN = B.ISBN
          WHERE bor.idusers = ?
      ) A
      LEFT JOIN review R ON A.ISBN = R.ISBN AND R.Idusers = ?;
      
      
      
      `;

      connection.query(query2, b, (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({ error: 'An error occurred while executing the query' });
          return;
        }


let htmlTable = `
<!DOCTYPE html>
          <html>
            <head>
              <title>3.1.6 Query</title>
              <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
              }
              
              h1, h2 {
                text-align: center;
                color: #333;
              }
            
              .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
            
              .search-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
              }
            
              .search-container label {
                font-weight: bold;
              }
            
              .search-container input[type="text"] {
                padding: 8px;
                font-size: 14px;
                border: 1px solid #ccc;
                border-radius: 4px;
                width: 200px;
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
              }
              .back-button::before {
                content: '←';
                margin-right: 5px;
              }
            </style>
    </head>
    <body>
      <h1>My Borrowings</h1>
      <div id="results-container">
        <table id="results-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>ISBN</th>
              <th>Rating</th>
              <th>Review Text</th>
              <th>Rating Likert</th>
              <th>Edit</th>
              <th>Delete</th>

            </tr>
          </thead>
          <tbody>
`;


for (const row of results) {
  let textColorClass = row.approval === 1 ? 'approved-text' : 'not-approved-text';
  let ratingText = row.Rating || '<span class="null-value">N/A</span>';
  let reviewText = row.RatingText || '<span class="null-value">N/A</span>';
  let ratingLikertText = row.RatingLikert || '<span class="null-value">N/A</span>';
  htmlTable += `
    <tr>
      <td>${row.Title}</td>
      <td>${row.ISBN}</td>
      <td>${row.Rating}</td>
      <td contenteditable="true" data-field="ReviewText" class="${textColorClass}">${reviewText}</td>
      <td contenteditable="true" data-field="RatingLikert" class="${textColorClass}">${ratingLikertText}</td>
      <td><a href="/libq/user/updatereview/${idlogged}/${row.ISBN}" class="edit-link">Edit Review</a></td>
      <td><a href="#" onclick="deleteReview('${idlogged}', '${row.ISBN}')" class="edit-link">Delete Review</a></td>
    </tr>
  `;
}

htmlTable += `
  <script>
    function deleteReview(userId, isbn) {
      if (confirm('Are you sure you want to delete the review?')) {
        fetch('/libq/user/myborrowings/deletereview/' + userId + '/' + isbn, { method: 'DELETE' })
          .then(response => {
            if (response.ok) {
              // Reload the page after successful deletion
              location.reload();
            } else {
              console.error('Error deleting review:', response.statusText);
              alert('An error occurred while deleting the review. Please try again.');
            }
          })
          .catch(error => {
            console.error('Error deleting review:', error);
            alert('An error occurred while deleting the review. Please try again.');
          });
      }
    }
  </script>
`;

// ...

htmlTable += `
          </tbody>
        </table>
      </div>
    </body>
    <style>
    .not-approved-text {
      color: red;
    }
    .approved-text {
      color: black;
    }
    .null-value {
      color: green;
    }
  </style>
    <h3>Not yet approved reviews are highlighted.</h3>
    <h3><a href="http://localhost:9103/libq/user">Back to the homepage</a></h3>
  </html>
`;


        // Send the HTML response
        res.send(htmlTable);

        connection.release();
      });
    });
  });
});





  router.delete('/deletereview/:userId/:isbn', function (req, res) {
    const userId = req.params.userId;
    const isbn = req.params.isbn;
  
    pool.getConnection(function (err, connection) {
      if (err) {
        console.error('Error getting database connection:', err);
        res.status(500).json({ error: 'An error occurred while getting a database connection' });
        return;
      }
  
      let query = 'DELETE FROM review WHERE Idusers = ? AND ISBN = ?';
  
      connection.query(query, [userId, isbn], (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({ error: 'An error occurred while executing the query' });
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






module.exports = router;
