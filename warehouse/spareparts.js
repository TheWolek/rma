const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const creds = require('../db_creds')
const connection = mysql.createConnection(creds)

connection.connect()

// register new category of sparepart
router.post("/add/new", (req, res) => {
    // recive {"name": string, "category": string, "producer": string}
    // return 400 if any of parameters is missig OR is empty OR does not match regEx
    // return 500 if there was DB error
    // return 200 with {"id": INT}

    // if (!req.body.sn) return res.status(400).json({ "message": "pole sn jest wymagane" })
    if (!req.body.name) return res.status(400).json({ "message": "pole name jest wymagane" })
    if (!req.body.category) return res.status(400).json({ "message": "pole category jest wymagane" })
    if (!req.body.producer) return res.status(400).json({ "message": "pole producer jest wymagane" })

    const regName = /^([A-ż,. ()0-9'"-]{1,})$/
    // const regSN = /^([0-9-]{1,})$/
    const regCatProd = /^([A-ż 0-9'"]{1,})$/

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

//register new order of spareparts
router.post("/orders", (req, res) => {
    // recive {"category_id": INT, "amount": INT, "exp_date": DATE}
    // return 400 if any of parameters is missing OR empty OR does not match regEX
    // return 404 if cannot find part_category_id
    // return 500 if there was DB error
    // return 200 with {"order_id": INT}

    if (!req.body.category_id) return res.status(400).json({ "message": "pole category_id jest wymagane" })
    if (!req.body.amount) return res.status(400).json({ "message": "pole amount jest wymagane" })
    if (!req.body.exp_date) return res.status(400).json({ "message": "pole exp_date jest wymagane" })

    const regCatAmount = /^([1-9]{1,})([0-9]*)$/
    const regDate = /^([1-9]{1})([0-9]{3})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})\.([0-9]{3})Z$/

    if (!regCatAmount.test(req.body.category_id)) return res.status(400).json({ "message": "nieprawidłowy format pola category_id" })
    if (!regCatAmount.test(req.body.amount)) return res.status(400).json({ "message": "nieprawidłowy format pola amount" })
    if (!regDate.test(req.body.exp_date)) return res.status(400).json({ "message": "nieprawidłowy format pola exp_date" })

    let date = req.body.exp_date.substring(0, 10)

    let sql_findCategory = `SELECT part_cat_id FROM spareparts_cat WHERE part_cat_id = ${req.body.category_id}`
    let sql_insertOrder = `INSERT INTO spareparts_orders (part_cat_id, amount, expected_date) VALUES (${req.body.category_id}, ${req.body.amount}, "${date}")`

    let findCategory = new Promise((resolve, reject) => {
        connection.query(sql_findCategory, (err, rows) => {
            if (err) return res.status(500).json(err)
            resolve(rows)
        })
    })

    findCategory.then((data) => {
        if (data.length == 0) return res.status(404).json({ "message": "wpisana kategoria nie istnieje" })

        connection.query(sql_insertOrder, (err, result) => {
            if (err) return res.status(500).json(err)
            res.status(200).json({ order_id: result.insertId })
        })
    })
})

router.put("/shelve", (req, res) => {

})

router.post("/use", (req, res) => {

})

router.get("/", (req, res) => {

})
module.exports = router