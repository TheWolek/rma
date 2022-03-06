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
    const regCatProd = /^([A-ż 0-9'"-]{1,})$/

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
router.put("/orders", (req, res) => {
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

router.put("/shelve", (req, res) => {

})

router.post("/use", (req, res) => {

})

// find all data about specific part
router.get("/", (req, res) => {
    // recive one or more of parameters "producer": STRING, "category": STRING, "name": STRING, "amount": INT
    // return 400 if no parameter is passed OR is empty
    // return 400 if any of parameters does not match regEx
    // return 404 if cannot find anything
    // return 500 if there was DB error
    // return 200 with 
    // [{"part":{"category": STRING, "producer": STRING, "name": STRING}, "warehouse": {"amount": INT, "shelve": [INT,...]}],
    // 

    let query = req.query

    if (Object.keys(query).length == 0) return res.status(400).json({ "message": "podaj przynajmniej jedną wartość do wyszukania" })

    let statement = ""
    let conditions = 0
    if (query.producer) {
        let reg = /^([A-ż 0-9'"-]{2,})$/
        if (!reg.test(query.producer)) return res.status(400).json({ "message": "nieprawidłowy format pola producer" })

        statement += `spareparts_cat.producer like "%${query.producer}%"`
        conditions += 1
    }

    if (query.category) {
        let reg = /^([A-ż 0-9'"-]{2,})$/
        if (!reg.test(query.category)) return res.status(400).json({ "message": "nieprawidłowy format pola category" })

        if (conditions > 0) {
            statement += ` and spareparts_cat.category like "%${query.category}%"`
        } else {
            statement += `spareparts_cat.category like "%${query.category}%"`
        }

        conditions += 1
    }

    if (query.name) {
        let reg = /^([A-ż,. ()0-9'"-]{2,})$/
        if (!reg.test(query.name)) return res.status(400).json({ "message": "nieprawidłowy format pola name" })

        if (conditions > 0) {
            statement += ` and spareparts_cat.name like "%${query.name}%"`
        } else {
            statement += `spareparts_cat.name like "%${query.name}%"`
        }

        conditions += 1
    }

    // if (query.amount || query.amount == 0) {
    //     let reg = /^([0-9]{1,})$/
    //     if (!reg.test(query.amount)) return res.status(400).json({ "message": "nieprawidłowy format pola amount" })

    //     if (conditions > 0) {
    //         statement += ` and spareparts.amount <= ${query.amount}`
    //     } else {
    //         statement += `spareparts.amount <= ${query.amount}`
    //     }

    //     conditions += 1
    // }

    if (conditions == 0) return res.status(400).json({ "message": "podaj przynajmniej jedną wartość do wyszukania" })

    let sql_findPart = `select distinct category, producer, name, amount, shelve, part_cat_id, part_id
    from spareparts_cat left join spareparts on spareparts_cat.part_cat_id = spareparts.cat_id 
    where ${statement}`

    connection.query(sql_findPart, (err, rows) => {
        if (err) return res.status(500).json(err)
        if (rows.length == 0) return res.status(404).json({ "message": "nieznaleziono części dla podanych kryteriów" })

        let output = {}
        rows.forEach(el => {
            if ("cat_" + el.part_cat_id in output) {
                output["cat_" + el.part_cat_id].warehouse.shelves.push(el.shelve)
                output["cat_" + el.part_cat_id].warehouse.totalAmount += el.amount
                output["cat_" + el.part_cat_id].warehouse.parts_id.push(el.part_id)
            } else {
                let part = {
                    "category": el.category,
                    "cat_id": el.part_cat_id,
                    "producer": el.producer,
                    "name": el.name
                }
                let warehouse = {
                    "shelves": [el.shelve],
                    "totalAmount": el.amount,
                    "parts_id": [el.part_id]
                }
                output["cat_" + el.part_cat_id] = {
                    "part": part, "warehouse": warehouse
                }
            }
        });

        res.status(200).json(output)
    })
})
module.exports = router