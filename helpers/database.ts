import mysql from "mysql";
import creds from "../db_creds";

// const mysql = require("mysql");
// const creds = require("../db_creds");

const pool = mysql.createPool(creds);

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("connected to DB");
  connection.release();
});

export default pool;