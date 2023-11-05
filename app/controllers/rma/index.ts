import express, { Request, Response } from "express"
import throwGenericError from "../../helpers/throwGenericError"
import { MysqlError, OkPacket } from "mysql"
import validators from "./validators"
import RmaModel from "../../models/rma/rmaModel"
import auth, { Roles } from "../../middlewares/auth"
import {
  CreateReqBody,
  FilteredRow,
  Filters,
  UpdateTicketReqBody,
} from "../../types/rma/rmaTypes"
import checkIfTicketExists from "../../helpers/checkIfTicketExists"

class RmaController {
  public path = "/rma"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.post(
      `${this.path}/create`,
      auth(Roles["RmaCommon"]),
      this.create
    )

    this.router.get(this.path, auth(Roles["RmaCommon"]), this.find)

    this.router.put(
      `${this.path}/:ticketId`,
      auth(Roles["RmaCommon"]),
      this.editTicket
    )

    this.router.put(
      `${this.path}/register/:ticketId`,
      auth(Roles["RmaCommon"]),
      this.register
    )
  }

  private Model = new RmaModel()

  create = (req: Request<{}, {}, CreateReqBody>, res: Response) => {
    const { error } = validators.create.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.Model.create(req.body, (err: MysqlError, dbResult: OkPacket) => {
      if (err) {
        return throwGenericError(res, 500, err, err)
      }

      return res.status(200).json({ ticketId: dbResult.insertId })
    })
  }

  find = (req: Request<{}, {}, {}, Filters>, res: Response) => {
    this.Model.filter(req.query, (err: MysqlError, rows: FilteredRow[]) => {
      if (err) {
        return throwGenericError(res, 500, err, err)
      }

      return res.status(200).json(rows)
    })
  }

  editTicket = (
    req: Request<{ ticketId: string }, {}, UpdateTicketReqBody>,
    res: Response
  ) => {
    if (isNaN(parseInt(req.params.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    const { error } = validators.edit.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.Model.editTicket(
      Number(req.params.ticketId),
      req.body,
      (err: MysqlError, dbResult: OkPacket) => {
        if (err) {
          return throwGenericError(res, 500, err, err)
        }

        return res.status(200).json({})
      }
    )
  }

  register = (req: Request<{ ticketId: string }>, res: Response) => {
    if (isNaN(parseInt(req.params.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    checkIfTicketExists(Number(req.params.ticketId))
      .then((rows) => {
        if (rows.length === 0) {
          return throwGenericError(res, 404, "Brak zlecenia o podanym ID")
        }

        this.Model.register(
          Number(req.params.ticketId),
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

export default RmaController
