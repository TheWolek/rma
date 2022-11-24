const { json } = require("express");
const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const creds = require("../db_creds");
const connection = mysql.createConnection(creds);

connection.connect();

router.get("/", (req, res) => {
  //recive filter params: ticketId: INT, status: INT, type: INT, deviceSn: STR, deviceProducer: STR
  // email: STR, name: STR, phone: STR, date: STR
  //return 404 if no tickets were found
  //return 500 if there was a DB erorr
  //return 200 with all tickets Data on success

  let filters = "";

  if (req.query.ticketId !== undefined) {
    filters += `ticket_id = ${req.query.ticketId}`;
  }

  if (req.query.status !== undefined) {
    if (filters.length > 0) {
      filters += " and ";
    }

    filters += `status = ${req.query.status}`;
  }

  if (req.query.type !== undefined) {
    if (filters.length > 0) {
      filters += " and ";
    }

    filters += `type = ${req.query.type}`;
  }

  if (req.query.deviceSn !== undefined) {
    if (filters.length > 0) {
      filters += " and ";
    }

    filters += `device_sn = '${req.query.deviceSn}'`;
  }

  if (req.query.deviceProducer !== undefined) {
    if (filters.length > 0) {
      filters += " and ";
    }

    filters += `device_producer like '%${req.query.deviceProducer}%'`;
  }

  if (req.query.email !== undefined) {
    if (filters.length > 0) {
      filters += " and ";
    }

    filters += `email like '%${req.query.email}%'`;
  }

  if (req.query.name !== undefined) {
    if (filters.length > 0) {
      filters += " and ";
    }

    filters += `name like '%${req.query.name}%'`;
  }

  if (req.query.phone !== undefined) {
    if (filters.length > 0) {
      filters += " and ";
    }

    filters += `phone like '%${req.query.phone}%'`;
  }

  let sql = `SELECT * FROM tickets`;

  if (filters.length > 0) sql += ` WHERE ${filters}`;

  connection.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (rows.length === 0) return res.status(404).json([]);
    return res.status(200).json(rows);
  });
});

module.exports = router;
