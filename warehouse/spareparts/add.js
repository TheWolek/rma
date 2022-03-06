const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const creds = require('../../db_creds')
const connection = mysql.createConnection(creds)

connection.connect()

// register new category of sparepart
router.post("/new", (req, res) => {
    // recive {"name": string, "category": string, "producer": string}
    // return 400 if any of parameters is missig OR is empty OR does not match regEx
    // return 500 if there was DB error
    // return 200 with {"id": INT}

    // if (!req.body.sn) return res.status(400).json({ "message": "pole sn jest wymagane" })
    if (!req.body.name) return res.status(400).json({ "message": "pole name jest wymagane" })
    if (!req.body.category) return res.status(400).json({ "message": "pole category jest wymagane" })
    if (!req.body.producer) return res.status(400).json({ "message": "pole producer jest wymagane" })

    const regName = /^([A-ż]{1,})([,. ()0-9'"-]){0, }$/
    // const regSN = /^([0-9-]{1,})$/
    const regCatProd = /^([A-ż]{1,})([,. ()0-9'"-]){0, }$/

    if (!regName.test(req.body.name)) return res.status(400).json({ "message": "nieprawidłowy format pola name" })
    // if (!regSN.test(req.body.sn)) return res.status(400).json({ "message": "nieprawidłowy format pola sn" })
    if (!regCatProd.test(req.body.category)) return res.status(400).json({ "message": "nieprawidłowy format pola category" })
    if (!regCatProd.test(req.body.producer)) return res.status(400).json({ "message": "nieprawidłowy format pola producer" })

    let sql = `INSERT INTO spareparts_cat (name, category, producer) VALUES ('${req.body.name}','${req.body.category}','${req.body.producer}')`

    connection.query(sql, function (err, result) {
        if (err) {
            // if (err.code == "ER_DUP_ENTRY") return res.status(400).json({ "message": "część z podanym SN została już zarejestrowana" })
            return res.status(500).json(err)
        }
        res.status(200).json({ "id": result.insertId })
    })
})

module.exports = router