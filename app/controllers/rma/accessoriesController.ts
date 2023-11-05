import express, { Request, Response } from "express"
import throwGenericError from "../../helpers/throwGenericError"
import RmaModel from "../../models/rma/rmaModel"
import { MysqlError } from "mysql"
import validators from "./validators"
import auth, { Roles } from "../../middlewares/auth"
import { AccessoriesRow } from "../../types/rma/rmaTypes"

class RmaAccessoriesController {
  public path = "/rma/accessories"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.get(
      `${this.path}/:ticketId`,
      auth(Roles["RmaCommon"]),
      this.getAccessories
    )

    this.router.put(
      `${this.path}/:ticketId`,
      auth(Roles["RmaCommon"]),
      this.editAccessories
    )
  }

  private Model = new RmaModel()

  getAccessories = (req: Request<{ ticketId: string }>, res: Response) => {
    if (isNaN(parseInt(req.params.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    this.Model.getAccessories(
      Number(req.params.ticketId),
      (err: MysqlError, rows: AccessoriesRow[]) => {
        if (err) {
          return throwGenericError(res, 500, err, err)
        }

        return res.status(200).json(rows)
      }
    )
  }

  editAccessories = (
    req: Request<{ ticketId: string }, {}, { deviceAccessories: number[] }>,
    res: Response
  ) => {
    if (isNaN(parseInt(req.params.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    const { error } = validators.editAccessories.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.Model.editAccessories(
      Number(req.params.ticketId),
      req.body.deviceAccessories,
      (err: MysqlError, dbResult: boolean) => {
        if (err) {
          return throwGenericError(res, 500, err, err)
        }

        return res.status(200).json({})
      }
    )
  }
}

export default RmaAccessoriesController
