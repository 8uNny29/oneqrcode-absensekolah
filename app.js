// Import required modules
const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const http = require('http');
const path = require('path');
const parseUrl = require('body-parser');
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
app.use(parseUrl.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '')));

// Serve static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});

app.get('/css/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'styles.css'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/public/dashboard.html');
});


app.post("/register", (req, res) => {
    let formData = req.body;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let userName = req.body.userName;
    let password = req.body.password;

    db.query(`SELECT * FROM users_data WHERE username = '${userName}'`, function (err, result) {
        if(err){
            console.log(err);
        };
        if(result.length > 0){
            res.sendFile(__dirname + '/public/failReg.html');
        }else{
            db.query('INSERT INTO users_data (fname, lname, username, password) VALUES (?,?,?,?)', [firstName, lastName, userName, password], function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
                res.sendFile(__dirname + '/public/successReg.html');
            });
        }
    });
});

app.post("/dashboard", (req, res) => {
    let userName = req.body.userName;
    let password = req.body.password;

    db.query(`SELECT * FROM users_data WHERE username = '${userName}' AND password = '${password}'`, function (err, result) {
        if(err){
            console.log(err);
        };
        if(result.length > 0){
            // Initialize session constiables
            req.session.firstname = result[0].firstname;
            req.session.lastname = result[0].lastname;
            req.session.username = result[0].username;

            res.sendFile(__dirname + '/public/dashboard.html');
        }else{
            res.sendFile(__dirname + '/public/failLogin.html');
        }
    });
});

// Start server
const server = http.createServer(app);
server.listen(1511, () => {
    console.log("Server running on port 1511 / http://localhost:1511");
});