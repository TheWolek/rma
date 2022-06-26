const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const creds = require("../../db_creds");
const connection = mysql.createConnection(creds);
const formatDate = require("../../utils/formatDate");

connection.connect();

//register new order of spareparts
router.post("/", (req, res) => {
  // recive {"supplier_id": INT, "exp_date": DATE}
  // return 400 if any of parameters is missing OR empty OR does not match regEX
  // return 404 if cannot find supplied_id
  // return 500 if there was DB error
  // return 200 with {"order_id": INT}

  // if (!req.body.category_id) return res.status(400).json({ "message": "pole category_id jest wymagane" })
  // if (!req.body.amount) return res.status(400).json({ "message": "pole amount jest wymagane" })
  if (!req.body.exp_date)
    return res.status(400).json({ message: "pole exp_date jest wymagane" });
  if (!req.body.supplier_id)
    return res.status(400).json({ message: "pole supplier_id jest wymagane" });

  const regInt = /^([1-9]{1,})([0-9]*)$/;
  const regDate =
    /^([1-9]{1})([0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([0-9]{2}):([0-9]{2}):([0-9]{2})\.([0-9]{3})Z$/;

  // if (!regCatAmount.test(req.body.category_id)) return res.status(400).json({ "message": "nieprawidłowy format pola category_id" })
  // if (!regCatAmount.test(req.body.amount)) return res.status(400).json({ "message": "nieprawidłowy format pola amount" })
  if (!regDate.test(req.body.exp_date))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola exp_date" });
  if (!regInt.test(req.body.supplier_id))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola supplier_id" });

  let date = req.body.exp_date.substring(0, 10);

  let sql_findSupplier = `SELECT name FROM suppliers WHERE id = ${req.body.supplier_id}`;
  let sql_insertOrder = `INSERT INTO spareparts_orders (expected_date, supplier_id, status) VALUES ("${date}", ${req.body.supplier_id},0)`;

  let findSupplier = new Promise((resolve, reject) => {
    connection.query(sql_findSupplier, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });

  findSupplier.catch((err) => {
    return res.status(500).json(err);
  });

  findSupplier.then((data) => {
    if (data.length == 0)
      return res.status(404).json({ message: "wpisany dostawca nie istnieje" });

    connection.query(sql_insertOrder, (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(200).json({ order_id: result.insertId });
    });
  });
});

//change order status
router.put("/", (req, res) => {
  // recive {"order_id": INT, "status": INT}
  // return 400 if any of parameters is missing OR empty OR does not match regEx
  // return 404 if cannot find specific order
  // return 500 if there was DB error
  // return 200 on success

  if (!req.body.order_id)
    return res.status(400).json({ message: "pole order_id jest wymagane" });
  if (!req.body.status && !req.body.status == 0)
    return res.status(400).json({ message: "pole status jest wymagane" });

  const reg = /^([0-9]{1,})$/;

  if (!reg.test(req.body.order_id))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola order_id" });
  if (!reg.test(req.body.status))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola status" });

  let sql = `UPDATE spareparts_orders SET status = ${req.body.status} WHERE part_order_id = ${req.body.order_id}`;

  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(200).json({ message: "ok" });
  });
});

//edit order
router.put("/edit", (req, res) => {
  // recive {"items": [{"amount": INT, "order_item_id": INT, "part_cat_id": 3}],
  // "orderData": {"expected_date": DATE, "part_order_id": INT, "status": INT, "supplier_id": INT}}
  // return 400 if part_order_id is missing
  // return 400 if any of parameters does not match regEx
  // return 400 if specified order is closed
  // return 404 if cannot find specified order
  // return 500 if there was DB error
  // return 200 on success

  const regInt = /^([1-9]){1,}([0-9]){0,}$/;
  const regStatus = /^([0-9]{1})$/;
  const regDate =
    /^([1-9]{1})([0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([0-9]{2}):([0-9]{2}):([0-9]{2})\.([0-9]{3})Z$/;

  let fields = [];
  let date;
  const orderData = req.body.orderData;
  const orderItems = req.body.items;

  //part_order_id
  if (!orderData.part_order_id || orderData.part_order_id == 0)
    return res
      .status(400)
      .json({ message: "pole part_order_id jest wymagane" });
  if (!regInt.test(orderData.part_order_id))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola part_order_id" });

  //expected_date
  if (!orderData.expected_date || orderData.expected_date === "") {
    return res
      .status(400)
      .json({ message: "pole expected_date jest wymagane" });
  }
  if (!regDate.test(orderData.expected_date)) {
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola expected_date" });
  }
  date = orderData.expected_date.substring(0, 10);

  //status
  if (orderData.status === undefined || orderData.status === null) {
    return res.status(400).json({ message: "pole status jest wymagane" });
  }
  if (!regStatus.test(orderData.status)) {
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola status" });
  }

  //supplier_id
  if (!orderData.supplier_id || orderData.supplier_id === 0) {
    return res.status(400).json({ message: "pole supplier_id jest wymagane" });
  }
  if (!regInt.test(orderData.supplier_id)) {
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola supplier_id" });
  }

  //items loop
  for (let i = 0; i < orderItems.length; i++) {
    let item = orderItems[i];

    //part_cat_id
    if (!item.part_cat_id || item.part_cat_id === 0) {
      res.status(400).json({ message: "pole part_cat_id jest wymagane" });
      break;
    }
    if (!regInt.test(item.part_cat_id)) {
      res
        .status(400)
        .json({ message: "nieprawidłowy format pola part_cat_id" });
      break;
    }

    //amount
    if (!item.amount || item.amount === 0) {
      res.status(400).json({ message: "pole amount jest wymagane" });
      break;
    }
    if (!regInt.test(item.amount)) {
      res.status(400).json({ message: "nieprawidłowy format pola amount" });
      break;
    }
  }

  function checkOrderStatus(order_id) {
    return new Promise(function (resolve, reject) {
      connection.query(
        `select part_order_id, status from spareparts_orders where part_order_id = ${order_id}`,
        function (err, rows) {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  function checkIfItemExists(itemId) {
    return new Promise(function (resolve, reject) {
      connection.query(
        `select order_item_id from spareparts_orders_items where order_item_id = ${itemId}`,
        function (err, rows) {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  let badOrder = false;

  checkOrderStatus(orderData.part_order_id)
    .then(function (rows) {
      if (rows.length == 0) {
        badOrder = true;
        return res
          .status(404)
          .json({ message: "nie znaleziono wskazanego zamówienia" });
      }
      if (rows[0].status == 2) {
        badOrder = true;
        return res
          .status(400)
          .json({ message: "nie można edytować zakończonego zamówienia" });
      }

      let date = formatDate(orderData.expected_date);
      let sql = `update spareparts_orders set expected_date = "${date}", status = ${orderData.status}, supplier_id = ${orderData.supplier_id} where part_order_id = ${orderData.part_order_id}`;

      console.log(sql);

      connection.query(sql, (err, result) => {
        if (err) Promise.reject(err);
        Promise.resolve();
        // res.status(200).json({ message: "ok" });
      });
    })
    .then(function () {
      if (badOrder) return;

      let queries = "";

      orderItems.forEach(function (item) {
        if (item.order_item_id === undefined || !item.order_item_id) {
          queries += `INSERT INTO spareparts_orders_items (part_cat_id, amount, order_id) VALUES (${item.part_cat_id}, ${item.amount}, ${orderData.part_order_id});`;
          //queries += `INSERT INTO spareparts_orders_items_sn (codes, item_id) VALUES ("", ${item.order_item_id})`;
        } else if (item.toRemove !== undefined || item.toRemove) {
          queries += `DELETE FROM spareparts_orders_items_sn WHERE item_id = ${item.order_item_id};`;
          queries += `DELETE FROM spareparts_orders_items WHERE order_item_id = ${item.order_item_id};`;
        } else {
          queries += `UPDATE spareparts_orders_items set part_cat_id = ${item.part_cat_id}, amount = ${item.amount} WHERE order_item_id = ${item.order_item_id};`;
        }
      });

      console.log(queries);

      connection.query(queries, function (err, result) {
        if (err) return res.status(500).json(err);
        res.status(200).json({ status: "ok" });
      });
    })
    .catch((err) => res.status(500).json(err));
});

//find order
router.get("/find", (req, res) => {
  // recive any or all of params "partCatId": INT, "expDate": STRING, "status": INT
  // return 400 if none of params was passed
  // return 400 if any of passed params is in wrong format
  // return 404 if nothing was found
  // return 500 if there was a DB error
  // return 200 with [{"part_order_id": INT, "part_cat_id": INT, "amount": INT, "exp_date": STRING, "status": INT}]
  const regInt = /^[0-9]{1,}$/;
  const regDate =
    /^([1-9]{1})([0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

  let params = {
    partCatId: false,
    expDate: false,
    status: false,
  };
  if (req.query.partCatId) params.partCatId = true;
  if (req.query.expDate) params.expDate = true;
  if (req.query.status) params.status = true;

  if (!params.partCatId && !params.expDate && !params.status)
    return res
      .status(400)
      .json({ message: "podaj przynjamniej jeden parametr" });
  if (params.partCatId && !regInt.test(req.query.partCatId))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola partCatId" });
  if (params.expDate && !regDate.test(req.query.expDate))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola expDate" });
  if (params.status && !regInt.test(req.query.status))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola status" });

  let sql = `select distinct so.part_order_id, so.expected_date, so.status, so.supplier_id
    from spareparts_orders so left join spareparts_orders_items soi on so.part_order_id = soi.order_id where`;

  if (params.partCatId) {
    sql += ` soi.part_cat_id = ${req.query.partCatId}`;
  }

  if (params.expDate) {
    if (params.partCatId) sql += ` AND`;
    sql += ` so.expected_date = '${req.query.expDate}'`;
  }

  if (params.status) {
    if (params.partCatId || params.expDate) sql += ` AND`;
    sql += ` so.status = ${req.query.status}`;
  }

  connection.query(sql, function (err, rows) {
    if (err) return res.status(500).json(err);
    if (rows.length == 0)
      return res
        .status(404)
        .json({ message: "nie znaleziono zamówień dla podanych kryteriów" });
    res.status(200).json(rows);
  });
});

module.exports = router;
