const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const creds = require('../db_cred')
const connection = mysql.createConnection(creds)

connection.connect()

// tickets
// create
router.post('/zgloszenie/dodaj', (req, res) => {
    let form = req.body
    connection.query(
        `insert into tickets (email, name, phone, device_sn, device_name, device_producer, device_accessories, type, status, issue) 
        values ("${form.email}", "${form.name}", "${form.phone}", "${form.device_sn}", "${form.device_name}", "${form.device_producer}", "${form.device_accessories}", ${form.type}, ${form.status}, "${form.issue}")`,
        function (err, result) {
            if (err) throw err;
            res.status(200).json({ id: result.insertId })
        })
})

// find
router.get('/zgloszenie', (req, res) => {
    let id = req.body.rma.substring(9)
    let mail = req.body.email

    connection.query(
        `select email, name, phone, device_sn, device_name, device_producer, device_accessories, type, status, issue from tickets where
        email = "${mail}" and ticket_id = ${id}`,
        function (err, rows) {
            if (err) throw err;
            res.status(200).json(rows)
        }
    )
})

module.exports = router;