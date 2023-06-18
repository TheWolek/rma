import express, { Request, Response } from "express";
import database from "../../helpers/database";
const router = express.Router();

import { addCollect_reqBodyI } from "../../utils/constants/collectPackages/interfaces";
import { addCollectValidator } from "../../helpers/warehouse/collectPackages/validators";

router.post(
  "/",
  (req: Request<{}, {}, addCollect_reqBodyI, {}>, res: Response) => {
    //recive {refName: STR}
    //return 400 if refName is missing
    //return 500 on DB error
    //return 200 with {collectId: INT}

    const validatorStatus = addCollectValidator(req.body.refName);

    if (!validatorStatus[0]) {
      return res.status(400).json(validatorStatus[1]);
    }

    const sql = `INSERT INTO packageCollect (ref_name, status) VALUES (${database.escape(
      req.body.refName
    )}, 1)`;

    database.query(sql, (err, result) => {
      if (err) return res.status(500).json(err);

      return res.status(200).json({ collectId: result.insertedId });
    });
  }
);

export default router;
