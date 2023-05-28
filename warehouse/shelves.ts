import express, { Express, Request, Response, Router } from "express";
import database from "../helpers/database";
// import { MysqlError } from "mysql";
const router = express.Router();

//add shelve
router.post("/add", (req: Request<{}, {}, { code: string }, {}>, res) => {
  let code = req.body.code;
  let sql = `INSERT INTO shelves (code) VALUES ("${code}")`;

  database.query(sql, (err, result) => {
    res.status(200).json({ id: result.insertId, code: code });
  });
});

//get all shelves
router.get("/", (req: Request, res) => {
  let sql = `SELECT shelve_id, code FROM shelves`;

  database.query(sql, (err, rows) => {
    res.status(200).json(rows);
  });
});

export default router;
