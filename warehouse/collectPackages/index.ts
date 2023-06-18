import express, { Request, Response } from "express";
import database from "../../helpers/database";
const router = express.Router();

import checkIfCollectExists from "../../helpers/collectPackages/checkIfCollectExists";

interface findCollect_reqQueryI {
  refName: string;
  created: string;
}

router.get(
  "/",
  (req: Request<{}, {}, {}, findCollect_reqQueryI>, res: Response) => {
    //recive optional parameters: refName: STR, created: DATE
    //if no params were passed whole table is returned
    //return 400 if there is no records
    //return 500 on DB erorr
    //return 200 with {id: INT, ref_name: STR, status: STR, created: DATE}

    let filters = "";

    if (req.query.refName !== undefined && req.query.refName !== "") {
      filters += `ref_name like ${database.escape(req.query.refName + "%")}`;
    }

    if (req.query.created !== undefined && req.query.created !== "") {
      if (filters.length > 0) filters += " AND ";
      filters += `created = ${database.escape(req.query.created)}`;
    }

    let sql = `SELECT pc.id, pc.ref_name, pc.created, pcs.name from packageCollect pc join packageCollect_statuses pcs on pc.status = pcs.id`;
    if (filters.length > 0) sql += ` WHERE ` + filters;

    database.query(sql, (err, rows) => {
      if (err) return res.status(500).json(err);
      if (rows.length === 0) return res.status(404).json([]);
      return res.status(200).json(rows);
    });
  }
);

router.get(
  "/:id",
  (req: Request<{ id: string }, {}, {}, {}>, res: Response) => {
    //recive id in params
    //return 404 if collection does not exitst
    //return 500 on DB error
    //return 200 with {id: INT, ref_name: STR, status: STR, created: DATE, items: [STR, STR...]}

    checkIfCollectExists(req.params.id)
      .then(function (rows: any) {
        if (rows.length === 0) {
          return res.status(404).json({ message: "Brak odbioru o podanym ID" });
        }

        let sql = `SELECT pc.id, pc.ref_name, pc.created, pcs.name as 'status', pci.waybill 
      from packageCollect pc 
      join packageCollect_statuses pcs on pc.status = pcs.id
      left join packageCollect_items pci on pc.id = pci.collect_id
      WHERE pc.id = ${database.escape(req.params.id)}`;

        // console.log(sql);

        database.query(sql, (err, result) => {
          if (err) return res.status(500).json(err);

          // console.log(result);

          let collectData = {
            id: result[0].id,
            ref_name: result[0].ref_name,
            created: result[0].created,
            status: result[0].status,
          };

          let itemsData = result.map((o: any) => o.waybill);
          if (itemsData[0] === null) itemsData = [];

          return res.status(200).json({
            ...collectData,
            items: itemsData,
          });
        });
      })
      .catch((e) => res.status(500).json(e));
  }
);

router.put(
  "/:id",
  (
    req: Request<{ id: string }, {}, { newStatus: string }, {}>,
    res: Response
  ) => {
    //recive id in params
    //recive body {newStatus: INT}
    //return 400 if newStatus is missing
    //return 500 on DB error
    //return 200 on success

    if (
      req.body.newStatus === undefined ||
      req.body.newStatus === null ||
      req.body.newStatus === ""
    ) {
      return res.status(404).json({ message: "Pole newStatus jest wymagane" });
    }

    if (parseInt(req.body.newStatus) < 1 || parseInt(req.body.newStatus) > 3) {
      return res
        .status(404)
        .json({ message: "Pole newStatus jest spoza zakresu" });
    }

    checkIfCollectExists(req.params.id)
      .then(function (rows: any) {
        if (rows.length === 0) {
          return res.status(404).json({ message: "Brak odbioru o podanym ID" });
        }

        let sql = `update packageCollect set status = ${database.escape(
          req.body.newStatus
        )} where id = ${database.escape(req.params.id)};`;

        database.query(sql, (err) => {
          if (err) return res.status(500).json(err);
          return res.status(200).json({});
        });
      })
      .catch((e) => res.status(500).json(e));
  }
);

export default router;
