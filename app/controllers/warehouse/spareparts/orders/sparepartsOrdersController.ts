import express, { Request, Response } from "express"
import throwGenericError from "../../../../helpers/throwGenericError"
import { MysqlError, OkPacket } from "mysql"
import sparePartsOrdersModel from "../../../../models/warehouse/spareparts/orders/sparepartsOrdersModel"
import {
  addOrderBody,
  editOrderBody,
  editOrderStatusBody,
  find_reqQuery,
  orderData,
} from "../../../../types/warehouse/spareparts/sparepartsTypes"
import validators from "./validators"

class sparePartsOrdersController {
  public path = "/warehouse/spareparts/orders"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.post(this.path, this.createOrder)
    this.router.put(this.path, this.changeOrderStatus)
    this.router.put(`${this.path}/edit`, this.editOrder)
    this.router.get(`${this.path}/find`, this.findOrder)
  }

  private Model = new sparePartsOrdersModel()

  createOrder = (req: Request<{}, {}, addOrderBody>, res: Response) => {
    // recive {"supplier_id": INT, "exp_date": DATE}
    // return 400 if any of parameters is missing OR empty OR does not match regEX
    // return 404 if cannot find supplied_id
    // return 500 if there was DB error
    // return 200 with {"order_id": INT}

    const { error } = validators.createOrderBody.validate(req.body)

    if (error !== undefined)
      return throwGenericError(res, 400, error?.details[0].message)

    this.Model.createOrder(
      req.body.supplier_id,
      req.body.exp_date,
      (err: MysqlError | string, dbResult: OkPacket) => {
        if (err) {
          if (err === "404")
            return throwGenericError(res, 404, "Podany dostawca nie istnieje")

          return throwGenericError(res, 500, err, err)
        }

        return res.status(200).json({ order_id: dbResult.insertId })
      }
    )
  }

  changeOrderStatus = (
    req: Request<{}, {}, editOrderStatusBody>,
    res: Response
  ) => {
    // recive {"order_id": INT, "status": INT}
    // return 400 if any of parameters is missing OR empty OR does not match regEx
    // return 404 if cannot find specific order
    // return 500 if there was DB error
    // return 200 on success

    const { error } = validators.changeStatusBody.validate(req.body)

    if (error !== undefined)
      return throwGenericError(res, 400, error?.details[0].message)

    this.Model.changeOrderStatus(
      req.body.order_id,
      req.body.status,
      (err: MysqlError, dbResult: OkPacket) => {
        if (err) return throwGenericError(res, 500, err, err)
        return res.status(200).json({ message: "ok" })
      }
    )
  }

  editOrder = (req: Request<{}, {}, editOrderBody>, res: Response) => {
    // recive {"items": [{"amount": INT, "order_item_id": INT, "part_cat_id": INT}],
    // "orderData": {"expected_date": DATE, "part_order_id": INT, "status": INT, "supplier_id": INT}}
    // return 400 if part_order_id is missing
    // return 400 if any of parameters does not match regEx
    // return 400 if specified order is closed
    // return 404 if cannot find specified order
    // return 500 if there was DB error
    // return 200 on success

    const { error } = validators.editBody.validate(req.body)

    if (error !== undefined)
      return throwGenericError(res, 400, error?.details[0].message)

    this.Model.editOrder(
      req.body.items,
      req.body.orderData,
      (err: any, dbResult: any) => {
        if (err) {
          if (err === 404)
            return throwGenericError(res, 404, "Nieznaleziono zamówienia")
          if (err === 400)
            return throwGenericError(
              res,
              400,
              "Nie można edytować zakończonego zamówienia"
            )
          return throwGenericError(res, 500, err, err)
        }

        return res.status(200).json({ status: "ok" })
      }
    )
  }

  findOrder = (req: Request<{}, {}, {}, find_reqQuery>, res: Response) => {
    // recive any or all of params "partCatId": INT, "expDate": STRING, "status": INT
    // return 400 if none of params was passed
    // return 400 if any of passed params is in wrong format
    // return 404 if nothing was found
    // return 500 if there was a DB error
    // return 200 with [{"part_order_id": INT, "part_cat_id": INT, "amount": INT, "exp_date": STRING, "status": INT}]
    const { error } = validators.findOrderQuery.validate(req.query)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.Model.findOrder(req.query, (err: MysqlError, rows: orderData[]) => {
      if (err) {
        return throwGenericError(res, 500, err, err)
      }
      if (rows.length === 0) {
        return throwGenericError(
          res,
          404,
          "Nie znaleziono zamówień dla podnanych kryteriów"
        )
      }

      return res.status(200).json(rows)
    })
  }
}

export default sparePartsOrdersController
