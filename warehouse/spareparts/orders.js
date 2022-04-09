const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const creds = require('../../db_creds')
const connection = mysql.createConnection(creds)

connection.connect()

//register new order of spareparts
router.post("/", (req, res) => {
    // recive {"supplier_id": INT, "exp_date": DATE}
    // return 400 if any of parameters is missing OR empty OR does not match regEX
    // return 404 if cannot find supplied_id
    // return 500 if there was DB error
    // return 200 with {"order_id": INT}

    // if (!req.body.category_id) return res.status(400).json({ "message": "pole category_id jest wymagane" })
    // if (!req.body.amount) return res.status(400).json({ "message": "pole amount jest wymagane" })
    if (!req.body.exp_date) return res.status(400).json({ "message": "pole exp_date jest wymagane" })
    if (!req.body.supplier_id) return res.status(400).json({ "message": "pole supplier_id jest wymagane" })

    const regInt = /^([1-9]{1,})([0-9]*)$/
    const regDate = /^([1-9]{1})([0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([0-9]{2}):([0-9]{2}):([0-9]{2})\.([0-9]{3})Z$/

    // if (!regCatAmount.test(req.body.category_id)) return res.status(400).json({ "message": "nieprawidłowy format pola category_id" })
    // if (!regCatAmount.test(req.body.amount)) return res.status(400).json({ "message": "nieprawidłowy format pola amount" })
    if (!regDate.test(req.body.exp_date)) return res.status(400).json({ "message": "nieprawidłowy format pola exp_date" })
    if (!regInt.test(req.body.supplier_id)) return res.status(400).json({ "message": "nieprawidłowy format pola supplier_id" })

    let date = req.body.exp_date.substring(0, 10)

    let sql_findSupplier = `SELECT name FROM suppliers WHERE id = ${req.body.supplier_id}`
    let sql_insertOrder = `INSERT INTO spareparts_orders (expected_date, supplier_id, status) VALUES ("${date}", ${req.body.supplier_id},0)`

    let findSupplier = new Promise((resolve, reject) => {
        connection.query(sql_findSupplier, (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })

    findSupplier.catch((err) => {
        return res.status(500).json(err)
    })

    findSupplier.then((data) => {
        if (data.length == 0) return res.status(404).json({ "message": "wpisany dostawca nie istnieje" })

        connection.query(sql_insertOrder, (err, result) => {
            if (err) return res.status(500).json(err)
            res.status(200).json({ order_id: result.insertId })
        })
    })
})

//add parts into order
router.post("/add", (req, res) => {
    // recive {"order_id": INT, "part_cat_id": INT, "amount": INT}
    // return 400 if any of parameters is missing OR empty OR does not match regEx
    // return 404 if cannot find category
    // return 500 if there was an DB error
    // return 200 with {"order_item_id": INT}

    if (!req.body.order_id) return res.status(400).json({ "message": "pole order_id jest wymagane" })
    if (!req.body.part_cat_id) return res.status(400).json({ "message": "pole part_cat_id jest wymagane" })
    if (!req.body.amount) return res.status(400).json({ "message": "pole amount jest wymagane" })

    const regInt = /^([1-9]{1,})([0-9]*)$/

    if (!regInt.test(req.body.order_id)) return res.status(400).json({ "message": "nieprawidłowy format pola order_id" })
    if (!regInt.test(req.body.part_cat_id)) return res.status(400).json({ "message": "nieprawidłowy format pola part_cat_id" })
    if (!regInt.test(req.body.amount)) return res.status(400).json({ "message": "nieprawidłowy format pola amount" })

    let sql_findCategory = `SELECT name FROM spareparts_cat WHERE part_cat_id = ${req.body.part_cat_id}`
    let sql_findOrder = `SELECT part_order_id FROM spareparts_orders WHERE part_order_id = ${req.body.order_id}`
    let sql_insertOrderItem = `INSERT INTO spareparts_orders_items (order_id, part_cat_id, amount) VALUES (${req.body.order_id}, ${req.body.part_cat_id}, ${req.body.amount})`

    
    let findCategory = new Promise((resolve, reject) => {
        connection.query(sql_findCategory, (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
    
    findCategory.catch((err) => {
        return res.status(500).json(err)
    })

    let findOrder = new Promise((resolve, reject) => {
        connection.query(sql_findOrder, (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })

    findOrder.catch((err) => {
        return res.status(500).json(err)
    })

    findCategory.then((catData) => {
        if (catData.length == 0) return res.status(404).json({ "message": "wpisana kategoria nie istnieje" })

        findOrder.then((orderData) => {
            if (orderData.length == 0) return res.status(400).json({"message": "wpisane zamówienie nie istnieje"})

            connection.query(sql_insertOrderItem, (err, result) => {
                if (err) return res.status(500).json(err)
                res.status(200).json({ order_item_id: result.insertId })
            })
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
        res.status(200).json({ message: "ok" })
    })
})

//edit order
router.put("/edit", (req, res) => {
    // recive {"order_id": INT, "part_cat_id": INT, "amount": INT, "exp_date": DATE}
    // return 400 if order_id is missing
    // return 400 if any of parameters does not match regEx
    // return 400 if specified orders is closed
    // return 404 if cannot find specified order
    // return 500 if there was DB error
    // return 200 on success

    function checkOrderStatus(order_id) {
        return new Promise(function (resolve, reject) {
            connection.query(`select part_order_id, status from spareparts_orders where part_order_id = ${order_id}`, function (err, rows) {
                if (err) return reject(err);
                resolve(rows)
            })
        })
    }

    const regInt = /^([1-9]){1,}([0-9]){0,}$/
    const regDate = /^([1-9]{1})([0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([0-9]{2}):([0-9]{2}):([0-9]{2})\.([0-9]{3})Z$/

    let fields = []
    let date

    if (!req.body.order_id || req.body.order_id == 0) return res.status(400).json({ "message": "pole order_id jest wymagane" })
    if (!regInt.test(req.body.order_id)) return res.status(400).json({ "message": "nieprawidłowy format pola order_id" })


    if (req.body.part_cat_id && req.body.part_cat_id != 0) {
        if (!regInt.test(req.body.part_cat_id)) return res.status(400).json({ "message": "nieprawidłowy format pola part_cat_id" })
        fields.push("part_cat_id")
    }
    if (req.body.amount && req.body.amount != 0) {
        if (!regInt.test(req.body.amount)) return res.status(400).json({ "message": "nieprawidłowy format pola amount" })
        fields.push("amount")
    }
    if (req.body.exp_date && req.body.exp_date != "") {
        if (!regDate.test(req.body.exp_date)) return res.status(400).json({ "message": "nieprawidłowy format pola exp_date" })
        date = req.body.exp_date.substring(0, 10)
        fields.push("exp_date")
    }

    if (fields.length == 0) return res.status(400).json({ "message": "podaj przynjamniej jeden parametr" })

    checkOrderStatus(req.body.order_id).then(function (rows) {
        if (rows.length == 0) return res.status(404).json({ "message": "nie znaleziono wskazanego zamówienia" })
        if (rows[0].status == 2) return res.status(400).json({ "message": "nie można edytować zakończonego zamówienia" })

        console.log(fields)
        let sql = `update spareparts_orders set `

        if (fields.includes("part_cat_id")) {
            sql += `part_cat_id = ${req.body.part_cat_id}`
        }
        if (fields.includes("amount")) {
            if (fields.length > 1) sql += ` , `
            sql += `amount = ${req.body.amount}`
        }
        if (fields.includes("exp_date")) {
            if (fields.length > 1) sql += ` , `
            sql += `expected_date = "${date}"`
        }

        sql += ` where part_order_id = ${req.body.order_id}`

        console.log(sql)

        connection.query(sql, (err, result) => {
            if (err) return res.status(500).json(err)
            res.status(200).json({ message: "ok" })
        })
    }).catch((err) => res.status(500).json(err))
})

//find order
router.get("/", (req, res) => {
    // recive any or all of params "partCatId": INT, "expDate": STRING, "status": INT
    // return 400 if none of params was passed
    // return 400 if any of passed params is in wrong format
    // return 404 if nothing was found
    // return 500 if there was a DB error
    // return 200 with [{"part_order_id": INT, "part_cat_id": INT, "amount": INT, "exp_date": STRING, "status": INT}]
    const intReg = /^[0-9]{1,}$/
    const regDate = /^([1-9]{1})([0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/

    let params = {
        partCatId: false,
        expDate: false,
        status: false
    }
    if (req.query.partCatId) params.partCatId = true
    if (req.query.expDate) params.expDate = true
    if (req.query.status) params.status = true

    if (!params.partCatId && !params.expDate && !params.status) return res.status(400).json({ "message": "podaj przynjamniej jeden parametr" })
    if (params.partCatId && !intReg.test(req.query.partCatId)) return res.status(400).json({ "message": "nieprawidłowy format pola partCatId" })
    if (params.expDate && !regDate.test(req.query.expDate)) return res.status(400).json({ "message": "nieprawidłowy format pola expDate" })
    if (params.status && !intReg.test(req.query.status)) return res.status(400).json({ "message": "nieprawidłowy format pola status" })

    let sql = `SELECT part_order_id, part_cat_id, amount, expected_date, status FROM spareparts_orders WHERE`

    if (params.partCatId) {
        sql += ` part_cat_id = ${req.query.partCatId}`
    }

    if (params.expDate) {
        if (params.partCatId) sql += ` AND`
        sql += ` expected_date = '${req.query.expDate}'`
    }

    if (params.status) {
        if (params.partCatId || params.expDate) sql += ` AND`
        sql += ` status = ${req.query.status}`
    }

    connection.query(sql, function (err, rows) {
        if (err) return res.status(500).json(err);
        if (rows.length == 0) return res.status(404).json({ "message": "nie znaleziono zamówień dla podanych kryteriów" })
        res.status(200).json(rows)
    })
})

module.exports = router