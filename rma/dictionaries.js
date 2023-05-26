const express = require("express");
const router = express.Router();
const database = require("../helpers/database");

router.get("/damagesTypes", (req, res) => {
  let query = `SELECT * from tickets_damage_types`;
  database.query(query, (err, rows) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(rows);
  });
});

router.get("/accesoriesTypes", (req, res) => {
  let query = `SELECT * from tickets_aditionalAccesories_types`;
  database.query(query, (err, rows) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(rows);
  });
});

module.exports = router;
