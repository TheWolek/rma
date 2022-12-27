const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const creds = require("../db_creds");
const connection = mysql.createConnection(creds);
const formatDateAndHours = require("../utils/formatDateAndHours");

connection.connect();

function checkIfTicketExists(id) {
  return new Promise(function (resolve, reject) {
    let sql = `SELECT ticket_id FROM tickets WHERE ticket_id=${id};`;
    connection.query(sql, function (err, rows) {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

const ticketReg = /^([1-9]){1,}([0-9]){0,}$/;

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

  let sql = `SELECT t.ticket_id, t.email, t.name, t.phone, t.device_sn, t.device_name, t.device_producer, t.type, 
  t.device_accessories, t.issue, t.status, t.created, t.lines, t.postCode, t.city, t.device_cat, 
  t.lastStatusUpdate, t.inWarehouse, i.item_id, s.shelve_id, s.code 
  FROM tickets t left join items i on t.ticket_id = i.ticket_id
  left join shelves s on i.shelve = s.shelve_id `;

  if (req.query.waybill !== undefined)
    sql += ` JOIN waybills w ON t.ticket_id = w.ticket_id`;

  if (filters.length > 0) sql += ` WHERE ${filters}`;

  connection.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (rows.length === 0) return res.status(404).json([]);
    return res.status(200).json(rows);
  });
});

router.put("/register/:ticketId", (req, res) => {
  //recive ticketId in url
  //return 400 if ticketId does not match regEx
  //return 404 if no ticket was found
  //return 500 on DB error
  //return 200 on success

  if (!ticketReg.test(req.params.ticketId))
    return res.status(400).json({ message: "Zły format pola ticketId" });

  checkIfTicketExists(req.params.ticketId).then(function (rows) {
    if (rows.length === 0)
      return res.status(404).json({ message: "Brak zlecenia o podanym ID" });

    let sql = `UPDATE tickets SET inWarehouse=1 WHERE ticket_id=${req.params.ticketId};`;
    connection.query(sql, (err, results) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({});
    });
  });
});

router.put("/changeState/:ticketId", (req, res) => {
  //recive ticketId in URL
  //recive body {status: INT [1-9]}
  //return 400 if ticketId does not match regEx
  //return 400 if status does not match regEx
  //return 404 if no ticket was found
  //return 500 on DB erorr
  //return 200 on success

  if (!ticketReg.test(req.params.ticketId))
    return res.status(400).json({ message: "Zły format pola ticketId" });

  if (
    req.body.status === undefined ||
    req.body.status === "" ||
    req.body.status === null
  )
    return res.status(400).json({ message: "Pole status jest wymagane" });

  const statusReg = /^[1-9]$/;

  if (!statusReg.test(req.body.status))
    return res.status(400).json({ message: "Zły format pola status" });

  checkIfTicketExists(req.params.ticketId).then(function (rows) {
    if (rows.length === 0)
      return res.status(404).json({ message: "Brak zlecenia o podanym ID" });

    const updateDate = formatDateAndHours(new Date());
    let sql = `UPDATE tickets SET status=${req.body.status}, lastStatusUpdate="${updateDate}" WHERE ticket_id=${req.params.ticketId};`;
    connection.query(sql, (err, results) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({});
    });
  });
});

router.post("/comment/:ticketId", (req, res) => {
  //recive ticketId in url
  //recive body {comment: STR}
  //return 400 if ticketId does not match regEx
  //return 400 if comment is empty
  //return 404 if no ticket was found
  //return 500 on DB erorr
  //return 200 on success

  if (!ticketReg.test(req.params.ticketId))
    return res.status(400).json({ message: "Zły format pola ticketId" });

  if (
    req.body.comment === undefined ||
    req.body.comment === "" ||
    req.body.comment === null
  )
    return res.status(400).json({ message: "Pole comment jest wymagane" });

  checkIfTicketExists(req.params.ticketId).then(function (rows) {
    if (rows.length === 0)
      return res.status(404).json({ message: "Brak zlecenia o podanym ID" });

    let sql = `INSERT INTO tickets_comments (ticket_id, comment) VALUES (${req.params.ticketId}, "${req.body.comment}");`;
    connection.query(sql, (err, results) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({});
    });
  });
});

router.get("/comments/:ticketId", (req, res) => {
  //recive ticketId in url
  //return 400 if ticketId does not match regEx
  //return 404 if no comments were found
  //return 500 on DB error
  //return 200 on success with [{comment: STR, created: DATE}, ...]

  if (!ticketReg.test(req.params.ticketId))
    return res.status(400).json({ message: "Zły format pola ticketId" });

  let sql = `SELECT comment, created FROM tickets_comments WHERE ticket_id = ${req.params.ticketId};`;

  connection.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (rows.length === 0) return res.status(404).json([]);
    return res.status(200).json(rows);
  });
});

module.exports = router;
