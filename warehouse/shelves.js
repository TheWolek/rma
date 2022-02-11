const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const creds = require('../db_creds')
const connection = mysql.createConnection(creds)

connection.connect()

router.post("/add", (req, res) => {
    let code = req.body.code
    let sql = `INSERT INTO shelves (code) VALUES ("${code}")`

    connection.query(sql, function (err, result) {
        if (err) throw err;
        res.status(200).json({ id: result.insertId, code: code })
    })
})

router.get("/", (req, res) => {
    let sql = `SELECT shelve_id, code FROM shelves`

    connection.query(sql, function (err, rows) {
        if (err) throw err;
        res.status(200).json(rows)
    })
})

module.exports = router