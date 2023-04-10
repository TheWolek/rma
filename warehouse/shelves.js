const express = require("express");
const router = express.Router();
const database = require("../helpers/database");

//add shelve
router.post("/add", (req, res) => {
  let code = req.body.code;
  let sql = `INSERT INTO shelves (code) VALUES ("${code}")`;

  database.query(sql, (err, result) => {
    res.status(200).json({ id: result.insertId, code: code });
  });
});

//get all shelves
router.get("/", (req, res) => {
  let sql = `SELECT shelve_id, code FROM shelves`;

  database.query(sql, (err, rows) => {
    res.status(200).json(rows);
  });
});

module.exports = router;
