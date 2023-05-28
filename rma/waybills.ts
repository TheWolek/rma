import express, { Express, Request, Response, Router } from "express";
import database from "../helpers/database";
// import { MysqlError } from "mysql";
import formatDateAndHours from "../utils/formatDateAndHours";
const router = express.Router();

interface getWaybills_reqQueryI {
  waybillNumber: string;
  ticketId: string;
}

interface Waybill_reqBodyI {
  waybillNumber: string;
  ticketId: number;
  type: string;
  status: string;
}

router.get("/", (req: Request<{}, {}, {}, getWaybills_reqQueryI>, res) => {
  //recive ticketId or waybilNumber in query
  //return 400 if no param was passed
  //return 400 if both params were passed
  //return 404 if no waybill was found
  //return 500 on DB error
  //return 200 with array of waybills on success

  let isWaybillNumber =
    req.query.waybillNumber !== undefined &&
    req.query.waybillNumber !== null &&
    req.query.waybillNumber !== "";
  let isTicketId =
    req.query.ticketId !== undefined &&
    req.query.ticketId !== null &&
    req.query.ticketId !== "";

  if (isWaybillNumber && isTicketId)
    return res.status(400).json({ message: "Podaj tylko jeden z parametrów" });
  if (!isWaybillNumber && !isTicketId)
    return res
      .status(400)
      .json({ message: "Podaj przynajmniej jeden parametr" });

  let sql = `SELECT * FROM waybills WHERE `;
  if (isTicketId) {
    sql += `ticket_id = ${req.query.ticketId}`;
  }

  if (isWaybillNumber) {
    sql += `waybill_number = ${req.query.waybillNumber}`;
  }

  database.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (rows.length === 0) return res.status(404).json([]);
    return res.status(200).json(rows);
  });
});

router.post("/", (req: Request<{}, {}, Waybill_reqBodyI, {}>, res) => {
  //recive {ticketId: INT, waybillNumber: STR, type: STR}
  //return 400 if any of params is missing
  //return 400 if type does not match
  //return 400 if ticketId does not match regEx
  //return 500 on DB error
  //return 200 on success

  if (req.body.ticketId === undefined || req.body.ticketId === null)
    return res.status(400).json({ message: "Pole ticketId jest wymagane" });
  if (
    req.body.waybillNumber == undefined ||
    req.body.waybillNumber == null ||
    req.body.waybillNumber == ""
  )
    return res
      .status(400)
      .json({ message: "Pole waybillNumber jest wymagane" });

  if (
    req.body.type === undefined ||
    req.body.type === null ||
    req.body.type === ""
  )
    return res.status(400).json({ message: "Pole type jest wymagane" });

  const typeReg = /^(przychodzący)$|^(wychodzący)$/;
  const ticketIdReg = /^([1-9]){1,}([0-9]){0,}$/;

  if (!typeReg.test(req.body.type))
    return res.status(400).json({ message: "Zły format pola type" });
  if (!ticketIdReg.test(req.body.ticketId.toString()))
    return res.status(400).json({ message: "Zły format pola ticketId" });

  let sql = `INSERT INTO waybills (waybill_number, ticket_id, status, type) VALUES ('${req.body.waybillNumber}', ${req.body.ticketId}, 'potwierdzony', '${req.body.type}')`;
  database.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({});
  });
});

router.put(
  "/:id",
  (req: Request<{ id: string }, {}, Waybill_reqBodyI, {}>, res) => {
    //recive id in param
    //recive body {waybillNumber: STR, status: STR, type: STR}
    //return 404 if waybill with passed id does not exists
    //return 400 if id does not match regEx
    //return 400 if status does not match regEx
    //return 400 if type does not match regEx
    //return 500 on DB erorr
    //return 200 on success

    if (
      req.params.id === undefined ||
      req.params.id === null ||
      req.params.id === ""
    )
      return res.status(400).json({ message: "Pole id jest wymagane" });

    if (
      req.body.waybillNumber === undefined ||
      req.body.waybillNumber === null ||
      req.body.waybillNumber === ""
    )
      return res
        .status(400)
        .json({ message: "Pole waybillNumber jest wymagane" });

    if (
      req.body.status === undefined ||
      req.body.status === null ||
      req.body.status === ""
    )
      return res.status(400).json({ message: "Pole status jest wymagane" });

    if (
      req.body.type === undefined ||
      req.body.type === null ||
      req.body.type === ""
    )
      return res.status(400).json({ message: "Pole type jest wymagane" });

    const statusReg = /^(potwierdzony)$|^(odebrany)$|^(anulowany)$/;
    const typeReg = /^(przychodzący)$|^(wychodzący)$/;
    const idReg = /^([1-9]){1,}([0-9]){0,}$/;

    if (!statusReg.test(req.body.status))
      return res.status(400).json({ message: "Zły format pola status" });

    if (!typeReg.test(req.body.type))
      return res.status(400).json({ message: "Zły format pola type" });

    if (!idReg.test(req.params.id))
      return res.status(400).json({ message: "Zły format pola id" });

    function checkIfWaybillExists(id: string) {
      return new Promise(function (resolve, reject) {
        let sql = `SELECT id FROM waybills WHERE id=${id};`;
        database.query(sql, function (err, rows) {
          if (err) return reject(err);
          resolve(rows);
        });
      });
    }

    checkIfWaybillExists(req.params.id).then(function (rows: any) {
      if (rows.length === 0)
        return res.status(404).json({ message: "Brak listu o podanym ID" });

      let currTimeStamp = formatDateAndHours(new Date());
      let sql = `UPDATE waybills SET waybill_number='${req.body.waybillNumber}', status='${req.body.status}', type='${req.body.type}', lastUpdate='${currTimeStamp}' WHERE id=${req.params.id};`;

      database.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json({});
      });
    });
  }
);

export default router;
