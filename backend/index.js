const express = require('express');
const app = express();
const PORT = 9103;
const baseurl = '/libq';
const path = require('path');
const mysql = require('mysql');


const { exec } = require('child_process');
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'libq'
});

// Connect to the MySQL server
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL server');
});

// Middleware to parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Serve the login page
app.get('/libq/login', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/libq/signup', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/signup.html'));
});

app.get('/libq/user/checkbooks1', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/checkbooks.html'));
});

app.get('/libq/schooladmin/viewbooks1', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/viewbooks.html'));
});

app.get('/libq/schooladmin/meanratings1', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/meanratings.html'));
});

app.get('/libq/generaladmin', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/GeneralAdmin.html'));
});

app.get('/libq/generaladmin/borrowings1', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/Borrowrings.html'));
});


app.get('/libq/generaladmin/givenbookcategory1', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/givenbookcategory.html'));
});

app.get('/libq/generaladmin/changepassword1', (req, res) => {
  res.sendFile(path.join(__dirname, './GeneralAdmin/changepassword.html'));
});

app.get('/libq/schooladmin/changepassword1', (req, res) => {
  res.sendFile(path.join(__dirname, './SchoolAdmin/changepassword.html'));
});




app.get('/libq/generaladmin/busywriters1', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/busywriters.html'));
});


app.get('/libq/generaladmin/createschool', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/createschool.html'));
});

app.get('/libq/user', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/user.html'));
});

const inputRental =  require('./SchoolAdmin/inputRental.js');
app.use('/libq/schooladmin/inputrental', inputRental);

const makeRental =  require('./SchoolAdmin/makeRental.js');
app.use('/libq/schooladmin/makerental', makeRental);


app.get('/libq/generaladmin/updateschool/:id', function (req, res) {
  const schoolId = req.params.id;
  res.sendFile(path.join(__dirname, '../frontend/updateschool.html'));
});

app.get('/libq/schooladmin', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/SchoolAdmin.html'));
});

app.get('/libq/schooladmin/addbook1/:ISBN', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/addbook.html'));
});



app.get('/libq/createbook/create', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/createbook2.html'));
});


// Serve the login page


const login = require('./login');
app.use('/libq/login', login);

const addbook = require('./SchoolAdmin/addbook.js');
app.use('/libq/addbook', addbook);

const meanrating = require('./SchoolAdmin/meanratings.js');
app.use('/libq/schooladmin/meanratings', meanrating);

const chgpaswd = require('./GeneralAdmin/changepassword.js');
app.use('/libq/generaladmin/changepassword', chgpaswd);

const chgpaswd1 = require('./SchoolAdmin/changepassword.js');
app.use('/libq/SchoolAdmin/changepassword', chgpaswd1);

const signup = require('./signup');
app.use('/libq/signup', signup);

const backupRouter = require('./GeneralAdmin/backup.js');
app.use('/libq/backup', backupRouter);

const viewSchools = require('./GeneralAdmin/viewschools.js');
app.use('/libq/generaladmin/viewschools', viewSchools);


const createSchool = require('./GeneralAdmin/createschool.js');
app.use('/libq/generaladmin/createdschool', createSchool);

const schools = require('./schools.js'); 
app.use('/libq/schools', schools);

const RestoreRouter = require('./GeneralAdmin/restore.js');
app.use('/libq/restore', RestoreRouter);

const updateSchool = require('./GeneralAdmin/updateschool.js');
app.use('/libq/generaladmin/updateschool', updateSchool);


const Borrowrings = require('./GeneralAdmin/borrowings.js');
app.use('/libq/generaladmin/borrowings', Borrowrings);

const givenbookcategory = require('./GeneralAdmin/givenbookcategory.js');
app.use('/libq/generaladmin/givenbookcategory', givenbookcategory);

const unluckyWriters = require('./GeneralAdmin/unluckyWriters.js');
app.use('/libq/generaladmin/unluckywriters', unluckyWriters);

const youngteachers = require('./GeneralAdmin/youngteachers.js');
app.use('/libq/generaladmin/youngteachers', youngteachers);

const top3categories = require('./GeneralAdmin/top3categories.js');
app.use('/libq/generaladmin/top3categories', top3categories);

const busyWriters = require('./GeneralAdmin/busywriters.js');
app.use('/libq/generaladmin/busywriters', busyWriters);

const miki = require('./GeneralAdmin/borrowingsperyear.js');
app.use('/libq/generaladmin/borrowingsperyear', miki);



const chooseBook =  require('./user/choosebook.js');
app.use('/libq/user/choosebook', chooseBook);


const SaApplication= require('./GeneralAdmin/SaApplications.js');
app.use('/libq/generaladmin/SaApplications', SaApplication);

const lateBorrowings = require('./SchoolAdmin/lateBorrowings.js');
app.use('/libq/schooladmin/lateborrowings', lateBorrowings);

const apprreview = require('./SchoolAdmin/approvereviews.js');
app.use('/libq/schooladmin/approvereview', apprreview);

const reviewAverages = require('./SchoolAdmin/ReviewAverages.js');
app.use('/libq/schooladmin/reviewaverages', reviewAverages);


const submitReturns = require('./SchoolAdmin/submitReturns.js');
app.use('/libq/schooladmin/submitreturns', submitReturns);
const approveReservations = require('./SchoolAdmin/approveReservations.js');
app.use('/libq/schooladmin/approvereservations', approveReservations);

const confirmReturn = require('./SchoolAdmin/confirmReturn.js');
app.use('/libq/schooladmin/confirmreturn', confirmReturn);

app.get('/libq/user/changepassword/:idlogged/', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/changepassword.html'));
});

app.get('/libq/user/updatedata/:idlogged/', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/updatedata.html'));
});

const checkbooks = require('./user/checkbooks.js');
app.use('/libq/user/checkbooks', checkbooks);

const viewbooks = require('./SchoolAdmin/viewbooks.js');
app.use('/libq/schooladmin/viewbooks', viewbooks);

const myBorrowings = require('./user/myborrowings.js');
app.use('/libq/user/myborrowings', myBorrowings);


const updatereview = require('./user/updatereview.js');
app.use('/libq/user/updatereview', updatereview);

app.get('/libq/user/updatereview/:idlogged/:ISBN', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/updatereview.html'));
});

const edit = require('./SchoolAdmin/editbook.js');
app.use('/libq/schooladmin/editbook', edit);

const approveRes =  require('./SchoolAdmin/approveRes.js');
app.use('/libq/schooladmin/approveres', approveRes);

const deleteres =  require('./SchoolAdmin/deleteres.js');
app.use('/libq/schooladmin/deleteres', deleteres);

app.get('/libq/schooladmin/editbook/:ISBN', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/editbook.html'));
});

app.get('/libq/schooladmin/createbook1', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/createbook.html'));
});


const createbook = require('./SchoolAdmin/createbook.js');
app.use('/libq/createbook',createbook);

const create2book = require('./SchoolAdmin/createbook2.js');
app.use('/libq/createbook2',create2book);




const password = require('./user/changepassword.js');
app.use('/libq/user/changepassword',password);

const updatedata = require('./user/updatedata.js');
app.use('/libq/user/updatedata',updatedata);


const viewdata = require('./user/viewdata.js');
app.use('/libq/user/viewdata', viewdata);

app.get('/libq/schooladmin/deleteuser1', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/deleteuser.html'));
});

// Route to handle the user deletion
app.post('/delete-user', (req, res) => {
  const username = req.body.username;

  const sql = `DELETE FROM users WHERE username = ?`;
  connection.query(sql, [username], (err, result) => {
      if (err) {
          console.error('Error deleting user:', err);
          res.status(500).send('Error deleting user');
      } else {
          console.log(`User '${username}' deleted`);
          res.send(`User '${username}' deleted`);
      }
  });
});


app.get('/libq/schooladmin/deactivateuser1', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/deactivateuser.html'));
});

// Route to handle the user deletion
app.post('/deactivate', (req, res) => {
  const username = req.body.username;

  const sql = `UPDATE USERS SET APPROVED = 0 WHERE username=?;`;
  connection.query(sql, [username], (err, result) => {
      if (err) {
          console.error('Error deleting user:', err);
          res.status(500).send('Error deleting user');
      } else {
          console.log(`User '${username}' deleted`);
          res.send(`User '${username}' deleted`);
      }
  });
});



app.listen(PORT, () => {
  console.log(`App listening at: http://localhost:${PORT}${baseurl}`);
});
