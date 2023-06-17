import express, { Request, Response } from "express";
import database from "../../helpers/database";
const router = express.Router();

function getTasksLists(type: string) {
  return new Promise(function (resolve, reject) {
    let sql_fetchTypes = `select wtl.id, wtl.name, wtl.displayName, wtl.shelve_out, wtl.shelve_in from warehouse_tasks_lists wtl WHERE wtl.type = ${database.escape(
      type
    )}`;
    database.query(sql_fetchTypes, function (err, rows) {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

router.get(
  "/:type",
  (req: Request<{ type: string }, {}, {}, {}>, res: Response) => {
    //recive type in params: INT
    //return 500 on DB error
    //return 200 with [{id: INT, name: STR}]

    getTasksLists(req.params.type)
      .then(async function (rows: any) {
        let queries = [];

        for (const el of rows) {
          const sql_fetchOne = `select count(*) as active from ${el.name}`;
          const query = new Promise((resolve, reject) => {
            database.query(sql_fetchOne, (err, rows) => {
              if (err) reject(err);
              resolve({
                id: el.id,
                displayName: el.displayName,
                name: el.name,
                shelve_out: el.shelve_out,
                shelve_in: el.shelve_in,
                active: rows[0].active,
              });
            });
          });
          queries.push(query);
        }

        const results = await Promise.all(queries);

        return res.status(200).json(results);
      })
      .catch((e) => res.status(500).json(e));
  }
);

router.get(
  "/:taskName/tasks",
  (req: Request<{ taskName: string }, {}, {}, {}>, res: Response) => {
    let sql = `SELECT item_id, barcode from ${req.params.taskName};`;

    database.query(sql, (err, rows) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(rows);
    });
  }
);

export default router;
