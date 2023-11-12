import express, { Request, Response } from "express"
import database from "../../helpers/database"
const router = express.Router()

import checkIfCollectExists from "../../helpers/warehouse/collectPackages/checkIfCollectExists"
import changeWaybillStatus from "../../helpers/rma/waybills/changeStatus"
import getWaybillsFromCollect from "../../helpers/warehouse/collectPackages/getWaybillsFromCollect"
import changeTicketStaus from "../../app/helpers/changeTicketStatus"
import endCollect from "../../helpers/warehouse/collectPackages/endCollect"
import registerNewItem from "../../app/helpers/registerNewItem"

interface findCollect_reqQueryI {
  refName: string
  created: string
}

//get list of collects with optional filters
router.get(
  "/",
  (req: Request<{}, {}, {}, findCollect_reqQueryI>, res: Response) => {
    //recive optional parameters: refName: STR, created: DATE
    //if no params were passed whole table is returned
    //return 400 if there is no records
    //return 500 on DB erorr
    //return 200 with {id: INT, ref_name: STR, status: STR, created: DATE}

    let filters = ""

    if (req.query.refName !== undefined && req.query.refName !== "") {
      filters += `ref_name like ${database.escape(req.query.refName + "%")}`
    }

    if (req.query.created !== undefined && req.query.created !== "") {
      if (filters.length > 0) filters += " AND "
      filters += `created = ${database.escape(req.query.created)}`
    }

    let sql = `SELECT pc.id, pc.ref_name, pc.created, pcs.name as 'status' from packageCollect pc join packageCollect_statuses pcs on pc.status = pcs.id`
    if (filters.length > 0) sql += ` WHERE ` + filters

    database.query(sql, (err, rows) => {
      if (err) return res.status(500).json(err)
      if (rows.length === 0) return res.status(404).json([])
      return res.status(200).json(rows)
    })
  }
)

//get details of one collect
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
          return res.status(404).json({ message: "Brak odbioru o podanym ID" })
        }

        let sql = `SELECT pc.id, pc.ref_name, pc.created, pcs.name as 'status', pci.waybill, pci.ticket_id, 
        concat(t.ticket_id, '-', t.device_producer, '-', t.device_cat) as 'barcode'
      from packageCollect pc 
      join packageCollect_statuses pcs on pc.status = pcs.id
      left join packageCollect_items pci on pc.id = pci.collect_id
      left join tickets t on pci.ticket_id = t.ticket_id
      WHERE pc.id = ${database.escape(req.params.id)}`

        // console.log(sql);

        database.query(sql, (err, result) => {
          if (err) return res.status(500).json(err)

          // console.log(result);

          let collectData = {
            id: result[0].id,
            ref_name: result[0].ref_name,
            created: result[0].created,
            status: result[0].status,
          }

          let itemsData = result.map((o: any) => {
            return {
              waybill: o.waybill,
              ticket_id: o.ticket_id,
              barcode: o.barcode,
            }
          })
          if (itemsData[0].waybill === null) itemsData = []

          return res.status(200).json({
            ...collectData,
            items: itemsData,
          })
        })
      })
      .catch((e) => res.status(500).json(e))
  }
)

//Change waybills statuses.
//ChangeStatus of collect.
//Change tickets statuses.
//Register products in warehouse
router.put(
  "/:id",
  (req: Request<{ id: string }, {}, {}, {}>, res: Response) => {
    //recive id in params
    //recive body {newStatus: INT}
    //return 400 if newStatus is missing
    //return 404 if collection does not exitst
    //return 500 on DB error
    //return 200 on success

    //check if collect exists
    checkIfCollectExists(req.params.id)
      .then(function (rows: any) {
        //collect does not exits, return 404
        if (rows.length === 0) {
          return res.status(404).json({ message: "Brak odbioru o podanym ID" })
        }
        if (rows[0].status === 2) {
          return res
            .status(400)
            .json({ message: "Podany odbiór został już odebrany" })
        }

        //getAllWaybills for collect
        getWaybillsFromCollect(req.params.id).then(function (items: any) {
          for (let {
            id,
            waybill,
            ticket_id,
            device_producer,
            device_cat,
            device_sn,
          } of items) {
            //change waybill status foreach waybill
            changeWaybillStatus(waybill, "odebrany").then(function () {
              //change collect status
              endCollect(req.params.id).then(function () {
                //change ticket status for each waybill
                changeTicketStaus(ticket_id, 3).then(function () {
                  //register item in warehouse foreach ticket
                  registerNewItem(
                    ticket_id,
                    device_producer,
                    device_cat,
                    device_sn
                  )
                })
              })
            })
          }
          res.status(200).json({})
        })
      })
      .catch((error) => res.status(error[0]).json(error[1]))
  }
)

export default router
