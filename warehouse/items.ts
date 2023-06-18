import express, { Express, Request, Response, Router } from "express";
import database from "../helpers/database";
import registerNewItem from "../helpers/warehouse/items/registerNewItem";
const router = express.Router();

interface reqQueryI {
  barcode: string;
  shelve: string;
}

interface reqBodyI {
  barcode: string;
  sn: string;
  barcodes: Array<string>;
  new_shelve: number;
  shelve: number;
}

function checkBarcode(barcode: any): Boolean {
  const reg = /^(\d{1,})-([A-ż(),. 0-9]{1,})-([A-z(),. 0-9]{1,})$/;
  return reg.test(barcode);
}

// register new item in warehouse
router.post("/", (req: Request<{}, {}, reqBodyI, reqQueryI>, res) => {
  // recive barcode in format "ticket_id-name-category" and sn (String)
  // return 400 if barcode is empty OR barcode does not match regEx OR ticket_id already exists in items table
  // return 500 if there was DB error
  // return 200 {inserted id, ticket id, shelve id}
  if (!req.body.barcode || req.body.barcode === undefined)
    return res.status(400).json({ message: "pole barcode jest wymagane" });
  if (!req.body.sn || req.body.sn === undefined)
    return res.status(400).json({ message: "pole sn jest wymagane" });
  if (!checkBarcode(req.body.barcode))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola barcode" });

  if (!/^[A-z0-9]{3,}$/.test(req.body.sn))
    return res.status(400).json({ message: "nieprawidłowy format pola sn" });

  let data = req.body.barcode.split("-");

  registerNewItem(parseInt(data[0]), data[1], data[2], req.body.sn)
    .then((result: any) => {
      res.status(200).json({
        id: result.inserted,
        ticket_id: data[0],
        shelve: 0,
      });
    })
    .catch((error) => res.status(error[0]).json(error[1]));
});

//check if item with specific ticket_id is registered in warehouse
router.get("/exists", (req: Request<{}, {}, reqBodyI, reqQueryI>, res) => {
  // recive barcode in format "ticket-id-name-category"
  // return 400 if barcode is empty OR barcode does not match regEx
  // return 404 with {found: false} if nothing was found
  // return 500 if there was DB error
  // return 200 with {found: true}
  if (!req.query.barcode)
    return res.status(400).json({ message: "pole barcode jest wymagane" });
  if (!checkBarcode(req.query.barcode))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola barcode" });

  let data = req.query.barcode.split("-")[0];

  let sql = `SELECT item_id FROM items WHERE ticket_id = ${data}`;
  database.query(sql, function (err, rows) {
    if (err) return res.status(500).json(err);
    if (rows.length == 0) return res.status(404).json({ found: false });
    return res.json({ found: true });
  });
});

//find item by ticket_id
router.get("/", (req: Request<{}, {}, reqBodyI, reqQueryI>, res) => {
  // recive barcode in format "ticket_id-name-category"
  // return 400 if barcode is empty OR barcode does not match regEx
  // return 404 if nothing was found
  // return 500 if there was DB error
  // returns 200 with first row object {item_id: int, name: string, shelve: int, category: string, ticket_id: int}

  let data, sql;
  if (req.query.barcode) {
    if (!checkBarcode(req.query.barcode))
      return res
        .status(400)
        .json({ message: "nieprawidłowy format pola barcode" });
    data = req.query.barcode.split("-")[0];
    sql = `SELECT item_id, name, shelve, category, ticket_id, sn FROM items WHERE ticket_id = ${data}`;
  } else {
    sql = `SELECT item_id, name, shelve, category, ticket_id, sn FROM items`;
  }

  database.query(sql, function (err, rows) {
    if (err) return res.status(500).json(err);
    res.status(200).json(rows);
  });
});

//counts all items in warehouse
router.get("/countall", (req, res) => {
  // return 404 if there is no items
  // return 500 if there was DB error
  // return 200 with {"productCount": INT}

  let sql = `SELECT count(item_id) as 'count' FROM items`;

  database.query(sql, function (err, rows) {
    if (err) return res.status(500).json(err);
    if (rows[0].count == 0)
      return res.status(404).json({ message: "brak przedmiotów na magazynie" });
    res.status(200).json({ productCount: rows[0].count });
  });
});

//find items in specific shelve
router.get("/shelve", (req: Request<{}, {}, reqBodyI, reqQueryI>, res) => {
  // recive shelve id in req.query INT
  // return 400 if shelve is empty OR shelve does not match regEx
  // return 404 if nothing was found
  // return 500 if there was DB error
  // reutns 200 with array of all items in shelve [{ticket_id: int, name: string, category: string}, ...]
  if (!req.query.shelve)
    return res.status(400).json({ message: "pole shelve jest wymagne" });
  const reg = /^(\d{1,})$/;
  if (!reg.test(req.query.shelve))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola shelve" });

  let shelve = req.query.shelve;
  let sql = `SELECT item_id, ticket_id, name, category, shelve, sn FROM items WHERE shelve = ${shelve}`;

  database.query(sql, function (err, rows) {
    if (err) return res.status(500).json(err);
    if (rows.length == 0)
      return res
        .status(404)
        .json({ message: "Brak produktów dla wybranej lokalizacji" });
    res.status(200).json(rows);
  });
});

//change shelve of registered item
router.put(
  "/changeshelve",
  (req: Request<{}, {}, reqBodyI, reqQueryI>, res) => {
    // recive barcodes in format ["ticket_id-name-category",...], destination shelve id INT and current shelve id INT
    // return 400 if barcode OR new_shelve OR shelve is empty
    // return 400 if barcode OR new_shelve OR shelve does not match regEx
    // return 400 if current and destiantion sheleve are equal
    // return 404 if no rows were changes
    // return 404 with message {} if number of rows changed is diffrent from number of barcodes
    // reutrn 500 if there was DB error
    // returns 200 with {ticket_id_arr: [], new_shelve id}
    if (!req.body.barcodes)
      return res.status(400).json({ message: "pole barcode jest wymagane" });
    if (!req.body.new_shelve && req.body.new_shelve != 0)
      return res.status(400).json({ message: "pole new_shelve jest wymagane" });
    if (!req.body.shelve && req.body.shelve != 0)
      return res.status(400).json({ message: "pole shelve jest wymagane" });

    const reg = /^(\d{1,})$/;

    if (!reg.test(req.body.new_shelve.toString()))
      return res
        .status(400)
        .json({ message: "nieprawidłowy format pola new_shelve" });
    if (!reg.test(req.body.shelve.toString()))
      return res
        .status(400)
        .json({ message: "nieprawidłowy format pola shelve" });

    let err = false;
    req.body.barcodes.forEach((el: string) => {
      if (!checkBarcode(el)) {
        err = true;
        return res
          .status(400)
          .json({ message: "nieprawidłowy format pola barcode", value: el });
      }
    });

    if (err) return;

    let dest = req.body.new_shelve;
    let current = req.body.shelve;
    if (dest == current)
      return res.status(400).json({
        message: "wybrana półka docelowa jest identyczna jak aktualna",
      });

    let ticket_id_arr = req.body.barcodes.map((el: string) => {
      return el.split("-")[0];
    });

    let ticket_idParsed = "(";
    ticket_id_arr.forEach((el: string, index: number) => {
      ticket_idParsed += el;
      if (index != ticket_id_arr.length - 1) ticket_idParsed += ", ";
    });
    ticket_idParsed += ")";

    let sql = `UPDATE items SET shelve = ${dest} WHERE ticket_id in ${ticket_idParsed} AND shelve = ${current}`;
    database.query(sql, function (err, result) {
      if (err) return res.status(500).json(err);
      if (result.changedRows == 0)
        return res.status(404).json({
          message:
            "nie przesunięto żadnych przedmiotów. Sprawdź poprawność kodów kreskowych",
        });
      if (result.changedRows != ticket_id_arr.length)
        return res.status(404).json({
          message:
            "ilość przesuniętych produktów różni się od zeskanowanych kodów kreskowych",
        });
      res.status(200).json({ ticket_id_arr: ticket_id_arr, new_shelve: dest });
    });
  }
);

//delete specific item by ticket_id
router.delete("/", (req: Request<{}, {}, reqBodyI, reqQueryI>, res) => {
  // recive barcode in format "ticket_id-name-category" and current shelve INT
  // return 400 if barcode OR shelve is empty
  // return 400 if barcode OR shelve does not match regEx
  // return 404 if nothing was deleted = cannot find specific item
  // return 500 if there was DB error
  // return 200 with {ticket_id: INT, shelve: INT}
  if (!req.body.barcode)
    return res.status(400).json({ message: "pole barcode jest wymagane" });
  if (!req.body.shelve && req.body.shelve != 0)
    return res.status(400).json({ message: "pole shelve jest wymagane" });

  if (!checkBarcode(req.body.barcode))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola barcode" });

  let ticket_id = req.body.barcode.split("-")[0];
  let current = req.body.shelve;

  let sql = `DELETE FROM items WHERE ticket_id = ${ticket_id} AND shelve = ${current}; UPDATE tickets SET inWarehouse = 0 WHERE ticket_id = ${ticket_id}`;
  database.query(sql, function (err, result) {
    if (err) return res.status(500).json(err);
    if (result.affectedRows == 0)
      return res.status(404).json({
        message:
          "nie można znaleźć wskazanego produktu na magazynie. Nic nie zostało usunięte",
      });
    res.status(200).json({ ticket_id: ticket_id, shelve: current });
  });
});

export default router;
