import express, { Request, Response } from "express";
import database from "../../helpers/database";
const router = express.Router();

import checkIfCollectExists from "../../helpers/collectPackages/checkIfCollectExists";

router.post(
  "/:id/add",
  (
    req: Request<{ id: string }, {}, { waybill: string }, {}>,
    res: Response
  ) => {
    //recive id in params
    //recive body {waybill: STR}
    //return 400 if waybill is missing or wrong format
    //return 404 if collection does not exits
    //return 404 if waybill is not linked to rma ticket
    //return 500 on DB error
    //return 200 with {ticket_id: INT, barcode: STR, wabill: STR}

    if (
      req.body.waybill === undefined ||
      req.body.waybill === null ||
      req.body.waybill === ""
    ) {
      return res.status(404).json({ message: "Pole waybill jest wymagane" });
    }

    if (typeof req.body.waybill !== "string")
      return res.status(404).json({ message: "błędny format pola waybill" });

    checkIfCollectExists(req.params.id)
      .then(function (rows: any) {
        if (rows.length === 0)
          return res.status(404).json({ message: "Brak odbioru o podanym ID" });

        if (rows[0].status === 3)
          return res
            .status(404)
            .json({ message: "Podany odbiór został odebrany" });

        let sql_select = `SELECT t.ticket_id, concat(t.ticket_id, '-', t.device_producer, '-', t.device_cat) as 'barcode', w.waybill_number 
        from waybills w join tickets t on t.ticket_id = w.ticket_id where w.waybill_number = ${database.escape(
          req.body.waybill
        )} and w.type = 'przychodzący' and w.status = 'potwierdzony';`;
        let sql_insert = `INSERT INTO packageCollect_items (collect_id, waybill) VALUES (${database.escape(
          req.params.id
        )}, ${database.escape(req.body.waybill)})`;

        database.query(sql_select, (err, rows) => {
          if (err) return res.status(500).json(err);
          if (rows.length === 0)
            return res.status(404).json({
              message: "Nie znaleziono zgłoszenia z podanym listem przewozowym",
            });

          database.query(sql_insert, (err) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json({
              ticket_id: rows[0].ticket_id,
              barcode: rows[0].barcode,
              waybill: req.body.waybill,
            });
          });
        });
      })
      .catch((e) => res.status(500).json(e));
  }
);

router.put(
  "/:id",
  (
    req: Request<{ id: string }, {}, { items: Array<string> }, {}>,
    res: Response
  ) => {
    //recive id in params
    //recive body {items: [STR, STR]}
    //return 400 if items is missing or wrong type
    //return 404 if collection does not exitst
    //return 500 on DB error
    //return 200 with {items: [STR, STR...]}

    if (
      req.body.items === undefined ||
      req.body.items === null ||
      !Array.isArray(req.body.items)
    ) {
      return res.status(404).json({ message: "Pole items jest wymagane" });
    }

    let good = true;

    req.body.items.forEach((el: string) => {
      if (el.length <= 0) good = false;
      if (typeof el !== "string") good = false;
    });

    if (!good) {
      return res.status(404).json({ message: "błędny format pola items" });
    }

    checkIfCollectExists(req.params.id)
      .then(function (rows: any) {
        if (rows.length === 0) {
          return res.status(404).json({ message: "Brak odbioru o podanym ID" });
        }

        if (rows[0].status === 3)
          return res
            .status(404)
            .json({ message: "Podany odbiór został odebrany" });

        let sql_delete = `DELETE FROM packageCollect_items WHERE collect_id = ${database.escape(
          req.params.id
        )};`;
        let sql_insert = `INSERT INTO packageCollect_items (collect_id, waybill) VALUES `;
        let sql_select = `SELECT waybill from packageCollect_items WHERE collect_id = ${database.escape(
          req.params.id
        )};`;

        if (req.body.items.length > 0) {
          req.body.items.forEach((el: string, index: number) => {
            if (index > 0) sql_insert += ", ";
            sql_insert += `(${database.escape(req.params.id)},${database.escape(
              el
            )})`;
          });

          sql_insert += ";";
        }

        let sql = "";
        if (req.body.items.length === 0) {
          sql = sql_delete;
        } else {
          sql = sql_delete + sql_insert;
        }

        database.query(sql, (err) => {
          if (err) return res.status(500).json(err);
          database.query(sql_select, (err, result) => {
            if (err) return res.status(500).json(err);
            return res
              .status(200)
              .json(result.map((o: { waybill: string }) => o.waybill));
          });
        });
      })
      .catch((e) => res.status(500).json(e));
  }
);

export default router;
