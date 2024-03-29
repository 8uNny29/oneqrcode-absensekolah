// Import required modules
const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();

// Connect to MySQL database
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // replace with your MySQL username
  password: "", // replace with your MySQL password
  database: "oneqrcode"
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected to MySQL database");
});

// Middleware
app.use(sessions({
  secret: "thisismysecrctekey",
  saveUninitialized:true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
  resave: false
}));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '')));

// Serve static files
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Welcome to the homepage!');
});
  
app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/register.html');
});
  
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.get('/qrreader.js', (req, res) => {
  res.sendFile(__dirname + '/js/qrreader.js');
});

app.get('/home', (req, res) => {
  if (req.session.loggedin) {
    res.sendFile(__dirname + '/public/home.html');
  } else {
    res.redirect('/login');
  }
})

app.post('/register', bodyParser.urlencoded({ extended: false }), (req, res) => {
  const { firstname, lastname, username, password } = req.body;
  const sql = 'INSERT INTO accounts (firstname, lastname, username, password) VALUES (?,?,?,?)';

  db.query(sql, [firstname, lastname, username, password], (err, result) => {
    if (err) throw err;
    res.send('Registration successful!');
  });
});
  
app.post('/login', bodyParser.urlencoded({ extended: false }), (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM accounts WHERE username = ? AND password = ?';

  db.query(sql, [username, password], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      req.session.loggedin = true;
      req.session.username = username;
      res.redirect('/dashboard');
    } else {
      res.send('Invalid credentials!');
    }
  });
});

app.get('/dashboard', (req, res) => {
  if (req.session.loggedin) {
//    res.send(`Welcome to the dashboard, ${req.session.username}!`);
    res.redirect('/home');
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res, next) => {
  if (req.session.loggedin) {
    req.session.user = null;
    req.session.save(function (err) {
      if (err) next(err);

      req.session.regenerate(function (err) {
        if (err) next(err);
        res.redirect('/login');
        console.log('BERHASIL');
      });
    });
  } else {
    console.log('GAGAL');
    res.redirect('/login');
  }
});

app.post('/scanned', (req, res, next) => {
  const dataScanned = req.body.decodeText;
  const username = req.session.username;

  if (req.session.loggedin) {
    console.log(`(${username}) berhasil memindai qrcode (${dataScanned})`);
  } else {
    console.log(`${username}) gagal memindai qrcode`);
  }
});

// Start server
const server = http.createServer(app);
server.listen(1511, () => {
  console.log("Server running on http://localhost:1511");
});