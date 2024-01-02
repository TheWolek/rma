import express, { Request, Response } from "express"
import throwGenericError from "../../../helpers/throwGenericError"
import { MysqlError, OkPacket } from "mysql"
import validators from "./validators"
import CollectPackagesModel from "../../../models/warehouse/collectPackages/collectPackagesModel"
import auth, { Roles } from "../../../middlewares/auth"
import {
  CollectDetailsRow,
  CollectFilters,
  CollectItemRow,
  CollectRow,
  CollectTicketRow,
} from "../../../types/warehouse/collectPackages/collectPackages"
import checkIfCollectExists from "../../../helpers/collectPackages/checkIfCollectExists"
import getWaybillsFromCollect from "../../../helpers/collectPackages/getWaybillsFromCollect"
import changeWaybillStatus from "../../../helpers/waybills/changeStatus"
import endCollect from "../../../helpers/collectPackages/endCollect"
import changeTicketStaus from "../../../helpers/rma/changeTicketStatus"
import registerNewItem from "../../../helpers/items/registerNewItem"

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

  create = (req: Request<{}, {}, { refName: string }>, res: Response) => {
    const { error } = validators.create.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.Model.create(
      req.body.refName,
      (err: MysqlError, dbResult: OkPacket) => {
        if (err) {
          return throwGenericError(res, 500, err, err)
        }

        return res.status(200).json({ collectId: dbResult.insertId })
      }
    )
  }

  find = (req: Request<{}, {}, {}, CollectFilters>, res: Response) => {
    this.Model.find(req.query, (err: MysqlError, rows: CollectRow[]) => {
      if (err) {
        return throwGenericError(res, 500, err, err)
      }

      return res.status(200).json(rows)
    })
  }

  findOne = (req: Request<{ id: string }>, res: Response) => {
    if (isNaN(parseInt(req.params.id))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ID")
    }

    this.Model.findOne(
      Number(req.params.id),
      (err: MysqlError, rows: CollectDetailsRow[]) => {
        if (err) {
          return throwGenericError(res, 500, err, err)
        }

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
      }
    )
  }

  finalize = (req: Request, res: Response) => {
    if (isNaN(parseInt(req.params.id))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ID")
    }

    checkIfCollectExists(Number(req.params.id))
      .then((rows) => {
        if (rows.length === 0) {
          return throwGenericError(res, 404, "Brak odbioru o podanym ID")
        }

        if (rows[0].status === 2) {
          return throwGenericError(res, 400, "Podny odbiór został już odebrany")
        }

        getWaybillsFromCollect(Number(req.params.id)).then((items) => {
          for (let {
            waybill,
            ticket_id,
            barcode,
            device_cat,
            device_producer,
            device_sn,
          } of items) {
            changeWaybillStatus(waybill, "odebrany").then(() => {
              changeTicketStaus(ticket_id, 3).then(() => {
                registerNewItem({
                  ticket_id,
                  barcode,
                  device_producer,
                  device_cat,
                  device_sn,
                })
              })
            })
          }
        })
      })
      .then(() => {
        endCollect(Number(req.params.id))
          .then(() => res.status(200).json({}))
          .catch((error) => {
            throwGenericError(res, 500, error, error)
          })
      })
      .catch((error) => throwGenericError(res, 500, error, error))
  }

  addItem = (
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

    checkIfCollectExists(Number(req.params.id))
      .then((collections) => {
        if (collections.length === 0) {
          return throwGenericError(res, 404, "Brak odbioru o podanym ID")
        }

        if (collections[0].status === 2) {
          return throwGenericError(
            res,
            400,
            "Podany odbiór został już odebrany"
          )
        }

        this.Model.addItem(
          Number(req.params.id),
          req.body.waybill,
          (err: MysqlError | string, row: CollectTicketRow) => {
            if (err) {
              if (typeof err === "string") {
                return throwGenericError(res, 400, err)
              }
              return throwGenericError(res, 500, err, err)
            }

            return res.status(200).json({
              ticket_id: row.ticket_id,
              barcode: row.barcode,
              waybill: req.body.waybill,
            })
          }
        )
      })
      .catch((error) => throwGenericError(res, 500, error, error))
  }

  editItems = (
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

    checkIfCollectExists(Number(req.params.id))
      .then((rows) => {
        if (rows.length === 0) {
          return throwGenericError(res, 404, "Brak odbioru o podanym ID")
        }

        if (rows[0].status === 2) {
          return throwGenericError(
            res,
            400,
            "Podany odbiór został już odebrany"
          )
        }

        this.Model.editItems(
          Number(req.params.id),
          req.body,
          (err: MysqlError, items: string[]) => {
            if (err) {
              return throwGenericError(res, 500, err, err)
            }

            return res.status(200).json(items)
          }
        )
      })
      .catch((error) => throwGenericError(res, 500, error, error))
  }
}

export default CollectPackagesController
