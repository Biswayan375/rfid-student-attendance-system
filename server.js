const express = require('express');
require('dotenv').config();
const port = 5000 || process.env.PORT;
const router = require('./routes/routes.js');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('./views'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Login route (under development)
app.use('/', router);

app.listen(port, console.log(`server is up on http://localhost:${port}`));