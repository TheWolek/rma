import express, { Express, Request, Response } from "express";
import database from "../helpers/database";
const router = express.Router();
// const express = require("express");
// const database = require("../helpers/database");

router.get("/damagesTypes", (req: Request, res: Response) => {
  let query = `SELECT * from tickets_damage_types`;
  database.query(query, (err, rows) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(rows);
  });
});

router.get("/accessoriesTypes", (req: Request, res: Response) => {
  let query = `SELECT * from tickets_aditionalAccessories_types`;
  database.query(query, (err, rows) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(rows);
  });
});

export default router;
