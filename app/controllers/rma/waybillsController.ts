import express, { Request, Response } from "express"
import throwGenericError from "../../helpers/throwGenericError"
import { MysqlError, OkPacket } from "mysql"
import WaybillsModel from "../../models/rma/waybillsModel"
import auth, { Roles } from "../../middlewares/auth"
import {
  CreateWaybillBody,
  FindWaybillReqQuery,
  WaybillRow,
  EditWaybillBody,
} from "../../types/rma/rmaTypes"
import validators from "./validators"
import { checkIfWaybillExists } from "../../helpers/waybills/checkIfWaybillExists"

class RmaWaybillsController {
  public path = "/rma/waybills"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.get(this.path, auth(Roles["RmaCommon"]), this.find)
    this.router.post(this.path, auth(Roles["RmaCommon"]), this.create)
    this.router.put(`${this.path}/:id`, auth(Roles["RmaCommon"]), this.edit)
  }

  private Model = new WaybillsModel()

  find = (req: Request<{}, {}, {}, FindWaybillReqQuery>, res: Response) => {
    const isWaybillNumber =
      req.query.waybillNumber !== undefined &&
      req.query.waybillNumber !== null &&
      req.query.waybillNumber !== ""
    const isTicketId =
      req.query.ticketId !== undefined &&
      req.query.ticketId !== null &&
      req.query.ticketId !== ""

    if (isWaybillNumber && isTicketId) {
      return throwGenericError(res, 400, "Podaj tylko jeden z parametrów")
    }
    if (!isWaybillNumber && !isTicketId) {
      return throwGenericError(res, 400, "Podaj przynajmniej jeden parametr")
    }

    this.Model.find(req.query, (err: MysqlError, rows: WaybillRow[]) => {
      if (err) {
        return throwGenericError(res, 500, err, err)
      }

      return res.status(200).json(rows)
    })
  }

  create = (req: Request<{}, {}, CreateWaybillBody>, res: Response) => {
    const { error } = validators.createWaybill.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.Model.create(req.body, (err: MysqlError, dbResult: OkPacket) => {
      if (err) {
        return throwGenericError(res, 500, err, err)
      }

      return res.status(200).json({ id: dbResult.insertId })
    })
  }

  edit = (req: Request<{ id: string }, {}, EditWaybillBody>, res: Response) => {
    if (isNaN(parseInt(req.params.id))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola id")
    }

    const { error } = validators.editWaybill.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    checkIfWaybillExists(Number(req.params.id))
      .then((waybillRows) => {
        if (waybillRows.length === 0) {
          return throwGenericError(res, 404, "Brak listu o podanym ID")
        }

        this.Model.edit(
          Number(req.params.id),
          req.body,
          (err: MysqlError, dbResult: OkPacket) => {
            if (err) {
              return throwGenericError(res, 500, err, err)
            }

            return res.status(200).json({})
          }
        )
      })
      .catch((e) => throwGenericError(res, 500, e, e))
  }
}

export default RmaWaybillsController
