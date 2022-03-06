const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const creds = require('../db_creds')
const connection = mysql.createConnection(creds)

connection.connect()

router.post("/use", (req, res) => {

})

//find data about stock of specific parts
router.get("/stock", (req, res) => {
    //recive parameter "cat_id": INT
    // return 400 if no parameters is passed OR is empty
    // return 400 if any of parameters does not match regEx
    // return 404 if cannot find anything
    // return 500 if there was DB error
    // return 200 with
    // {"cat_id": INT, "totalAmount": INT}

    let query = req.query

    if (!query.cat_id || query.cat_id == 0) return res.status(400).json({ "message": "podaj id kategorii do wyszukania" })

    let reg = /^([0-9]){1,}$/
    if (!reg.test(query.cat_id)) return res.status(400).json({ "message": "nieprawidłowy format pola cat_id" })

    let sql = `select cat_id, sum(amount) as 'totalAmount' 
    from spareparts s where cat_id = ${query.cat_id} group by cat_id;`

    connection.query(sql, (err, rows) => {
        if (err) return res.status(500).json(err)
        if (rows.length == 0) return res.status(404).json({ "message": "nieznaleziono części na magazynie dla podanych kryteriów" })

        res.status(200).json({
            "cat_id": rows[0].cat_id,
            "totalAmount": rows[0].totalAmount
        })
    })
})

// find all data about specific part
router.get("/", (req, res) => {
    // recive one or more of parameters "producer": STRING, "category": STRING, "name": STRING
    // return 400 if no parameter is passed OR is empty
    // return 400 if any of parameters does not match regEx
    // return 404 if cannot find anything
    // return 500 if there was DB error
    // return 200 with 
    // {"cat_id": {"part":{"category": STRING, "cat_id": INT, "producer": STRING, "name": STRING}, "warehouse": {shelves: [INT, ...], totalAmount: INT, parts_id: [INT, ...]}},
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