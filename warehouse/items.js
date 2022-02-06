const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const creds = require('../db_creds')
const connection = mysql.createConnection(creds)

connection.connect()

router.post("/", (req, res) => {
    //recive barcode in format "ticket_id/name/category"
    let data = req.body.barcode.split("/")

    let sql = `INSERT INTO items (name, category, ticket_id, shelve) VALUES ("${data[1]}", "${data[2]}", ${data[0]}, 0)`
    connection.query(sql, function (err, result) {
        if (err) throw err;
        res.status(200).json({ id: result.insertId, ticket_id: data[0], shelve: 0 })
    })

})

router.get("/", (req, res) => {

})

router.put("/", (req, res) => {

})


module.exports = router