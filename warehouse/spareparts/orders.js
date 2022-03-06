const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const creds = require('../../db_creds')
const connection = mysql.createConnection(creds)

connection.connect()

//register new order of spareparts
router.post("/", (req, res) => {
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
    let sql_insertOrder = `INSERT INTO spareparts_orders (part_cat_id, amount, expected_date, status) VALUES (${req.body.category_id}, ${req.body.amount}, "${date}", 0)`

    let findCategory = new Promise((resolve, reject) => {
        connection.query(sql_findCategory, (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })

    findCategory.catch((err) => {
        return res.status(500).json(err)
    })

    findCategory.then((data) => {
        if (data.length == 0) return res.status(404).json({ "message": "wpisana kategoria nie istnieje" })

        connection.query(sql_insertOrder, (err, result) => {
            if (err) return res.status(500).json(err)
            res.status(200).json({ order_id: result.insertId })
        })
    })
})

//change order status
router.put("/", (req, res) => {
    // recive {"order_id": INT, "status": INT}
    // return 400 if any of parameters is missing OR empty OR does not match regEx
    // return 404 if cannot find specific order
    // return 500 if there was DB error
    // return 200 on success

    if (!req.body.order_id) return res.status(400).json({ "message": "pole order_id jest wymagane" })
    if (!req.body.status && !req.body.status == 0) return res.status(400).json({ "message": "pole status jest wymagane" })

    const reg = /^([0-9]{1,})$/

    if (!reg.test(req.body.order_id)) return res.status(400).json({ "message": "nieprawidłowy format pola order_id" })
    if (!reg.test(req.body.status)) return res.status(400).json({ "message": "nieprawidłowy format pola status" })

    let sql = `UPDATE spareparts_orders SET status = ${req.body.status} WHERE part_order_id = ${req.body.order_id}`

    connection.query(sql, (err, result) => {
        if (err) return res.status(500).json(err)
        res.status(200).send()
    })
})

module.exports = router