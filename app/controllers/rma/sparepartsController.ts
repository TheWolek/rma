import express, { Request, Response } from "express"
import throwGenericError from "../../helpers/throwGenericError"
import auth, { Roles } from "../../middlewares/auth"
import { MysqlError, OkPacket } from "mysql"
import RmaModel from "../../models/rma/rmaModel"
import sparepartsModel from "../../models/warehouse/spareparts/sparepartsModel"
import validators from "./validators"
import { PartRow } from "../../types/rma/rmaTypes"
import checkIfPartExists from "../../helpers/spareparts/checkIfPartExists"
import checkIfTicketExists from "../../helpers/rma/checkIfTicketExists"

class RmaSparepartsController {
  public path = "/rma/spareparts"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.post(
      `${this.path}/:ticketId`,
      auth(Roles["RmaCommon"]),
      this.usePart
    )

    this.router.get(
      `${this.path}/:ticketId`,
      auth(Roles["RmaCommon"]),
      this.getParts
    )
  }

  private Model = new RmaModel()

  private SparepartsModel = new sparepartsModel()

  usePart = (
    req: Request<{ ticketId: string }, {}, { code: string }>,
    res: Response
  ) => {
    if (isNaN(parseInt(req.params.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    const { error } = validators.usePart.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    checkIfTicketExists(Number(req.params.ticketId))
      .then((ticketRows) => {
        if (ticketRows.length === 0) {
          return throwGenericError(res, 404, "Brak zlecenia o podanym ID")
        }

        checkIfPartExists(req.body.code)
          .then((partRows) => {
            if (partRows.length === 0) {
              return throwGenericError(res, 404, "Brak części o podanym SN")
            }

            this.Model.usePart(
              Number(req.params.ticketId),
              req.body.code,
              (err: MysqlError, dbResult: OkPacket) => {
                if (err) {
                  return throwGenericError(res, 500, err, err)
                }

                this.SparepartsModel.usePart(
                  req.body.code,
                  (err: MysqlError, partResult: OkPacket) => {
                    if (err) {
                      return throwGenericError(res, 500, err, err)
                    }
                    return res.status(200).json({})
                  }
                )
              }
            )
          })
          .catch((e) => throwGenericError(res, 500, e, e))
      })
      .catch((e) => throwGenericError(res, 500, e, e))
  }

  getParts = (req: Request<{ ticketId: string }>, res: Response) => {
    if (isNaN(parseInt(req.params.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    this.Model.getParts(
      Number(req.params.ticketId),
      (err: MysqlError, rows: PartRow[]) => {
        if (err) {
          return throwGenericError(res, 500, err, err)
        }

        return res.status(200).json(rows)
      }
    )
  }
}

export default RmaSparepartsController
