const mysql = require('mysql')
const creds = require('./db_cred')
const connection = mysql.createConnection(creds)

connection.connect()

exports.select = (sql) => {
    connection.query("select * from tickets", function (err, rows, fields) {
        if (err) throw err;
        console.log(rows)
        return rows
    })
}
