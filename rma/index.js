const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const creds = require("../db_creds");
const connection = mysql.createConnection(creds);

connection.connect();

router.get("/", (req, res) => {
  //recive filter params: ticketId: INT, status: INT, type: INT, deviceSn: STR, deviceProducer: STR
  // email: STR, name: STR, phone: STR, date: STR, waybill: STR
  //return 404 if no tickets were found
  //return 500 if there was a DB erorr
  //return 200 with all tickets Data on success

  let filters = "";

  if (req.query.ticketId !== undefined) {
    filters += `t.ticket_id = ${req.query.ticketId}`;
  }

  if (req.query.status !== undefined) {
    if (filters.length > 0) {
      filters += " and ";
    }

    filters += `t.status = ${req.query.status}`;
  }

  if (req.query.type !== undefined) {
    if (filters.length > 0) {
      filters += " and ";
    }

    filters += `t.type = ${req.query.type}`;
  }

  if (req.query.deviceSn !== undefined) {
    if (filters.length > 0) {
      filters += " and ";
    }

    filters += `t.device_sn = '${req.query.deviceSn}'`;
  }

  if (req.query.deviceProducer !== undefined) {
    if (filters.length > 0) {
      filters += " and ";
    }

    filters += `t.device_producer like '%${req.query.deviceProducer}%'`;
  }

  if (req.query.email !== undefined) {
    if (filters.length > 0) {
      filters += " and ";
    }

    filters += `t.email like '%${req.query.email}%'`;
  }

  if (req.query.name !== undefined) {
    if (filters.length > 0) {
      filters += " and ";
    }

    filters += `t.name like '%${req.query.name}%'`;
  }

  if (req.query.phone !== undefined) {
    if (filters.length > 0) {
      filters += " and ";
    }

    filters += `t.phone like '%${req.query.phone}%'`;
  }

  if (req.query.date !== undefined) {
    if (filters.length > 0) {
      filters += " and ";
    }

    filters += `t.created like '${req.query.date}%'`;
  }

  if (req.query.waybill !== undefined) {
    if (filters.length > 0) {
      filters += " and ";
    }

    filters += `w.waybill_number like '${req.query.waybill}%'`;
  }

  let sql = `SELECT t.ticket_id, t.email, t.name, t.phone, t.device_sn, t.device_name, t.device_producer, t.type, t.device_accessories, t.issue, t.status, t.created, t.lines, t.postCode, t.city, t.device_cat, t.lastStatusUpdate, t.inWarehouse, i.item_id FROM tickets t left join items i on t.ticket_id = i.ticket_id `;

  if (req.query.waybill !== undefined)
    sql += ` JOIN waybills w ON t.ticket_id = w.ticket_id`;

  if (filters.length > 0) sql += ` WHERE ${filters}`;

  connection.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (rows.length === 0) return res.status(404).json([]);
    return res.status(200).json(rows);
  });
});

module.exports = router;
