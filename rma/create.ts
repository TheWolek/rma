import express, { Express, Request, Response, Router } from "express";
import database from "../helpers/database";
const router = express.Router();

interface create_reqBodyI {
  email: string;
  name: string;
  phone: string;
  type: string;
  deviceSn: string;
  deviceName: string;
  deviceProducer: string;
  deviceCat: string;
  deviceAccessories: Array<number>;
  issue: string;
  lines: string;
  postCode: string;
  city: string;
  damageType: number;
}

router.post("/", (req: Request<{}, {}, create_reqBodyI, {}>, res) => {
  //recive {email: STR, name: STR, phone: STR, deviceSn: STR, deviceName: STR, deviceCat: STR, deviceProducer: STR, deviceAccessories: STR (optional), issue: STR, lines: STR, postCode: STR, city: STR}
  //return 400 if any of required params are missing
  //return 400 if any of passed params is in wrong format
  //return 500 if there is DB error
  //return 200 with ticketId

  if (
    req.body.email === undefined ||
    req.body.email === null ||
    req.body.email.length === 0
  ) {
    return res.status(400).json({ Message: "Pole email jest wymagane" });
  }
  if (
    req.body.name === undefined ||
    req.body.name === null ||
    req.body.name.length === 0
  ) {
    return res.status(400).json({ Message: "Pole name jest wymagane" });
  }
  if (
    req.body.phone === undefined ||
    req.body.phone === null ||
    req.body.phone.length === 0
  ) {
    return res.status(400).json({ Message: "Pole phone jest wymagane" });
  }
  if (
    req.body.deviceSn === undefined ||
    req.body.deviceSn === null ||
    req.body.deviceSn.length === 0
  ) {
    return res.status(400).json({ Message: "Pole deviceSn jest wymagane" });
  }
  if (
    req.body.deviceName === undefined ||
    req.body.deviceName === null ||
    req.body.deviceName.length === 0
  ) {
    return res.status(400).json({ Message: "Pole deviceName jest wymagane" });
  }
  if (
    req.body.deviceCat === undefined ||
    req.body.deviceCat === null ||
    req.body.deviceCat.length === 0
  ) {
    return res.status(400).json({ Message: "Pole deviceCat jest wymagane" });
  }
  if (
    req.body.deviceProducer === undefined ||
    req.body.deviceProducer === null ||
    req.body.deviceProducer.length === 0
  ) {
    return res
      .status(400)
      .json({ Message: "Pole deviceProducer jest wymagane" });
  }
  if (
    req.body.deviceAccessories === undefined ||
    req.body.deviceAccessories === null
  ) {
    return res
      .status(400)
      .json({ Message: "Pole deviceAccessories jest wymagane" });
  }
  if (
    req.body.issue === undefined ||
    req.body.issue === null ||
    req.body.issue.length === 0
  ) {
    return res.status(400).json({ Message: "Pole issue jest wymagane" });
  }
  if (
    req.body.lines === undefined ||
    req.body.lines === null ||
    req.body.lines.length === 0
  ) {
    return res.status(400).json({ Message: "Pole lines jest wymagane" });
  }
  if (
    req.body.postCode === undefined ||
    req.body.postCode === null ||
    req.body.postCode.length === 0
  ) {
    return res.status(400).json({ Message: "Pole postCode jest wymagane" });
  }
  if (
    req.body.city === undefined ||
    req.body.city === null ||
    req.body.city.length === 0
  ) {
    return res.status(400).json({ Message: "Pole city jest wymagane" });
  }
  if (req.body.damageType === undefined || req.body.damageType === null) {
    return res.status(400).json({ Message: "Pole damageType jest wymagane" });
  }

  const regString = /^([a-żA-Ż0-9 ]){2,}$/;
  const regEmail = /^(.){1,}@(.){1,}\.([A-z]){1,}$/;
  const regNumber = /^([0-9]{9})$/;
  const regLines = /^([a-żA-Ż0-9/. ]){2,}([1-9]){0,}([0-9]){1,}$/;
  const regPostCode = /^([0-9]){2}-([0-9]){3}$/;

  if (!regEmail.test(req.body.email)) {
    return res.status(400).json({ Message: "zły format pola email" });
  }
  if (!regString.test(req.body.name)) {
    return res.status(400).json({ Message: "zły format pola name" });
  }
  if (!regNumber.test(req.body.phone)) {
    return res.status(400).json({ Message: "zły format pola phone" });
  }
  if (!regLines.test(req.body.lines)) {
    return res.status(400).json({ Message: "zły format pola lines" });
  }
  if (!regPostCode.test(req.body.postCode)) {
    return res.status(400).json({ Message: "zły format pola postCode" });
  }
  if (!regString.test(req.body.city)) {
    return res.status(400).json({ Message: "zły format pola city" });
  }

  let sql = `insert into tickets (email, name, phone, device_sn, device_name, device_cat, device_producer, type, issue, status, \`lines\`, postCode, city, damage_type) VALUES \
      ("${req.body.email}", "${req.body.name}", "${req.body.phone}", "${req.body.deviceSn}", "${req.body.deviceName}", "${req.body.deviceCat}", "${req.body.deviceProducer}", ${req.body.type}, "${req.body.issue}", 1, "${req.body.lines}", "${req.body.postCode}", "${req.body.city}", ${req.body.damageType})`;

  let sql_accesories = `insert into tickets_additionalAccessories (ticket_id, type_id) VALUES `;

  database.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);

    const ticket_id = result.insertId;
    req.body.deviceAccessories.forEach((el: number, index: number) => {
      if (index > 0) sql_accesories += ",";
      sql_accesories += `(${ticket_id}, ${el})`;
    });

    database.query(sql_accesories, (err, result) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ ticketId: ticket_id });
    });
  });
});

export default router;