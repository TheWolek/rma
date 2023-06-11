import express, { Express, Request, Response } from "express";
import database from "../helpers/database";
const router = express.Router();

router.get("/damagesTypes", (req: Request, res: Response) => {
  let query = `SELECT * from tickets_damage_types`;
  database.query(query, (err, rows) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(rows);
  });
});

router.put(
  "/damagesTypes",
  (
    req: Request<{}, {}, { id: number; newValue: string }, {}>,
    res: Response
  ) => {
    if (req.body.id === undefined || req.body.id === 0)
      return res.status(400).json({ message: "Pole id jest wymagane" });
    if (req.body.newValue === undefined || req.body.newValue === "")
      return res.status(400).json({ message: "Pole newValue jest wymagane" });

    let sql = `UPDATE tickets_damage_types SET name = '${req.body.newValue}' WHERE id = ${req.body.id}`;
    database.query(sql, (err, result) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({});
    });
  }
);

router.get("/accessoriesTypes", (req: Request, res: Response) => {
  let query = `SELECT * from tickets_aditionalAccessories_types`;
  database.query(query, (err, rows) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(rows);
  });
});

router.put(
  "/accessoriesTypes",
  (
    req: Request<{}, {}, { id: number; newValue: string }, {}>,
    res: Response
  ) => {
    if (req.body.id === undefined || req.body.id === 0)
      return res.status(400).json({ message: "Pole id jest wymagane" });
    if (req.body.newValue === undefined || req.body.newValue === "")
      return res.status(400).json({ message: "Pole newValue jest wymagane" });

    let sql = `UPDATE tickets_aditionalAccessories_types SET name = '${req.body.newValue}' WHERE id = ${req.body.id}`;
    database.query(sql, (err, result) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({});
    });
  }
);

router.get("/statusesTypes", (req: Request, res: Response) => {
  let query = `SELECT * from tickets_statuses_types`;
  database.query(query, (err, rows) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(rows);
  });
});

router.put(
  "/statusesTypes",
  (
    req: Request<{}, {}, { id: number; newValue: string }, {}>,
    res: Response
  ) => {
    if (req.body.id === undefined || req.body.id === 0)
      return res.status(400).json({ message: "Pole id jest wymagane" });
    if (req.body.newValue === undefined || req.body.newValue === "")
      return res.status(400).json({ message: "Pole newValue jest wymagane" });

    let sql = `UPDATE tickets_statuses_types SET name = '${req.body.newValue}' WHERE id = ${req.body.id}`;
    database.query(sql, (err, result) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({});
    });
  }
);

router.get("/resultTypes", (req: Request, res: Response) => {
  let query = `SELECT * from tickets_result_types`;
  database.query(query, (err, rows) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(rows);
  });
});

router.put(
  "/resultTypes",
  (
    req: Request<{}, {}, { id: number; newValue: string }, {}>,
    res: Response
  ) => {
    if (req.body.id === undefined || req.body.id === 0)
      return res.status(400).json({ message: "Pole id jest wymagane" });
    if (req.body.newValue === undefined || req.body.newValue === "")
      return res.status(400).json({ message: "Pole newValue jest wymagane" });

    let sql = `UPDATE tickets_result_types SET name = '${req.body.newValue}' WHERE id = ${req.body.id}`;
    database.query(sql, (err, result) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({});
    });
  }
);

export default router;
