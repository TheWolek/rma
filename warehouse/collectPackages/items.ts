import express, { Request, Response } from "express";
import database from "../../helpers/database";
const router = express.Router();

import checkIfCollectExists from "../../helpers/warehouse/collectPackages/checkIfCollectExists";
import { addCollectItemValidator } from "../../helpers/warehouse/collectPackages/validators";

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

    const validatorStatus = addCollectItemValidator(req.body.waybill);

    if (!validatorStatus[0]) {
      return res.status(400).json(validatorStatus[1]);
    }

    checkIfCollectExists(req.params.id)
      .then(function (rows: any) {
        if (rows.length === 0)
          return res.status(404).json({ message: "Brak odbioru o podanym ID" });

        if (rows[0].status === 2)
          return res
            .status(404)
            .json({ message: "Podany odbiór został już odebrany" });

        let sql_select = `SELECT t.ticket_id, concat(t.ticket_id, '-', t.device_producer, '-', t.device_cat) as 'barcode', w.waybill_number 
        from waybills w join tickets t on t.ticket_id = w.ticket_id where w.waybill_number = ${database.escape(
          req.body.waybill
        )} and w.type = 'przychodzący' and w.status = 'potwierdzony';`;

        database.query(sql_select, (err, rows) => {
          if (err) return res.status(500).json(err);
          if (rows.length === 0)
            return res.status(404).json({
              message: "Nie znaleziono zgłoszenia z podanym listem przewozowym",
            });

          let sql_insert = `INSERT INTO packageCollect_items (collect_id, waybill, ticket_id) VALUES (${database.escape(
            req.params.id
          )}, ${database.escape(req.body.waybill)}, ${database.escape(
            rows[0].ticket_id
          )})`;

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

interface itemI {
  waybill: string;
  ticket_id: number;
}

interface editItem_reqBodyI {
  items: itemI[];
}

router.put(
  "/:id",
  (req: Request<{ id: string }, {}, editItem_reqBodyI, {}>, res: Response) => {
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

    req.body.items.forEach(({ waybill, ticket_id }) => {
      if (waybill.length <= 0) good = false;
      if (typeof waybill !== "string") good = false;
      if (typeof ticket_id !== "number") good = false;
      if (ticket_id < 1) good = false;
    });

    if (!good) {
      return res.status(404).json({ message: "błędny format pola items" });
    }

    checkIfCollectExists(req.params.id)
      .then(function (rows: any) {
        if (rows.length === 0) {
          return res.status(404).json({ message: "Brak odbioru o podanym ID" });
        }

        if (rows[0].status === 2)
          return res
            .status(404)
            .json({ message: "Podany odbiór został już odebrany" });

        let sql_delete = `DELETE FROM packageCollect_items WHERE collect_id = ${database.escape(
          req.params.id
        )};`;
        let sql_insert = `INSERT INTO packageCollect_items (collect_id, waybill, ticket_id) VALUES `;
        let sql_select = `SELECT waybill from packageCollect_items WHERE collect_id = ${database.escape(
          req.params.id
        )};`;

        if (req.body.items.length > 0) {
          req.body.items.forEach((el: itemI, index: number) => {
            if (index > 0) sql_insert += ", ";
            sql_insert += `(${database.escape(req.params.id)},${database.escape(
              el.waybill
            )}, ${database.escape(el.ticket_id)})`;
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
