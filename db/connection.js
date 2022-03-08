const mysql = require("mysql2");


// Connect to database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: 'password',
    database: 'employee_tracker_db',
    multipleStatements: true

  });




 


  module.exports = db;
