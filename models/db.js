const mysql = require("mysql");
const dbConfig = require("../config/db_config");

const connection = mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("DB connected");
});

module.exports = connection;