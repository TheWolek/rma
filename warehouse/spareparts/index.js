const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const creds = require("../../db_creds");
const connection = mysql.createConnection(creds);

connection.connect();

//removes specified amount of specified part
router.post("/use", (req, res) => {
  // recive {"part_id": INT, "shelve": INT, "sn": STR}
  // return 400 if any of parameters is missing OR is empty OR does not match regEx
  // return 400 if registered amount is fewer than requested
  // return 404 if cannot find specific part
  // return 500 if there was DB error
  // return 200 on success

  if (!req.body.part_id || req.body.part_id == 0)
    return res.status(400).json({ message: "pole part_id jest wymagane" });
  // if (!req.body.amount || req.body.amount == 0)
  //   return res.status(400).json({ message: "pole amount jest wymagane" });
  // if (!req.body.shelve || req.body.shelve == 0)
  //   return res.status(400).json({ message: "pole shelve jest wymagane" });
  if (!req.body.sn || req.body.sn === undefined)
    return res.status(400).json({ message: "pole sn jest wymagane" });

  let part_id = req.body.part_id;
  //let amount = req.body.amount;
  //let shelve = req.body.shelve;
  let sn = req.body.sn;

  const reg = /^([1-9]){1,}([0-9]){0,}$/;
  const sn_reg = /^[A-z0-9]{3,}$/;

  if (!reg.test(part_id))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola part_id" });
  // if (!reg.test(amount))
  //   return res
  //     .status(400)
  //     .json({ message: "nieprawidłowy format pola amount" });
  // if (!reg.test(shelve))
  //   return res
  //     .status(400)
  //     .json({ message: "nieprawidłowy format pola shelve" });
  if (!sn_reg.test(sn))
    return res.status(400).json({ message: "nieprawidłowy format pola sn" });

  function checkPartAmount(part_id) {
    return new Promise(function (resolve, reject) {
      let sql = `select part_id, amount from spareparts where part_id = ${part_id};`;
      connection.query(sql, function (err, rows) {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  checkPartAmount(part_id).then(function (rows) {
    if (rows.length == 0)
      return res
        .status(404)
        .json({ message: "nie znaleziono wskazanej części" });
    if (rows[0].amount < 1)
      return res.status(400).json({
        message:
          "na wskazanej półce znajduje się za mało sztuk wskazanej części",
      });

    let newAmount = rows[0].amount - 1;
    let sql = `delete from spareparts_sn where codes = '${sn}' and part_id = ${part_id};`;

    console.log(sql);

    if (newAmount == 0) {
      sql += `delete from spareparts where part_id = ${part_id};`;
      connection.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.status(200).send();
      });
    } else {
      sql += `update spareparts set amount = ${newAmount} where part_id = ${part_id};`;
      connection.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.status(200).send();
      });
    }
  });
});

//find data about stock of specific parts
router.get("/stock", (req, res) => {
  //recive parameter "cat_id": INT
  // return 400 if no parameters is passed OR is empty
  // return 400 if any of parameters does not match regEx
  // return 404 if cannot find anything
  // return 500 if there was DB error
  // return 200 with
  // {"cat_id": INT, "totalAmount": INT}

  let query = req.query;

  if (!query.cat_id || query.cat_id == 0)
    return res
      .status(400)
      .json({ message: "podaj id kategorii do wyszukania" });

  let reg = /^([0-9]){1,}$/;
  if (!reg.test(query.cat_id))
    return res
      .status(400)
      .json({ message: "nieprawidłowy format pola cat_id" });

  let sql = `select cat_id, sum(amount) as 'totalAmount' 
    from spareparts s where cat_id = ${query.cat_id} group by cat_id;`;

  connection.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (rows.length == 0)
      return res.status(404).json({
        message: "nieznaleziono części na magazynie dla podanych kryteriów",
      });

    res.status(200).json({
      cat_id: rows[0].cat_id,
      totalAmount: rows[0].totalAmount,
    });
  });
});

// find all data about specific part
router.get("/", (req, res) => {
  // recive one or more of parameters "producer": STRING, "category": STRING, "name": STRING, "cat_id": INT
  // return 400 if no parameter is passed OR is empty
  // return 400 if any of parameters does not match regEx
  // return 404 if cannot find anything
  // return 500 if there was DB error
  // return 200 with
  // {"cat_id": {"part":{"category": STRING, "cat_id": INT, "producer": STRING, "name": STRING}, "warehouse": {shelves: [INT, ...], totalAmount: INT, parts_id: [INT, ...]}},

  let query = req.query;

  if (Object.keys(query).length == 0)
    return res
      .status(400)
      .json({ message: "podaj przynajmniej jedną wartość do wyszukania" });

  let statement = "";
  let conditions = 0;
  let onlyOneStatement = false;

  if (query.cat_id) {
    let reg = /^([1-9]{1})([0-9]{0,})$/;
    if (!reg.test(query.cat_id))
      return res
        .status(400)
        .json({ message: "nieprawidłowy format pola cat_id" });
    statement = `sc.part_cat_id = ${query.cat_id}`;
    onlyOneStatement = true;
    conditions = 1;
  }

  if (query.producer && !onlyOneStatement) {
    let reg = /^([A-ż 0-9'"-]{2,})$/;
    if (!reg.test(query.producer))
      return res
        .status(400)
        .json({ message: "nieprawidłowy format pola producer" });

    statement += `sc.producer like '%${query.producer.trim().toLowerCase()}%'`;
    conditions += 1;
  }

  if (query.category && !onlyOneStatement) {
    let reg = /^([A-ż 0-9'"-]{2,})$/;
    if (!reg.test(query.category))
      return res
        .status(400)
        .json({ message: "nieprawidłowy format pola category" });

    if (conditions > 0) {
      statement += ` and sc.category like '%${query.category
        .trim()
        .toLowerCase()}%'`;
    } else {
      statement += `sc.category like '%${query.category
        .trim()
        .toLowerCase()}%'`;
    }

    conditions += 1;
  }

  if (query.name && !onlyOneStatement) {
    let reg = /^([A-ż,. ()0-9'"-]{2,})$/;
    if (!reg.test(query.name))
      return res
        .status(400)
        .json({ message: "nieprawidłowy format pola name" });

    if (conditions > 0) {
      statement += ` and sc.name like '%${query.name.trim().toLowerCase()}%'`;
    } else {
      statement += `sc.name like '%${query.name.trim().toLowerCase()}%'`;
    }

    conditions += 1;
  }

  // if (query.amount || query.amount == 0) {
  //     let reg = /^([0-9]{1,})$/
  //     if (!reg.test(query.amount)) return res.status(400).json({ "message": "nieprawidłowy format pola amount" })

  //     if (conditions > 0) {
  //         statement += ` and spareparts.amount <= ${query.amount}`
  //     } else {
  //         statement += `spareparts.amount <= ${query.amount}`
  //     }

  //     conditions += 1
  // }

  if (conditions == 0)
    return res
      .status(400)
      .json({ message: "podaj przynajmniej jedną wartość do wyszukania" });

  // let sql_findPart = `select distinct category, producer, name, IFNULL(amount, 0) as 'amount', part_cat_id, part_id
  //   from spareparts_cat left join spareparts on spareparts_cat.part_cat_id = spareparts.cat_id
  //   where ${statement}`;

  let sql_findPart = `select distinct sc.category, sc.producer, sc.name, sc.part_cat_id, s.part_id,
	ss.codes, ss.shelve
    from spareparts_cat sc 
    left join spareparts s on sc.part_cat_id = s.cat_id
    left join spareparts_sn ss on s.part_id = ss.part_id
   	where ${statement}`;

  console.log(sql_findPart);

  connection.query(sql_findPart, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (rows.length == 0)
      return res
        .status(404)
        .json({ message: "nieznaleziono części dla podanych kryteriów" });

    let output = {};
    console.log(rows);
    rows.forEach((el) => {
      if ("cat_" + el.part_cat_id in output) {
        // if (
        //   !output["cat_" + el.part_cat_id].warehouse.shelves.includes(el.shelve)
        // ) {
        output["cat_" + el.part_cat_id].warehouse.shelves.push(el.shelve);
        //}

        // if (
        //   !output["cat_" + el.part_cat_id].warehouse.parts_id.includes(
        //     el.part_id
        //   )
        // ) {
        output["cat_" + el.part_cat_id].warehouse.parts_id.push(el.part_id);
        //}

        //output["cat_" + el.part_cat_id].warehouse.stock.push(el.amount);
        if (el.codes !== null) {
          output["cat_" + el.part_cat_id].warehouse.totalAmount += 1;
          output["cat_" + el.part_cat_id].warehouse.codes.push(el.codes);
        }
      } else {
        let part = {
          category: el.category,
          cat_id: el.part_cat_id,
          producer: el.producer,
          name: el.name,
        };
        let partAmount = 0;
        if (el.codes !== null) {
          partAmount = 1;
        }
        let warehouse = {
          shelves: [el.shelve],
          totalAmount: partAmount,
          parts_id: [el.part_id],
          codes: [el.codes],
          // stock: [el.amount],
        };
        output["cat_" + el.part_cat_id] = {
          part: part,
          warehouse: warehouse,
        };
      }
    });

    res.status(200).json(output);
  });
});

//find all data about specific part by SN
router.get("/code", (req, res) => {
  // recive one parameter "codes": STR
  // return 400 if no parameter is passed OR is empty
  // return 404 if cannot find anything
  // return 500 if there was DB error
  // return 200 with
  // {"part":{"category": STRING, "cat_id": INT, "producer": STRING, "name": STRING}, "warehouse": {"shelve": INT, "part_id": INT, codes: STRING }},

  if (!req.query.codes || req.query.codes == "") {
    return res
      .status(400)
      .json({ message: "podaj przynajmniej jedną wartość do wyszukania" });
  }

  let sql = `select ss.codes, ss.shelve, s.part_id, sc.part_cat_id, sc.category, sc.producer, sc.name from spareparts_sn ss 
  join spareparts s
  on ss.part_id = s.part_id 
  join spareparts_cat sc 
  on s.cat_id = sc.part_cat_id
  where ss.codes = '${req.query.codes}'`;

  connection.query(sql, (err, rows) => {
    if (err) res.status(500).json(err);

    if (rows.length === 0)
      return res
        .status(404)
        .json({ message: "nieznaleziono części dla podanych kryteriów" });

    let part = rows[0];

    let output = {};

    let item = {
      part: {
        category: part.category,
        cat_id: part.part_cat_id,
        producer: part.producer,
        name: part.name,
      },
      warehouse: {
        shelve: part.shelve,
        part_id: part.part_id,
        codes: part.codes,
      },
    };

    output["cat_" + part.part_cat_id] = item;

    res.status(200).json(output);
  });
});

//get all categories
router.get("/categories", (req, res) => {
  let sql = `SELECT part_cat_id, producer, category, name FROM spareparts_cat`;

  connection.query(sql, function (err, rows) {
    if (err) res.status(500).json(err);
    res.status(200).json(rows);
  });
});

//get all suppliers
router.get("/suppliers", (req, res) => {
  let sql = `SELECT id, name FROM suppliers`;

  connection.query(sql, function (err, rows) {
    if (err) res.status(500).json(err);
    res.status(200).json(rows);
  });
});

//get all order statuses
router.get("/statuses", (req, res) => {
  let sql = `SELECT id, name FROM spareparts_orders_statuses`;

  connection.query(sql, function (err, rows) {
    if (err) res.status(500).json(err);
    res.status(200).json(rows);
  });
});

module.exports = router;
