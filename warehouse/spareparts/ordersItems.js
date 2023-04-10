const express = require("express");
const router = express.Router();
const database = require("../../helpers/database");

//get order items details
router.get("/", (req, res) => {
  // recive {"order_id": INT}
  // return 400 if no params were passed OR param is empty OR does not match regEx
  // return 404 if cannot find specified order
  // return 500 if there was an DB error
  // return 200 with [{"order_item_id": INT, "part_cat_id": INT, "amount": INT, "codes": [STR, ...]}, ...]

  if (!req.query.order_id)
    return res.status(400).json({ message: "pole order_id jest wymagane" });

  const regInt = /^([1-9]{1,})([0-9]{0,})$/;

  if (!regInt.test(req.query.order_id))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola order_id" });

  let sql = `select soi.order_item_id, soi.part_cat_id, soi.amount, sois.codes 
  from spareparts_orders_items soi left join spareparts_sn sois on soi.order_item_id = sois.item_id
  where soi.order_id =${req.query.order_id}`;

  database.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);

    let output = [];

    rows.forEach((el, index) => {
      let findItem = output.find((o) => o.order_item_id == el.order_item_id);

      if (findItem !== undefined) {
        findItem.codes.push(el.codes);
      } else {
        output.push({
          order_item_id: el.order_item_id,
          part_cat_id: el.part_cat_id,
          amount: el.amount,
          codes: [el.codes],
        });
      }
    });
    res.status(200).json(output);
  });
});

//add parts into order
router.post("/add", (req, res) => {
  // recive {"order_id": INT, "part_cat_id": INT, "amount": INT}
  // return 400 if any of parameters is missing OR empty OR does not match regEx
  // return 404 if cannot find category
  // return 500 if there was an DB error
  // return 200 with {"order_item_id": INT}

  if (!req.body.order_id)
    return res.status(400).json({ message: "pole order_id jest wymagane" });
  if (!req.body.part_cat_id)
    return res.status(400).json({ message: "pole part_cat_id jest wymagane" });
  if (!req.body.amount)
    return res.status(400).json({ message: "pole amount jest wymagane" });

  const regInt = /^([1-9]{1,})([0-9]*)$/;

  if (!regInt.test(req.body.order_id))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola order_id" });
  if (!regInt.test(req.body.part_cat_id))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola part_cat_id" });
  if (!regInt.test(req.body.amount))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola amount" });

  let sql_findCategory = `SELECT name FROM spareparts_cat WHERE part_cat_id = ${req.body.part_cat_id}`;
  let sql_findOrder = `SELECT part_order_id FROM spareparts_orders WHERE part_order_id = ${req.body.order_id}`;
  let sql_insertOrderItem = `INSERT INTO spareparts_orders_items (order_id, part_cat_id, amount) VALUES (${req.body.order_id}, ${req.body.part_cat_id}, ${req.body.amount})`;

  let findCategory = new Promise((resolve, reject) => {
    database.query(sql_findCategory, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });

  findCategory.catch((err) => {
    return res.status(500).json(err);
  });

  let findOrder = new Promise((resolve, reject) => {
    database.query(sql_findOrder, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });

  findOrder.catch((err) => {
    return res.status(500).json(err);
  });

  findCategory.then((catData) => {
    if (catData.length == 0)
      return res
        .status(404)
        .json({ message: "wpisana kategoria nie istnieje" });

    findOrder.then((orderData) => {
      if (orderData.length == 0)
        return res
          .status(400)
          .json({ message: "wpisane zamówienie nie istnieje" });

      database.query(sql_insertOrderItem, (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(200).json({ order_item_id: result.insertId });
      });
    });
  });
});

//remove parts from order
router.delete("/remove", (req, res) => {
  // recive {"toDel": [INT, INT...]}
  // return 400 if no param was passed OR it was empty OR any of params in array does not match regEx
  // return 404 if cannot find any part
  // return 500 if there was an DB error
  // return 200 on success

  if (!req.body.toDel) {
    return res.status(400).json({ message: "pole toDel jest wymagane" });
  }
  if (!typeof req.body.toDel in [Array, Object]) {
    return res.status(400).json({ message: "nieprawidłowy format pola toDel" });
  }
  if (req.body.toDel.length === 0) {
    return res.status(400).json({ message: "pole toDel nie może być puste" });
  }

  const reg = /^([0-9]{1,})$/;
  let sql = `DELETE FROM spareparts_orders_items WHERE order_item_id in (`;
  req.body.toDel.forEach((el, index) => {
    if (!reg.test(el)) {
      return res
        .status(400)
        .json({ message: "nieprawidłowy format wartości w polu toDel" });
    } else {
      if (index != req.body.toDel.length - 1) {
        sql += `${el}, `;
      } else {
        sql += `${el})`;
      }
    }
  });

  database.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ affectedRows: result.affectedRows });
  });
});

//set items codes
router.post("/codes", (req, res) => {
  // recive [{"item_id": INT, "codes": [STR, STR, ...], part_id: INT}, ...]
  // return 400 if any param is missing
  // return 400 if any param does not match regEx
  // return 500 if there was a DB error
  // return 200 on success
  const regInt = /^([1-9]{1})([0-9]{0,})$/;

  if (req.body.length === 0) {
    return res
      .status(400)
      .json({ message: "podaj prznajmniej jeden przedmiot" });
  }

  req.body.forEach((el) => {
    if (!el.item_id) {
      return res.status(400).json({ message: "pole item_id jest wymagane" });
    }
    if (!el.codes) {
      return res.status(400).json({ message: "pole codes jest wymagane" });
    }
    if (!regInt.test(el.item_id)) {
      return res
        .status(400)
        .json({ message: "nieprawidłowy format pola item_id" });
    }
  });

  req.body.forEach((el) => {
    for (let i = 0; i < el.codes.length; i++) {
      database.query(
        `INSERT INTO spareparts_sn (codes, item_id, part_id, shelve) values ('${el.codes[i]}', ${el.item_id}, ${el.part_id}, 0);`,
        (err, result) => {
          if (err) console.log(err);
        }
      );
    }
  });
  res.status(200).json({ message: "ok" });
});

module.exports = router;
