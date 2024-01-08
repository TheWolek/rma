import express, { Request, Response } from "express"
import throwGenericError from "../../../helpers/throwGenericError"
import validators from "./validators"
import CollectPackagesModel from "../../../models/warehouse/collectPackages/collectPackagesModel"
import auth, { Roles } from "../../../middlewares/auth"
import {
  CollectFilters,
  CollectItemRow,
  CollectTicketRow,
} from "../../../types/warehouse/collectPackages/collectPackages"
import checkIfCollectExists from "../../../helpers/collectPackages/checkIfCollectExists"
import getWaybillsFromCollect from "../../../helpers/collectPackages/getWaybillsFromCollect"
import changeWaybillStatus from "../../../helpers/waybills/changeStatus"
import endCollect from "../../../helpers/collectPackages/endCollect"
import changeTicketStaus from "../../../helpers/rma/changeTicketStatus"
import registerNewItem from "../../../helpers/items/registerNewItem"
import { connection } from "../../../models/dbProm"

class CollectPackagesController {
  public path = "/warehouse/collect"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.post(
      `${this.path}/add`,
      auth(Roles["CollectPackages"]),
      this.create
    )

    this.router.get(this.path, auth(Roles["CollectPackages"]), this.find)

    this.router.get(
      `${this.path}/:id`,
      auth(Roles["CollectPackages"]),
      this.findOne
    )

    this.router.put(
      `${this.path}/:id`,
      auth(Roles["CollectPackages"]),
      this.finalize
    )

    this.router.post(
      `${this.path}/items/:id/add`,
      auth(Roles["CollectPackages"]),
      this.addItem
    )

    this.router.put(
      `${this.path}/items/:id`,
      auth(Roles["CollectPackages"]),
      this.editItems
    )
  }

  private Model = new CollectPackagesModel()

  create = async (req: Request<{}, {}, { refName: string }>, res: Response) => {
    const { error } = validators.create.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    conn.beginTransaction()

    try {
      const dbResult = await this.Model.create(conn, req.body.refName)

      return res.status(200).json({ collectId: dbResult.insertId })
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  find = async (req: Request<{}, {}, {}, CollectFilters>, res: Response) => {
    const conn = await connection.getConnection()
    conn.beginTransaction()

    try {
      const rows = await this.Model.find(conn, req.query)

      return res.status(200).json(rows)
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  findOne = async (req: Request<{ id: string }>, res: Response) => {
    if (isNaN(parseInt(req.params.id))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ID")
    }

    const conn = await connection.getConnection()
    conn.beginTransaction()

    try {
      const rows = await this.Model.findOne(conn, Number(req.params.id))

      if (rows.length === 0) {
        return throwGenericError(res, 404, "Brak odbioru o podanym ID")
      }

      const collectData = {
        id: rows[0].id,
        ref_name: rows[0].ref_name,
        created: rows[0].created,
        status: rows[0].status,
      }

      let itemsData = rows.map((item) => {
        return {
          waybill: item.waybill,
          ticket_id: item.ticket_id,
          barcode: item.barcode,
        }
      })

      if (itemsData[0].waybill === null) {
        itemsData = []
      }

      return res.status(200).json({
        ...collectData,
        items: itemsData,
      })
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  finalize = async (req: Request, res: Response) => {
    if (isNaN(parseInt(req.params.id))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ID")
    }

    const conn = await connection.getConnection()
    conn.beginTransaction()

    try {
      const collect = await checkIfCollectExists(Number(req.params.id))

      if (collect.length === 0) {
        return throwGenericError(res, 404, "Brak odbioru o podanym ID")
      }

      if (collect[0].status === 2) {
        return throwGenericError(res, 400, "Podny odbiór został już odebrany")
      }

      const waybills = await getWaybillsFromCollect(Number(req.params.id))

      for (let {
        waybill,
        ticket_id,
        barcode,
        device_cat,
        device_producer,
        device_sn,
      } of waybills) {
        await changeWaybillStatus(waybill, "odebrany")
        await changeTicketStaus(ticket_id, 3)
        await registerNewItem({
          ticket_id,
          barcode,
          device_producer,
          device_cat,
          device_sn,
        })
      }

      await endCollect(Number(req.params.id))

      return res.status(200).json({})
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  addItem = async (
    req: Request<{ id: string }, {}, { waybill: string }>,
    res: Response
  ) => {
    if (isNaN(parseInt(req.params.id))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ID")
    }

    const { error } = validators.addItem.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    conn.beginTransaction()

    try {
      const collect = await checkIfCollectExists(Number(req.params.id))

      if (collect.length === 0) {
        return throwGenericError(res, 404, "Brak odbioru o podanym ID")
      }

      if (collect[0].status === 2) {
        return throwGenericError(res, 400, "Podany odbiór został już odebrany")
      }

      const row = (await this.Model.addItem(
        conn,
        Number(req.params.id),
        req.body.waybill
      )) as CollectTicketRow

      return res.status(200).json({
        ticket_id: row.ticket_id,
        barcode: row.barcode,
        waybill: req.body.waybill,
      })
    } catch (error) {
      if (typeof error === "string") {
        return throwGenericError(res, 400, error)
      }
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  editItems = async (
    req: Request<{ id: string }, {}, CollectItemRow[]>,
    res: Response
  ) => {
    if (isNaN(parseInt(req.params.id))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ID")
    }

    const { error } = validators.editItem.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    conn.beginTransaction()

    try {
      const collect = await checkIfCollectExists(Number(req.params.id))

      if (collect.length === 0) {
        return throwGenericError(res, 404, "Brak odbioru o podanym ID")
      }

      if (collect[0].status === 2) {
        return throwGenericError(res, 400, "Podany odbiór został już odebrany")
      }

      const items = await this.Model.editItems(
        conn,
        Number(req.params.id),
        req.body
      )

      return res.status(200).json(items)
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }
}

export default CollectPackagesController
