const express = require('express');
require('dotenv').config(); // To be able to use the .env variables
const port = 5000 || process.env.PORT; // If the port is not available in the .env file then set it to 5000
const router = require('./routes/routes.js');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const app = express(); // Instantiating express
app.set('view engine', 'ejs'); // Setting up EJS as view engine
app.use(express.static('./views')); // Setting up the static contents folder
app.use(express.json()); // To be able to get JSON data (from client) in the request body
app.use(express.urlencoded({ extended: false })); // To be able to get x-urlencoded data (from client) in the request body
app.use(flash()); // To be able to use flash message
app.use(cookieParser()); // Setting up cookies (required for connect-flash)
// Setting up session options
app.use(session({
    resave: false, // as it is set to false, now the session will not be resaved everytime a request comes even if the session is not modified at all
    saveUninitialized: false, // won't allow saving uninitialized sessions
    secret: process.env.SESSION_KEY, // Secret session key to decode and encode the session securely
    cookie: {
        maxAge: 1000 * 60 * 60 * 2, // 2 hours in milliseconds
        secure: false, // should not be set to true if https is not in use
    }
}));

// All other routes are handled in router
app.use('/', router);

// Spinning up the server
app.listen(port, console.log(`server is up on http://localhost:${port}`));