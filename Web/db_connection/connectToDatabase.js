const mysql = require('mysql');
require('dotenv').config();

const conn = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME
});

module.exports = conn