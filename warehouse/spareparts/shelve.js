const express = require("express");
const router = express.Router();
const database = require("../../helpers/database");

//get all items in specific shelve
router.get("/", (req, res) => {});

//change shelve of parts
router.put("/", (req, res) => {
  // recive {"parts_sn": [STRING, ...], "new_shelve": INT}
  // return 400 if any of params is missing
  // return 400 if parts_sn array is empty
  // return 400 if any of params does not match regEx
  // return 400 if cannot find any of part sn
  // return 500 if there was DB error
  // return 200 on success
  if (req.body.parts_sn === undefined)
    return res.status(400).json({ message: "Pole parts_sn jest wymagane" });
  if (req.body.new_shelve === undefined)
    return res.status(400).json({ message: "Pole new_shelve jest wymagane" });
  if (req.body.parts_sn.length === 0)
    return res
      .status(400)
      .json({ message: "Podaj przynajmniej jeden kod kreskowy" });

  const intReg = /^\d{1,}$/;
  const codeReg = /^((\w{1,})|(\d{1,})){3,}$/;

  if (!intReg.test(req.body.new_shelve))
    return res.status(400).json({ message: "Zły format pola new_shelve" });
  if (!Array.isArray(req.body.parts_sn))
    return res.status(400).json({ message: "Zły format pola parts_sn" });

  let parts = req.body.parts_sn;
  let find_sql = `SELECT codes FROM spareparts_sn WHERE`;
  let find_sql_where = "";
  let error = false;
  parts.forEach((code, index) => {
    if (!codeReg.test(code)) {
      error = true;
      return res
        .status(400)
        .json({ message: `Zły format kodu kreskowego '${code}'` });
    }

    find_sql_where += ` codes = '${code}'`;
    if (index !== parts.length - 1) find_sql_where += ` OR`;
  });

  if (error) return;

  function checkIfCodesExists(parts) {
    return new Promise(function (resolve, reject) {
      find_sql += find_sql_where;
      database.query(find_sql, function (err, rows) {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  checkIfCodesExists(parts)
    .then(function (rows) {
      if (rows.length === 0)
        return res
          .status(404)
          .json({ message: "nie znaleziono pasujących cześci" });
      if (rows.length !== parts.length)
        return res
          .status(400)
          .json({ message: "nie znaleziono wszystkich wskazanych cześci" });

      let sql = `UPDATE spareparts_sn SET shelve = ${req.body.new_shelve} WHERE${find_sql_where}`;

      database.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json({});
      });
    })
    .catch(function (err) {
      return res.status(500).json(err);
    });
});

module.exports = router;
