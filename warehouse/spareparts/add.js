const express = require("express");
const router = express.Router();
// const mysql = require("mysql");
// const creds = require("../../db_creds");
// const database = mysql.createdatabase(creds);

// database.connect();

const database = require("../../helpers/database");

// register new category of sparepart
router.post("/new", (req, res) => {
  // recive {"name": string, "category": string, "producer": string}
  // return 400 if any of parameters is missig OR is empty OR does not match regEx
  // return 500 if there was DB error
  // return 200 with {"id": INT}

  // if (!req.body.sn) return res.status(400).json({ "message": "pole sn jest wymagane" })
  if (!req.body.name)
    return res.status(400).json({ message: "pole name jest wymagane" });
  if (!req.body.category)
    return res.status(400).json({ message: "pole category jest wymagane" });
  if (!req.body.producer)
    return res.status(400).json({ message: "pole producer jest wymagane" });

  const regName = /^([A-ż]{1,})([,. ()0-9'"-]){0,}$/;
  // const regSN = /^([0-9-]{1,})$/
  const regCatProd = /^([A-ż]{1,})([,. ()0-9'"-]){0,}$/;

  if (!regName.test(req.body.name))
    return res.status(400).json({ message: "nieprawidłowy format pola name" });
  // if (!regSN.test(req.body.sn)) return res.status(400).json({ "message": "nieprawidłowy format pola sn" })
  if (!regCatProd.test(req.body.category))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola category" });
  if (!regCatProd.test(req.body.producer))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola producer" });

  let sql = `INSERT INTO spareparts_cat (name, category, producer) VALUES ('${req.body.name}','${req.body.category}','${req.body.producer}')`;

  database.query(sql, function (err, result) {
    if (err) {
      // if (err.code == "ER_DUP_ENTRY") return res.status(400).json({ "message": "część z podanym SN została już zarejestrowana" })
      return res.status(500).json(err);
    }
    res.status(200).json({ id: result.insertId });
  });
});

// add part to warehouse
router.post("/", (req, res) => {
  // recive [{"cat_id": INT, "amount": INT}, ...]
  // return 400 if array is empty
  // return 400 if any of parameters is missing OR is empty OR does not match regEx
  // return 500 if there was DB error
  // return 200 with {"part_id": INT}

  if (!req.body.length > 0)
    return res.status(400).json({ message: "nie podano przedmiotów" });

  req.body.forEach((el) => {
    if (!el.cat_id)
      return res.status(400).json({ message: "pole cat_id jest wymagane" });
    if (!el.amount)
      return res.status(400).json({ message: "pole amount jest wymagane" });
    // if (!el.shelve && el.shelve !== 0)
    //   return res.status(400).json({ message: "pole shelve jest wymagane" });
  });

  const reg = /^([1-9]{1,}[0-9]{0,})$/;
  const regShelve = /^([0-9]{1,})$/;

  req.body.forEach((el) => {
    if (!reg.test(el.cat_id))
      return res
        .status(400)
        .json({ message: "nieprawidłowy format pola cat_id" });
    if (!reg.test(el.amount))
      return res
        .status(400)
        .json({ message: "nieprawidłowy format pola amount" });
    // if (!regShelve.test(el.shelve))
    //   return res
    //     .status(400)
    //     .json({ message: "nieprawidłowy format pola shelve" });
  });

  let output = [];
  let sql = `insert into spareparts (cat_id, amount) values `;

  req.body.forEach((el, index, arr) => {
    sql += `(${el.cat_id}, ${el.amount})`;
    if (arr.length - 1 !== index) {
      sql += ", ";
    }
    output.push({
      cat_id: el.cat_id,
      insertedId: null,
    });
  });

  sql += `; select LAST_INSERT_ID() AS lastid, ROW_COUNT() as rowcount;`;

  database.query(sql, (err, result) => {
    if (err) return console.log(err);
    for (let i = 0; i < result[1][0].rowcount; i++) {
      output[i].insertedId = result[1][0].lastid + i;
    }
    res.status(200).json({ inertedRows: output });
  });
});

module.exports = router;
