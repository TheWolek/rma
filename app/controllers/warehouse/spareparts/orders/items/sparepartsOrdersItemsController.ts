import express, { Request, Response } from "express"
import throwGenericError from "../../../../../helpers/throwGenericError"
import { MysqlError, OkPacket } from "mysql"
import sparepartsOrdersItemsModel from "../../../../../models/warehouse/spareparts/orders/items/sparepartsOrdersItemsModel"
import validators from "./validators"
import {
  parsedOrderItem,
  addPart,
  removePart,
  setCodesItem,
} from "../../../../../types/warehouse/spareparts/sparepartsTypes"
import auth, { Roles } from "../../../../../middlewares/auth"

class sparePartsOrdersItemsController {
  public path = "/warehouse/spareparts/orders/items"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.get(
      this.path,
      auth(Roles.SparepartsOrders),
      this.getItemsFromOrder
    )
    this.router.post(
      `${this.path}/add`,
      auth(Roles.SparepartsOrders),
      this.addItemsToOrder
    )
    this.router.delete(
      `${this.path}/remove`,
      auth(Roles.SparepartsOrders),
      this.removePartsFromOrder
    )
    this.router.post(
      `${this.path}/codes`,
      auth(Roles.SparepartsOrders),
      this.setCodes
    )
  }

  private Model = new sparepartsOrdersItemsModel()

  getItemsFromOrder = (
    req: Request<{}, {}, {}, { order_id: string }>,
    res: Response
  ) => {
    const { error } = validators.orderIdQuery.validate(req.query)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.Model.getItems(
      Number(req.query.order_id),
      (err: MysqlError, rows: parsedOrderItem) => {
        if (err) {
          return throwGenericError(res, 500, err, err)
        }

        return res.status(200).json(rows)
      }
    )
  }

  addItemsToOrder = (req: Request<{}, {}, addPart>, res: Response) => {
    // recive {"order_id": INT, "part_cat_id": INT, "amount": INT}
    // return 400 if any of parameters is missing OR empty OR does not match regEx
    // return 404 if cannot find category
    // return 500 if there was an DB error
    // return 200 with {"order_item_id": INT}

    const { error } = validators.addPart.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.Model.addItems(
      req.body,
      (err: MysqlError | string, dbResult: OkPacket) => {
        if (err) {
          if (err.toString().includes("nie istnieje")) {
            return throwGenericError(res, 400, err)
          }
          return throwGenericError(res, 500, err, err)
        }

        return res.status(200).json({ order_item_id: dbResult.insertId })
      }
    )
  }

  removePartsFromOrder = (req: Request<{}, {}, removePart>, res: Response) => {
    // recive {"toDel": [INT, INT...]}
    // return 400 if no param was passed OR it was empty OR any of params in array does not match regEx
    // return 404 if cannot find any part
    // return 500 if there was an DB error
    // return 200 on success

    const { error } = validators.removePart.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.Model.removeItems(
      req.body.toDel,
      (err: MysqlError, dbResult: OkPacket) => {
        if (err) {
          return throwGenericError(res, 500, err, err)
        }
        return res.status(200).json({ affectedRows: dbResult.affectedRows })
      }
    )
  }

  setCodes = (req: Request<{}, {}, setCodesItem[]>, res: Response) => {
    // recive [{"item_id": INT, "codes": [STR, STR, ...], part_id: INT}, ...]
    // return 400 if any param is missing
    // return 400 if any param does not match regEx
    // return 500 if there was a DB error
    // return 200 on success

    const { error } = validators.setCode.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.Model.setCodes(req.body, (err: MysqlError, dbResult: OkPacket) => {
      if (err) {
        return throwGenericError(res, 500, err, err)
      }

      return res.status(200).json({ message: "ok" })
    })
  }
}

export default sparePartsOrdersItemsController
