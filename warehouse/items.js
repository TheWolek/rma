const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const creds = require('../db_creds')
const connection = mysql.createConnection(creds)

connection.connect()

router.post("/", (req, res) => {
    // recive barcode in format "ticket_id/name/category"
    // return {inserted id, ticket id, shelve id}
    let data = req.body.barcode.split("/")

    let sql = `INSERT INTO items (name, category, ticket_id, shelve) VALUES ("${data[1]}", "${data[2]}", ${data[0]}, 0)`
    connection.query(sql, function (err, result) {
        if (err) throw err;
        res.status(200).json({ id: result.insertId, ticket_id: data[0], shelve: 0 })
    })

})

router.get("/", (req, res) => {
    // recive barcode in format "ticket_id/name/category"
    // if nothing was found return 404 status
    // return first result
    let data = req.body.barcode.split("/")

    let sql = `SELECT item_id, name, shelve, tags, category, ticket_id FROM items WHERE ticket_id = ${data[0]}`
    connection.query(sql, function (err, rows) {
        if (err) throw err;
        if (rows.length == 0) return res.status(404).send()
        res.status(200).json(rows[0])
    })
})

router.put("/", (req, res) => {

})


module.exports = router