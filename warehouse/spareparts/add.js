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

// add part to warehouse
router.post("/", (req, res) => {
    // recive {"cat_id": INT, "amount": INT, "shelve": INT}
    // return 400 if any of parameters is missing OR is empty OR does not match regEx
    // return 500 if there was DB error
    // return 200 with {"part_id": INT}

    if (!req.body.cat_id) return res.status(400).json({ "message": "pole cat_id jest wymagane" })
    if (!req.body.amount) return res.status(400).json({ "message": "pole amount jest wymagane" })
    if (!req.body.shelve) return res.status(400).json({ "message": "pole shelve jest wymagane" })

    const reg = /^([1-9]{1,})$/

    if (!reg.test(req.body.cat_id)) return res.status(400).json({ "message": "nieprawidłowy format pola cat_id" })
    if (!reg.test(req.body.amount)) return res.status(400).json({ "message": "nieprawidłowy format pola amount" })
    if (!reg.test(req.body.shelve)) return res.status(400).json({ "message": "nieprawidłowy format pola shelve" })

    let sql = `insert into spareparts (cat_id, amount, shelve) values (${req.body.cat_id}, ${req.body.amount}, ${req.body.shelve})`

    connection.query(sql, (err, result) => {
        if (err) return res.status(500).json(err)
        res.status(200).json({ "part_id": result.insertId })
    })
})

module.exports = router